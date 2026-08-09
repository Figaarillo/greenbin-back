# Propuesta 11 — Herramientas para la Entidad (Municipio)

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Medio-Alto (2-3 sprints, ver desglose por ítem)
> **Dependencias:** Notificaciones (#01) para 2.1

## 1. Problema

La entidad es el rol con más responsabilidad operativa (gestiona puntos verdes, categorías, responsables, y supervisa locales y vecinos) pero, verificado contra el código actual, es también el rol con menos herramientas de gestión proactiva:

1. **Cero notificaciones.** `notification.route.ts` excluye a `ENTITY` explícitamente de `NOTIFIABLE_ROLES` ("Entidad queda afuera a propósito"). No se entera si un punto verde lleva días sin entregas, ni de nada que pase en su municipio sin entrar a mirar el dashboard.
2. **El alta de un local es 100% self-serve, sin revisión.** Verificado en `reward-partner.entity.ts` y `register.usecase.ts`: no existe ningún campo de estado (`approved`/`pending`/`verified`). Un local se registra con OTP de email + validación de CUIT/AFIP y sus cupones quedan visibles en el catálogo sin que la entidad los revise.
3. **No hay exportación de reportes.** Las 4 estadísticas agregadas (`total-recycled`, `green-points-ranking`, `waste-by-category`, `waste-by-period`) solo se consumen en pantalla — para rendir cuentas ante el municipio o la comunidad, hoy no hay forma de sacar un CSV/PDF.

## 2. Solución Propuesta

### 2.1 Notificaciones para Entidad

Extender `NOTIFIABLE_ROLES` en `notification.route.ts` para incluir `Roles.ENTITY`, y agregar categorías nuevas orientadas a supervisión (no a transacciones individuales, que generarían demasiado ruido):

```typescript
// notification-category.enum.ts, nuevas categorías:
GREEN_POINT_INACTIVE      // sin entregas registradas en N días (job diario, similar
                           // al que necesita #01 de vencimiento de cupones)
REWARD_PARTNER_PENDING    // nuevo local esperando aprobación (ver 2.2)
GREEN_POINT_NEAR_CAPACITY // ver #03 §2.7, cuando currentLoadKg cruza el umbral
```

Reutiliza integramente la infraestructura de `NotificationDispatcher`/`NotificationPreferenceEntity` ya construida — el trabajo es agregar `ENTITY` al array de roles permitidos y disparar estos tres eventos desde sus puntos de origen (un job diario para las dos primeras, el use case de entrega para la tercera).

### 2.2 Aprobación de Locales

```typescript
// Extensión a RewardPartnerEntity existente:
// @Enum(() => PartnerApprovalStatus)
// approvalStatus: PartnerApprovalStatus = PartnerApprovalStatus.PENDING

enum PartnerApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

```typescript
// Nuevos endpoints (solo ENTITY):
PUT /api/reward-partner/:id/approve
PUT /api/reward-partner/:id/reject   // body: { reason: string }

// ListAvailableCouponUseCase (catálogo del vecino) suma un join implícito:
// solo muestra cupones de reward-partners con approvalStatus = APPROVED
```

**Importante — compatibilidad hacia atrás:** todos los reward-partners existentes en producción deben migrarse con `approvalStatus = APPROVED` (no `PENDING`), para no des-listar de un día para el otro locales que ya venían operando. Solo los registros NUEVOS post-migración arrancan en `PENDING`.

El flujo de registro (`register.usecase.ts`) no cambia — el local se sigue registrando solo con OTP+CUIT. Lo único que cambia es que sus cupones no aparecen en el catálogo del vecino hasta que la entidad lo apruebe, y se dispara `REWARD_PARTNER_PENDING` (2.1) a la entidad al registrarse.

### 2.3 Exportación de Reportes

```typescript
// Nuevos endpoints (solo ENTITY), reutilizan los use cases de statistics existentes:
GET /api/statistics/entity/:entityId/export?format=csv&from=...&to=...
GET /api/statistics/entity/:entityId/export?format=pdf&from=...&to=...
```

```typescript
// src/statistics/application/usecases/export-report.usecase.ts
class ExportReportUseCase {
  constructor(
    // Reutiliza los mismos 4 use cases que ya alimentan entidad-dashboard,
    // no duplica lógica de agregación:
    private readonly getTotalRecycled: GetTotalRecycledUseCase,
    private readonly getGreenPointsRanking: GetGreenPointsRankingUseCase,
    private readonly getWasteByCategory: GetWasteByCategoryUseCase,
    private readonly getWasteByPeriod: GetWasteByPeriodUseCase
  ) {}

  async exec(entityId: string, format: 'csv' | 'pdf', from?: Date, to?: Date): Promise<Buffer> {
    // Junta los 4 resultados en un único reporte tabular/documento
  }
}
```

CSV es trivial (no requiere dependencia nueva, es texto plano formateado). PDF sí requiere elegir una librería (ej. `pdfkit`, liviana y sin dependencias nativas) — si el esfuerzo de PDF resulta alto, se puede lanzar solo con CSV en la v1 y agregar PDF después.

## 3. Consideraciones Técnicas

1. **2.1** es bajo esfuerzo (reutiliza infraestructura), pero los jobs diarios de `GREEN_POINT_INACTIVE` comparten el mismo mecanismo de scheduling que necesita la notificación de vencimiento de cupones — conviene construir un único "runner" de jobs diarios reutilizable en vez de un `setInterval` por feature.
2. **2.2** es el ítem de mayor riesgo: toca el flujo de alta de locales y el catálogo del vecino. Requiere migración de datos cuidadosa (ver nota de compatibilidad arriba) y comunicación clara a los locales existentes de que nada cambia para ellos.
3. **2.3** de esfuerzo medio si se limita a CSV; alto si se incluye PDF con diseño prolijo.

## 4. Integración con Otras Propuestas

- **Notificaciones (#01)**: 2.1 extiende el sistema ya construido a un cuarto rol.
- **Franjas Horarias / Capacidad (#03)**: `GREEN_POINT_NEAR_CAPACITY` depende de que exista `currentLoadKg` (§2.7 de esa propuesta).
- **Economía de Puntos (#08)**: si esa propuesta agrega reportes de "float" de puntos emitidos vs. canjeados, debería sumarse como una sección más del reporte exportable de 2.3, no como un exportador aparte.
