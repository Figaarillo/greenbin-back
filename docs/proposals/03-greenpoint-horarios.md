# Propuesta 03 — Franjas Horarias en GreenPoints

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Bajo (1 sprint)
> **Dependencias:** Ninguna

## 1. Problema

Hoy un GreenPoint tiene nombre, dirección, coordenadas y teléfono. Pero no tiene:

- Horarios de atención
- Días de operación
- Estado (abierto/cerrado) en tiempo real
- Capacidad o límite de recepción

Un vecino puede llegar al punto verde y encontrarlo cerrado, o el responsable no está presente.

## 2. Solución Propuesta

Agregar un sistema de horarios semanales a los GreenPoints, con posibilidad de excepciones (feriados, mantenimiento).

### 2.1 Modelo de Datos

```typescript
// Extensión del módulo green-point existente

// ---------- HORARIOS REGULARES ----------

@Entity({ tableName: 'green_point_schedules' })
class GreenPointScheduleEntity extends BaseEntity {
  @ManyToOne()
  greenPoint: GreenPointEntity

  @Property()
  dayOfWeek: number // 0=Domingo, 1=Lunes... 6=Sábado

  @Property()
  opensAt: string // "08:00" (formato HH:mm, 24h)

  @Property()
  closesAt: string // "17:00"

  @Property({ default: true })
  isActive: boolean // permite desactivar un día específico temporalmente
}

// ---------- EXCEPCIONES (feriados, mantenimiento) ----------

@Entity({ tableName: 'green_point_exceptions' })
class GreenPointExceptionEntity extends BaseEntity {
  @ManyToOne()
  greenPoint: GreenPointEntity

  @Property()
  date: Date

  @Enum(() => ExceptionType)
  type: ExceptionType

  @Property({ type: t.text, nullable: true })
  reason: string // "Feriado nacional", "Mantenimiento programado"

  @Property({ nullable: true })
  alternativeOpensAt: string // si es MODIFIED, horario alternativo

  @Property({ nullable: true })
  alternativeClosesAt: string
}

enum ExceptionType {
  CLOSED = 'closed', // cerrado todo el día
  MODIFIED = 'modified' // horario especial
}

// ---------- EXTENSIÓN A GREENPOINT EXISTENTE ----------

// Se agrega a GreenPointEntity existente:
// @Property({ nullable: true })
// capacity: number         // capacidad máxima diaria en kg (opcional)
//
// @Property({ default: true })
// isActive: boolean = true // si el punto está operativo
```

### 2.2 Endpoints

```typescript
// === NUEVOS ENDPOINTS ===

// CRUD de horarios (solo Entity)
POST /api/green-point/:greenPointId/schedules
GET /api/green-point/:greenPointId/schedules
PUT /api/green-point/schedules/:scheduleId
DELETE /api/green-point/schedules/:scheduleId

// CRUD de excepciones (solo Entity)
POST /api/green-point/:greenPointId/exceptions
GET /api/green-point/:greenPointId/exceptions
DELETE /api/green-point/exceptions/:exceptionId

// === ENDPOINTS PÚBLICOS ===

// Estado actual del green point
GET /api/green-point/:greenPointId/status
→ {
    isOpen: true,
    nextSchedule: { dayOfWeek: 1, opensAt: "08:00", closesAt: "17:00" },
    todaySchedule: { opensAt: "08:00", closesAt: "17:00" } | null,
    exception: null | { type: "closed", reason: "Feriado" }
  }

// Horarios de la semana
GET /api/green-point/:greenPointId/schedule-week
→ {
    weekDays: [
      { day: 1, dayName: "Lunes", opensAt: "08:00", closesAt: "17:00" },
      { day: 2, dayName: "Martes", opensAt: "08:00", closesAt: "17:00" },
      ...
    ],
    exceptions: [
      { date: "2026-05-25", type: "closed", reason: "Feriado nacional" }
    ]
  }
```

### 2.3 Lógica de Negocio

```typescript
// src/green-point/application/usecases/get-green-point-status.usecase.ts

class GetGreenPointStatusUseCase {
  async exec(greenPointId: string): Promise<GreenPointStatus> {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const time = now.toTimeString().slice(0, 5) // "14:30"

    // 1. Verificar excepción del día
    const exception = await this.exceptionRepo.findByDate(greenPointId, now)
    if (exception?.type === 'closed') {
      return { isOpen: false, exception }
    }

    // 2. Verificar horario regular
    const schedule = await this.scheduleRepo.findByDay(greenPointId, dayOfWeek)
    if (!schedule || !schedule.isActive) {
      return { isOpen: false, todaySchedule: null }
    }

    const isOpen = time >= schedule.opensAt && time < schedule.closesAt
    return { isOpen, todaySchedule: schedule, exception }
  }
}
```

### 2.4 Integración con GreenPoint Existente

- El módulo `green-point` se extiende sin romper nada existente
- Los horarios son opcionales — green points sin horarios funcionan como hoy
- Seeders actualizados para incluir horarios de ejemplo
- El campo `isActive` se agrega a `GreenPointEntity` para poder desactivar puntos sin borrarlos

### 2.5 Seed Data (ejemplo)

```typescript
// GreenPoint "Punto Verde Centro"
// Lunes a Viernes: 08:00-17:00
// Sábados: 09:00-13:00
// Domingos: cerrado

// GreenPoint "Punto Verde Norte"
// Lunes a Sábados: 09:00-18:00
// Domingos: cerrado
// Excepción: 25/05 Feriado → cerrado
```

### 2.6 Consideraciones Técnicas

1. **Zona horaria**: Todos los horarios se guardan en UTC. El frontend debe convertir a la zona horaria local (Argentina -03:00).
2. **Validación**: `closesAt` debe ser después de `opensAt`. No debe haber superposición de horarios para un mismo día.
3. **Cache**: El status de "abierto/cerrado" se puede cachear 5 minutos.
4. **Testing**: Probar bordes como horario nocturno (ej: 22:00-02:00), green points 24h, cambios de día.

### 2.7 Futuras Extensiones

- **Capacidad por franja**: Límite de kg que puede recibir el punto en cada horario
- **Notificación de cierre no programado**: El entity puede marcar "cerrado hoy" y se notifica a vecinos (#01)
- **Turnos**: Integración con sistema de turnos/reservas
- **Historial**: Registrar cambios de horario para auditoría

---

## 3. Integración con Otras Propuestas

- **Timeline (#07)**: Registrar cambios de horario como eventos del sistema
- **Notificaciones (#01)**: Alertar a vecinos sobre cambios de horario o cierres
- **Reservas/Turnos (futuro)**: Los horarios son prerrequisito para sistema de turnos
