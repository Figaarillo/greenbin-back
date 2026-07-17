# Propuesta 09 — Reserva de Turnos en GreenPoints

> **Prioridad sugerida:** Media
> **Esfuerzo estimado:** Medio (1-2 sprints)
> **Dependencias:** Franjas Horarias en GreenPoints (#03)

## 1. Problema

Hoy un vecino que quiere entregar residuos tiene que ir físicamente a un punto verde, sin saber si hay cola, si el responsable está disponible en ese momento, o si el punto puede absorber el volumen que trae. Del lado del responsable, no hay forma de anticipar cuánta gente va a venir en una franja horaria — se entera cuando la persona ya está parada enfrente.

Esto genera dos fricciones concretas:

- El vecino pierde viajes (va y no hay nadie, o hay cola larga).
- El responsable no puede planificar su jornada ni el espacio de almacenamiento disponible.

## 2. Solución Propuesta

Sistema de reserva de turnos por punto verde, apoyado en las franjas horarias de la propuesta #03 (un turno solo puede reservarse dentro de un horario en que el punto está abierto).

### 2.1 Modelo de Datos

```typescript
// Nuevo módulo: appointment (o green-point-appointment)

@Entity({ tableName: 'green_point_appointments' })
class GreenPointAppointmentEntity extends BaseEntity {
  @ManyToOne()
  greenPoint: GreenPointEntity

  @ManyToOne()
  neighbor: NeighborEntity

  @Property()
  scheduledAt: Date // fecha + hora de inicio del turno

  @Property()
  durationMinutes: number = 15 // duración estimada, configurable por punto verde

  @Enum(() => AppointmentStatus)
  status: AppointmentStatus = AppointmentStatus.PENDING

  @Property({ nullable: true })
  estimatedWeightKg: number // lo que el vecino declara que va a traer, opcional

  @Property({ type: t.text, nullable: true })
  cancelReason: string
}

enum AppointmentStatus {
  PENDING = 'pending', // reservado, todavía no llegó
  COMPLETED = 'completed', // se presentó y se registró la entrega (waste-transaction asociada)
  NO_SHOW = 'no_show', // pasó la hora y no se presentó
  CANCELLED = 'cancelled' // cancelado por el vecino o el responsable
}

// Extensión a GreenPointEntity existente:
// @Property({ nullable: true })
// maxAppointmentsPerSlot: number  // cuántos turnos simultáneos admite (default 1)
```

### 2.2 Endpoints

```typescript
// === VECINO ===
GET  /api/green-point/:greenPointId/available-slots?date=2026-08-01
→ { slots: [{ start: "08:00", end: "08:15", available: true }, ...] }
// calculado a partir de GreenPointScheduleEntity (#03) menos los slots ya
// ocupados hasta maxAppointmentsPerSlot

POST /api/appointments
→ { greenPointId, scheduledAt, estimatedWeightKg? }

GET  /api/appointments/mine
PUT  /api/appointments/:id/cancel

// === RESPONSABLE ===
GET  /api/green-point/:greenPointId/appointments?date=2026-08-01
→ lista de turnos del día, para planificar

PUT  /api/appointments/:id/no-show
// el responsable la marca si el vecino no se presentó pasado un margen
```

### 2.3 Lógica de Negocio

```typescript
// src/appointment/application/usecases/create-appointment.usecase.ts

class CreateAppointmentUseCase {
  async exec(payload: CreateAppointmentPayload): Promise<GreenPointAppointmentEntity> {
    // 1. Validar que scheduledAt cae dentro de un horario abierto (#03:
    //    GetGreenPointStatusUseCase / GreenPointScheduleEntity)
    // 2. Validar que no supera maxAppointmentsPerSlot para ese greenPoint+slot
    // 3. Crear el turno en PENDING
    // 4. Notificar al responsable del punto verde (nueva categoría
    //    APPOINTMENT_CREATED, ver #01) y confirmar al vecino
  }
}
```

Al registrar la entrega real (`register-waste-delivery.usecase.ts`, ya existente), si el vecino tenía un turno `PENDING` para ese punto verde en el rango horario actual, se lo pasa automáticamente a `COMPLETED` — la reserva no bloquea la entrega libre (un vecino sin turno sigue pudiendo entregar si el responsable lo atiende), solo la organiza.

### 2.4 Integración con lo Existente

- Depende de **Franjas Horarias (#03)**: sin horarios definidos, no hay grilla de turnos para ofrecer — el punto verde queda con reserva deshabilitada hasta que tenga al menos un `GreenPointScheduleEntity`.
- Se integra con `waste-transaction`: `register-waste-delivery.usecase.ts` gana un paso opcional de "cerrar turno pendiente" sin cambiar su contrato actual (el turno es metadata, no un prerequisito).
- Se integra con **Notificaciones (#01)**: nuevas categorías `APPOINTMENT_CREATED` (al responsable), `APPOINTMENT_REMINDER` (al vecino, recordatorio 1h antes) y `APPOINTMENT_CANCELLED`.
- No modifica el flujo de entrega sin turno — es aditivo, un vecino que nunca reserva no ve ningún cambio.

### 2.5 Consideraciones Técnicas

1. **No-show**: si nadie marca el turno como `NO_SHOW`, un job diario lo hace automáticamente pasado un margen (ej. 30 min después del `scheduledAt`), para no dejar slots fantasma bloqueando la grilla.
2. **Concurrencia**: dos vecinos reservando el mismo slot límite al mismo tiempo — usar una constraint a nivel DB (o transacción con lock) sobre el conteo de turnos `PENDING`/`COMPLETED` por slot, no solo validación en el use case.
3. **Cancelación tardía**: definir si hay una ventana mínima para cancelar sin penalidad (fuera de alcance de la v1, dejar como futura extensión).
4. **Testing**: bordes de fin de horario (turno que empieza 10 min antes del cierre pero dura 15), timezone (igual que #03, todo en UTC y se convierte en el front).

### 2.6 Futuras Extensiones

- Penalización/prioridad para vecinos con historial de `NO_SHOW` reiterado.
- Turnos recurrentes (mismo vecino, mismo día de la semana).
- Vista de ocupación semanal para el responsable (heatmap de demanda por franja).

---

## 3. Integración con Otras Propuestas

- **Franjas Horarias (#03)**: prerrequisito duro — la grilla de turnos se construye sobre los horarios ahí definidos.
- **Notificaciones (#01)**: nuevas categorías de recordatorio y confirmación.
- **Timeline (#07)**: registrar creación/cancelación/no-show de turnos como eventos del historial del vecino.
