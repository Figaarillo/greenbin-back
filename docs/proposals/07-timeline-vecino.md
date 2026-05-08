# Propuesta 07 — Timeline de Actividad del Vecino

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Bajo (1 sprint)
> **Dependencias:** Ninguna (pero se potencia con #01, #02, #04, #06)

## 1. Problema

Hoy no hay forma de que un vecino vea su historial completo de actividad. Puede consultar transacciones de residuos por separado, y transacciones de cupones por separado, pero no hay una vista unificada de:

- Cuándo entregó residuos y cuántos puntos ganó
- Qué cupones canjeó y cuándo se usaron/vencieron
- Cuándo subió de nivel (gamificación)
- Qué logros desbloqueó
- Notificaciones que recibió

## 2. Solución Propuesta

Sistema de timeline o feed de actividad, donde cada evento relevante genera una entrada en el timeline del vecino.

### 2.1 Modelo de Datos

```typescript
// Módulo: timeline (nuevo módulo)
// O se integra dentro del módulo neighbor

@Entity({ tableName: 'neighbor_timeline' })
class NeighborTimelineEntity extends BaseEntity {
  @ManyToOne()
  neighbor: NeighborEntity

  @Enum(() => TimelineEventType)
  eventType: TimelineEventType

  @Property({ type: t.text })
  title: string // "Entregaste 3kg de plástico"

  @Property({ type: t.text, nullable: true })
  description: string // "Ganaste 30 puntos. Total acumulado: 1,200 pts"

  @Property({ type: t.json, nullable: true })
  metadata: {
    points?: number
    weight?: number
    category?: string
    transactionId?: string
    couponId?: string
    couponCode?: string
    achievementCode?: string
    level?: string
    partnerName?: string
  }

  @Property()
  occurredAt: Date // cuándo ocurrió el evento real (no cuándo se creó el registro)

  @Property({ nullable: true })
  iconUrl: string // URL del SVG/ícono representativo del evento

  @Property({ default: false })
  isRead: boolean
}

enum TimelineEventType {
  // Transacciones de residuos
  WASTE_DELIVERY = 'waste_delivery',
  POINTS_EARNED = 'points_earned',

  // Cupones
  COUPON_ACQUIRED = 'coupon_acquired',
  COUPON_USED = 'coupon_used',
  COUPON_EXPIRED = 'coupon_expired',

  // Gamificación
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  CHALLENGE_COMPLETED = 'challenge_completed',

  // Sistema
  NOTIFICATION_SENT = 'notification_sent',
  PASSWORD_CHANGED = 'password_changed',
  PROFILE_UPDATED = 'profile_updated',

  // Educativo
  TIP_VIEWED = 'tip_viewed'
}
```

### 2.2 Puntos de Inserción en el Sistema

Cada módulo existente debe insertar en el timeline cuando ocurre un evento relevante:

```typescript
// En waste-transaction, después de registrar delivery:
await timelineRepository.save({
  neighborId: delivery.neighborId,
  eventType: 'waste_delivery',
  title: `Entregaste ${totalWeight}kg de residuos`,
  description: `Ganaste ${totalPoints} puntos. Categorías: ${categories.join(', ')}`,
  metadata: { points: totalPoints, weight: totalWeight, transactionId },
  occurredAt: new Date(),
  iconUrl: '/assets/timeline/delivery.svg'
})

// En coupon-transaction, al adquirir:
await timelineRepository.save({
  neighborId,
  eventType: 'coupon_acquired',
  title: `Canjeaste ${coupon.title}`,
  description: `Gastaste ${coupon.costInPoints} puntos. Válido hasta ${expirationDate}`,
  metadata: { couponId, couponCode, points: -coupon.costInPoints, partnerName },
  occurredAt: new Date(),
  iconUrl: '/assets/timeline/coupon.svg'
})

// En coupon-transaction, al usar/validar:
await timelineRepository.save({
  neighborId,
  eventType: 'coupon_used',
  title: `Usaste ${coupon.title} en ${partnerName}`,
  metadata: { couponId },
  occurredAt: new Date(),
  iconUrl: '/assets/timeline/coupon-used.svg'
})
```

### 2.3 Endpoints

```typescript
// Timeline del vecino (paginado, más recientes primero)
GET /api/neighbor/:neighborId/timeline?limit=20&offset=0&types=waste_delivery,coupon_acquired
→ {
    timeline: [
      {
        id: "uuid",
        eventType: "waste_delivery",
        title: "Entregaste 3kg de plástico",
        description: "Ganaste 30 puntos",
        metadata: { points: 30, weight: 3, category: "Plástico" },
        occurredAt: "2026-05-07T14:30:00Z",
        iconUrl: "/assets/timeline/delivery.svg",
        isRead: false
      },
      ...
    ],
    total: 150,
    hasMore: true
  }

// Marcar como leído
PATCH /api/neighbor/:neighborId/timeline/:entryId/read
PATCH /api/neighbor/:neighborId/timeline/read-all  // marcar todo como leído

// Contador de no leídos (para badge en frontend)
GET /api/neighbor/:neighborId/timeline/unread-count
→ { count: 5 }
```

### 2.4 Filtros

```typescript
GET /api/neighbor/:neighborId/timeline?
  types=waste_delivery,coupon_acquired  // filtrar por tipo de evento
  &from=2026-01-01                       // desde fecha
  &to=2026-05-07                         // hasta fecha
  &search=papel                          // búsqueda en title/description
  &minPoints=50                          // eventos con >=50 puntos
```

### 2.5 SVGs para Timeline

Cada tipo de evento debe tener un icono representativo:

```
assets/timeline/
├── delivery.svg             // bolsa de residuos / peso
├── points-earned.svg        // moneda / estrella
├── coupon-acquired.svg      // ticket / cupón
├── coupon-used.svg          // ticket marcado
├── coupon-expired.svg       // ticket vencido
├── level-up.svg             // flecha hacia arriba / escudo
├── achievement.svg          // trofeo / medalla
├── challenge-completed.svg  // check / bandera
├── password-changed.svg     // candado
├── profile-updated.svg      // usuario / edit
└── notification.svg         // campana
```

Mismos lineamientos de diseño: SVGs planos, 2-3 colores, viewBox 24x24 para compatibilidad con UI.

### 2.6 Consideraciones Técnicas

1. **Volumen de datos**: Un vecino activo puede generar ~50 eventos/mes. Con 1000 vecinos, ~60k eventos/año. PostgreSQL lo maneja sin problemas.
2. **Indexación**: Índice compuesto por `(neighbor_id, occurred_at DESC)`. Índice por `event_type` si se filtra mucho por tipo.
3. **Paginación**: Usar cursor-based (por `occurred_at + id`) en vez de offset para mejor performance con volúmenes grandes.
4. **Backfill**: Al implementar, generar eventos históricos desde transacciones existentes.
5. **Eliminación**: Política de retención (ej: mantener últimos 2 años de actividad).

### 2.7 Ejemplos Visuales

```
┌──────────────────────────────────────────────────┐
│  Actividad Reciente                        🔔 3  │
├──────────────────────────────────────────────────┤
│ 🏆  Desbloqueaste "Maestro del Plástico"        │
│     Hace 2 horas                                 │
├──────────────────────────────────────────────────┤
│ 🛒  Canjeaste "10% OFF en Carrefour"             │
│     Gastaste 200 pts · Válido hasta 14/05        │
│     Hace 1 día                                   │
├──────────────────────────────────────────────────┤
│ ♻️  Entregaste 3.5kg de residuos                 │
│     Ganaste 42 pts · Plástico + Vidrio           │
│     En Punto Verde Centro · Hace 2 días          │
├──────────────────────────────────────────────────┤
│ ⬆️  Subiste a nivel Plata I                      │
│     Multiplicador de puntos: 1.1×                │
│     Hace 5 días                                  │
├──────────────────────────────────────────────────┤
│ 🎫  Usaste "15% OFF en Farmacia del Pueblo"      │
│     Hace 1 semana                                │
└──────────────────────────────────────────────────┘
```

---

## 3. Integración con Otras Propuestas

El timeline es la **columna vertebral** que unifica todas las demás features. Cada propuesta escribe al timeline:

| Propuesta                     | Eventos en el timeline                                    |
| ----------------------------- | --------------------------------------------------------- |
| **Notificaciones (#01)**      | `notification_sent`                                       |
| **Gamificación (#02)**        | `level_up`, `achievement_unlocked`, `challenge_completed` |
| **GreenPoint Horarios (#03)** | No directamente (es más del lado del entity)              |
| **Catálogo Educativo (#04)**  | `tip_viewed` (cuando el vecino ve un tip)                 |
| **Seguridad Auth (#05)**      | `password_changed`                                        |
| **Filtro Geográfico (#06)**   | No directamente, pero se puede cruzar para mostrar        |
| **Notificaciones (#01)**      | Todas las notificaciones enviadas quedan registradas      |
