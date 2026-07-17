# Propuesta 10 — Herramientas para el Local (Reward Partner)

> **Prioridad sugerida:** Media
> **Esfuerzo estimado:** Medio (1-2 sprints, ver desglose por ítem)
> **Dependencias:** Notificaciones (#01) para 2.1

## 1. Problema

El local hoy puede crear cupones, validarlos y ver estadísticas de ROI bastante ricas (`get-reward-partner-stats.usecase.ts`: adquiridos, usados, expirados, vecinos únicos/nuevos, visitas promedio, desglose por cupón). Pero tiene tres huecos concretos, verificados contra el código actual:

1. **No se entera en tiempo real cuando le usan un cupón.** `use-coupon.usecase.ts` (canje físico en el local) solo notifica al vecino (`COUPON_REDEEMED`) — el local únicamente recibe `COUPON_PURCHASED` cuando alguien COMPRA el cupón con puntos, no cuando efectivamente lo presenta en el mostrador. El comercio no tiene señal de "entró un cliente ahora".
2. **Los cupones no tienen ventana temporal.** `CouponEntity` solo tiene `validDays` (contados desde la creación) — no se puede programar un cupón para arrancar en una fecha futura (ej. promo de fin de semana armada con anticipación).
3. **No hay forma de accionar sobre los datos de segmentación que las stats ya calculan.** `RewardPartnerStats` ya devuelve `newNeighbors` y `avgVisitsPerNeighbor` por cupón, pero esos números son solo lectura — no hay manera de dirigir un cupón a, por ejemplo, vecinos que no volvieron en 30 días.

## 2. Solución Propuesta

Tres mejoras independientes entre sí, se pueden priorizar por separado.

### 2.1 Notificación de Uso en Tiempo Real

```typescript
// src/coupon-transaction/application/usecases/use-coupon.usecase.ts
// Agregar, junto al dispatch existente de COUPON_REDEEMED al neighbor:

void this.notificationDispatcher.dispatch({
  recipientId: transaction.rewardPartner.id,
  recipientRole: Roles.REWARD_PARTNER,
  category: NotificationCategory.COUPON_USED_IN_STORE, // nueva categoría
  title: 'Cupón usado en tu local',
  body: `${transaction.neighbor.firstname} usó "${transaction.coupon.title}" recién.`,
  data: { transactionId: transaction.id }
})
```

Esfuerzo bajo: reutiliza el `NotificationDispatcher` existente (mismo punto de inserción que ya notifica al vecino en la misma función), solo agrega una categoría nueva al enum y un segundo `dispatch()`. No requiere mail (evento de alta frecuencia, sería spam) — solo in-app/push, igual que el criterio ya usado para `COUPON_CREATED` hacia vecinos.

### 2.2 Cupones con Ventana Temporal

```typescript
// Extensión a CouponEntity existente:
// @Property({ nullable: true })
// availableFrom: Date | null   // null = disponible desde que se crea, como hoy
//
// @Property({ nullable: true })
// availableUntil: Date | null  // null = usa validDays como hoy (comportamiento actual)
```

`ListAvailableCouponUseCase` (ya filtra por `isAvailable: true`) suma un filtro `availableFrom <= now <= (availableUntil ?? +Infinity)` — cambio acotado a esa query. Compatibilidad total con cupones existentes: campos nullable, si no se setean el cupón se comporta exactamente como hoy.

### 2.3 Segmentación Básica de Envío

```typescript
// Nuevo endpoint, solo REWARD_PARTNER sobre sus propios cupones:
POST /api/coupon/:id/notify-segment
Body: { segment: 'inactive_30d' | 'frequent' | 'all' }
```

```typescript
// src/coupon/application/usecases/notify-segment.usecase.ts
class NotifySegmentUseCase {
  async exec(couponId: string, rewardPartnerId: string, segment: Segment): Promise<number> {
    // 1. Traer vecinos de la entidad del local (mismo criterio que el fan-out
    //    de register-coupon.usecase.ts al crear el cupón)
    // 2. Filtrar según segmento, usando la misma lógica de "primera visita"
    //    que ya calcula getRewardPartnerStats (coupon-transaction.mikroorm.repository.ts)
    //    - inactive_30d: vecinos con al menos una transacción con este local,
    //      pero ninguna en los últimos 30 días
    //    - frequent: vecinos con avgVisitsPerNeighbor por encima de la media
    // 3. Dispatch de una notificación dirigida (categoría COUPON_CREATED
    //    reutilizada, o una nueva COUPON_PROMOTED) a cada vecino filtrado
    // 4. Devolver la cantidad de vecinos notificados (para feedback en el front)
  }
}
```

Este es el ítem de mayor esfuerzo de los tres — requiere la query de segmentación (puede apoyarse en la misma lógica SQL que ya existe en `getRewardPartnerStats` para "primera visita", extendida a "última visita").

## 3. Consideraciones Técnicas

1. **2.1** no tiene riesgo — reutiliza infraestructura 100% existente.
2. **2.2** es aditivo y no rompe nada — cupones sin las nuevas fechas siguen igual.
3. **2.3** necesita un límite de frecuencia (rate limit) para que un local no pueda mandar notificaciones dirigidas todos los días a la misma base de vecinos — sugerido: 1 envío de segmentación por cupón cada 7 días.

## 4. Integración con Otras Propuestas

- **Notificaciones (#01)**: 2.1 y 2.3 agregan categorías nuevas al mismo sistema ya construido.
- **Economía de Puntos (#08)**: si esa propuesta agrega algún concepto de "presupuesto" por local, 2.3 debería respetar ese límite también.
