# Propuesta 01 — Sistema de Notificaciones

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Medio (1-2 sprints)
> **Dependencias:** Ninguna

## 1. Problema

Hoy el sistema no tiene forma de comunicarse proactivamente con los vecinos. Un vecino:

- No sabe cuándo le acreditaron puntos después de una entrega
- No sabe que un cupón está por vencer
- No sabe que hay nuevos cupones disponibles
- No recibe recordatorios para llevar residuos

La dependencia `nodemailer` ya está en `package.json` pero no se usa en ningún flujo.

## 2. Solución Propuesta

Sistema de notificaciones multicanal (fase inicial: email, fase futura: push).

### 2.1 Arquitectura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Use Case   │────>│ NotificationService │────>│ EmailProvider │
│  (dominio)  │     │  (aplicación)      │     │ (nodemailer)  │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Template    │
                    │  Engine      │
                    └──────────────┘
```

Principios:

- **Desacoplado**: El caso de uso de dominio dispara el evento, no envía el mail directamente
- **Fire-and-forget**: El envío es asíncrono, no bloquea la respuesta HTTP
- **Templates**: Los mensajes se renderizan desde templates (HTML + texto plano)

### 2.2 Modelo de Datos

```typescript
// Módulo: notification (nuevo módulo)

// src/notification/domain/entities/notification.entity.ts
@Entity({ tableName: 'notifications' })
class NotificationEntity extends BaseEntity {
  @ManyToOne()
  neighbor: NeighborEntity

  @Enum(() => NotificationType)
  type: NotificationType

  @Property({ type: t.text })
  title: string

  @Property({ type: t.text })
  body: string

  @Property({ type: t.json, nullable: true })
  metadata: Record<string, unknown> // datos adicionales ej: { transactionId, couponId }

  @Enum(() => NotificationChannel)
  channel: NotificationChannel

  @Enum(() => NotificationStatus)
  status: NotificationStatus = NotificationStatus.PENDING

  @Property({ nullable: true })
  sentAt: Date

  @Property({ nullable: true })
  readAt: Date // para futuro canal in-app
}

// Enums
enum NotificationType {
  POINTS_EARNED = 'points_earned',
  COUPON_EXPIRING = 'coupon_expiring',
  NEW_COUPONS = 'new_coupons',
  WELCOME = 'welcome',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked', // para gamificación
  DELIVERY_REMINDER = 'delivery_reminder'
}

enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app', // futuro
  PUSH = 'push' // futuro
}

enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read'
}
```

### 2.3 Eventos del Sistema (Dispatcher)

```typescript
// src/notification/application/events/notification-event.ts
interface NotificationEvent {
  type: NotificationType
  neighborId: string
  metadata: Record<string, unknown>
}

// Eventos que se disparan desde otros módulos:
// - WasteTransaction.register → POINTS_EARNED
// - CouponTransaction.acquire → COUPON_ACQUIRED
// - CouponTransaction → COUPON_USED (cuando el reward partner valida)
// - Schedule (cron) → COUPON_EXPIRING (cupones a 3 días de vencer)
```

### 2.4 Puntos de Integración en el Sistema Existente

| Módulo               | Evento a disparar                     | Dónde                                                              |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `waste-transaction`  | Vecino ganó puntos                    | En `register-waste-delivery.usecase.ts` después de calcular puntos |
| `coupon-transaction` | Vecino adquirió cupón                 | En el use case de adquirir cupón                                   |
| `coupon-transaction` | Cupón usado por reward partner        | En el use case de validar código                                   |
| Nuevo scheduler      | Cupón próximo a vencer (3 días antes) | TODO: cron job                                                     |
| Nuevo                | Bienvenida al registrarse             | En `neighbor` register                                             |

### 2.5 Templates de Email

```typescript
// src/notification/infrastructure/templates/

templates/
├── points-earned.html        // "¡Felicidades {name}! Ganaste {points} puntos por reciclar {weight}kg de {category}"
├── coupon-expiring.html      // "Tu cupón de {discount}% en {partner} vence el {date}"
├── welcome.html              // "Bienvenido a GreenBin, {name}!"
├── achievement-unlocked.html // "Desbloqueaste el logro: {achievement}"
└── partials/
    ├── header.html
    └── footer.html
```

Los templates deben funcionar tanto como HTML renderizado como texto plano (fallback).

### 2.6 Configuración

```env
# Nuevas variables de entorno
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@greenbin.com
SMTP_PASS=***
NOTIFICATIONS_FROM="GreenBin <no-reply@greenbin.com>"
NOTIFICATIONS_ENABLED=true
```

### 2.7 Consideraciones Técnicas

1. **Cola de envíos**: Para no ralentizar las requests, usar una cola en memoria (o mejor, Redis/Bull en el futuro). Inicialmente: procesar con `setImmediate()` o un worker simple.
2. **Rate limiting SMTP**: No mandar más de N emails por minuto para no caer en spam.
3. **Fallback texto plano**: Siempre generar versión texto plano además de HTML.
4. **Opt-out**: Incluir link para desuscribirse en cada email (requisito legal).
5. **Logs**: Registrar cada envío (éxito/fallo) para debugging.
6. **No bloquear respuestas HTTP**: El caso de uso nunca debe esperar a que el email se envíe.

### 2.8 Próximos Pasos (Futuro)

- **Notificaciones in-app**: Un badge en el perfil del vecino con notificaciones sin leer (requiere frontend)
- **Push notifications**: Via Firebase Cloud Messaging o similar (requiere app móvil)
- **WhatsApp / SMS**: Integración con Twilio para canales alternativos
- **Preferencias de notificación**: Que el vecino elija qué notificaciones recibir y por qué canal

---

## 3. Integración con Otras Propuestas

- Se integra con **Gamificación (#02)** para disparar `ACHIEVEMENT_UNLOCKED`
- Se integra con **Timeline (#07)** para registrar notificaciones enviadas en el timeline
- Se integra con **Catálogo Educativo (#04)** para enviar tips de reciclaje periódicos
