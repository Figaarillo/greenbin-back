# Propuesta 02 — Gamificación para Vecinos

> **Prioridad sugerida:** Alta
> **Esfuerzo estimado:** Alto (2-3 sprints)
> **Dependencias:** Timeline (#07) — recomendada como base de datos de eventos

## 1. Problema

El sistema actual recompensa con puntos canjeables, pero no hay elementos de juego que:

- Motiven la participación frecuente
- Reconozcan hitos importantes
- Generen competencia sana entre vecinos
- Fidelicen a los vecinos a largo plazo

La gamificación ataca directamente la retención y la frecuencia de participación.

## 2. Solución Propuesta

Sistema de gamificación con 3 pilares: **Niveles**, **Logros (Badges)**, **Rankings**, y **Desafíos**.

### 2.1 Arquitectura

```
┌─────────────────┐
│  Eventos        │  (waste-transaction, coupon-transaction, etc.)
└────────┬────────┘
         │ dispara
         ▼
┌─────────────────────────────────────┐
│  Gamification Engine                │
│  ├─ LevelSystem                     │
│  ├─ AchievementSystem               │
│  ├─ ChallengeSystem                 │
│  └─ RankingSystem                   │
└────────┬────────────────────────────┘
         │ lee/escribe
         ▼
┌─────────────────────────────────────┐
│  Tablas de gamificación             │
│  (nuevo módulo: gamification)       │
└─────────────────────────────────────┘
```

### 2.2 Modelo de Datos

```typescript
// ==========================================
// Módulo: gamification (nuevo módulo completo)
// ==========================================

// ---------- NIVELES ----------

@Entity({ tableName: 'neighbor_levels' })
class NeighborLevelEntity extends BaseEntity {
  @ManyToOne()
  neighbor: NeighborEntity

  @ManyToOne()
  currentLevel: LevelEntity

  @Property()
  totalPointsEarned: number = 0 // puntos acumulados históricos (no se gastan)

  @Property()
  currentLevelPoints: number = 0 // puntos en el nivel actual

  @Property({ default: 1 })
  currentTier: number = 1 // 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Platinum
}

@Entity({ tableName: 'levels' })
class LevelEntity extends BaseEntity {
  @Property({ unique: true })
  name: string // ej: "Bronce I", "Plata II", "Oro III"

  @Property()
  tier: number // 1=Bronce, 2=Plata, 3=Oro, 4=Platino

  @Property()
  levelNumber: number // I, II, III dentro del tier

  @Property()
  pointsRequired: number // puntos necesarios para alcanzar este nivel

  @Property({ type: t.text, nullable: true })
  badgeUrl: string // URL del SVG del badge del nivel

  @Property({ type: t.json, nullable: true })
  benefits: {
    pointsMultiplier: number // ej: 1.0, 1.1, 1.25
    exclusiveChallenges: boolean
    specialBadge: boolean
  }
}

// Sistema de niveles:
// Bronce I (0 pts) → Bronce II (100) → Bronce III (300)
// → Plata I (600) → Plata II (1000) → Plata III (1500)
// → Oro I (2500) → Oro II (4000) → Oro III (6000)
// → Platino I (10000+)

// ---------- LOGROS / BADGES ----------

@Entity({ tableName: 'achievements' })
class AchievementEntity extends BaseEntity {
  @Property({ unique: true })
  code: string // ej: 'first_delivery', 'plastic_master', '100kg_recycled'

  @Property()
  name: string // ej: "Primera Entrega"

  @Property({ type: t.text })
  description: string // "Realizaste tu primera entrega de residuos"

  @Property({ type: t.text, nullable: true })
  iconUrl: string // URL del SVG del badge

  @Property()
  category: string // 'milestone' | 'category' | 'frequency' | 'social' | 'special'

  @Property({ type: t.json })
  criteria: {
    type: 'count' | 'accumulate' | 'streak' | 'category' | 'specific'
    target: number // ej: 1, 100 (kg)
    metric: string // ej: 'deliveries', 'recycled_kg', 'consecutive_weeks'
    categoryId?: string // para logros por categoría
    description: string // legible para humano: "Reciclá 100kg de plástico"
  }

  @Property({ default: 0 })
  pointsReward: number // puntos extra al desbloquear

  @Property({ default: true })
  isVisible: boolean // algunos logros pueden ser secretos
}

// Logros propuestos iniciales:
// ┌────────────────────────┬──────────────────────────────────┬────────────┐
// │ Código                 │ Nombre                          │ Criterio   │
// ├────────────────────────┼──────────────────────────────────┼────────────┤
// │ first_delivery         │ "Primer Paso"                   │ 1 entrega  │
// │ ten_deliveries         │ "Vecino Reciclador"             │ 10 entregas│
// │ fifty_deliveries       │ "Campeón del Reciclaje"         │ 50 entregas│
// │ hundred_deliveries     │ "Leyenda Verde"                 │ 100 entreg.│
// │ plastic_master         │ "Maestro del Plástico"          │ 50kg plást.│
// │ paper_master           │ "Guardián del Papel"            │ 50kg papel │
// │ glass_master           │ "Arte del Vidrio"               │ 50kg vidrio│
// │ metal_master           │ "Señor del Metal"               │ 50kg metal │
// │ first_coupon           │ "Canje Inaugural"               │ 1 cupón    │
// │ streak_4weeks          │ "Racha Verde"                   │ 4 sem conv.│
// │ streak_8weeks          │ "Compromiso Ambiental"          │ 8 sem conv.│
// │ co2_10kg               │ "Planeta Agradecido"            │ 10kg CO₂   │
// │ co2_100kg              │ "Héroe del Clima"               │ 100kg CO₂  │
// │ refer_friend           │ "Embajador Verde"               │ 1 referido │
// └────────────────────────┴──────────────────────────────────┴────────────┘

@Entity({ tableName: 'neighbor_achievements' })
class NeighborAchievementEntity extends BaseEntity {
  @ManyToOne()
  neighbor: NeighborEntity

  @ManyToOne()
  achievement: AchievementEntity

  @Property()
  unlockedAt: Date

  @Property({ default: false })
  notified: boolean // ya se le notificó al vecino?
}

// ---------- DESAFÍOS ----------

@Entity({ tableName: 'challenges' })
class ChallengeEntity extends BaseEntity {
  @Property()
  name: string // "Semana del Plástico"

  @Property({ type: t.text })
  description: string // "Reciclá 5kg de plástico esta semana"

  @Property({ type: t.json })
  objective: {
    type: 'weight' | 'deliveries' | 'category_weight' | 'streak'
    target: number
    categoryId?: string
  }

  @Property()
  pointsReward: number // puntos al completar

  @Property({ type: t.text, nullable: true })
  badgeReward: string // badge opcional

  @Property()
  startsAt: Date

  @Property()
  endsAt: Date

  @Property({ default: true })
  isActive: boolean
}

@Entity({ tableName: 'neighbor_challenges' })
class NeighborChallengeEntity extends BaseEntity {
  @ManyToOne()
  neighbor: NeighborEntity

  @ManyToOne()
  challenge: ChallengeEntity

  @Property({ default: 0 })
  progress: number // 0.0 a 1.0

  @Enum(() => ChallengeStatus)
  status: ChallengeStatus = ChallengeStatus.IN_PROGRESS

  @Property({ nullable: true })
  completedAt: Date
}

enum ChallengeStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

// ---------- RANKING (vistas materializadas) ----------

// No necesita tabla propia. Se calcula desde neighbor_levels.
// Opcional: cachear en Redis o tabla de materialized views.
```

### 2.3 Motor de Gamificación

```typescript
// src/gamification/application/services/gamification-engine.service.ts

class GamificationEngine {
  // Se llama desde un evento, ej: después de registrar una entrega
  async processEvent(event: GamificationEvent): Promise<void> {
    const results = {
      leveledUp: false,
      newAchievements: [],
      challengesUpdated: [],
      newRanking: null,
    }

    // 1. Niveles: actualizar puntos acumulados y verificar si sube de nivel
    results.leveledUp = await this.levelSystem.processPoints(event.neighborId, event.points)

    // 2. Logros: evaluar criterios contra el historial del vecino
    results.newAchievements = await this.achievementSystem.evaluate(event.neighborId, event)

    // 3. Desafíos: actualizar progreso en desafíos activos
    results.challengesUpdated = await this.challengeSystem.updateProgress(event.neighborId, event)

    // 4. Si hay novedades, disparar notificaciones
    if (results.leveledUp || results.newAchievements.length > 0) {
      await this.notificationService.sendAchievementUnlocked(...)
    }
  }
}
```

### 2.4 Puntos de Integración

| Módulo existente     | Evento a conectar                                              |
| -------------------- | -------------------------------------------------------------- |
| `waste-transaction`  | Después de registrar delivery → procesar puntos, kg, categoría |
| `coupon-transaction` | Después de adquirir cupón → logro first_coupon                 |
| `neighbor`           | Al registrar vecino → no dispara nada aún                      |
| `notification` (#01) | Recibe eventos de logro desbloqueado para notificar            |

### 2.5 Rankings

```typescript
// Endpoints de ranking

GET /api/gamification/ranking?period=weekly|monthly|alltime&limit=10&entityId=xxx
→ {
    rankings: [
      { position: 1, neighbor: { id, name, avatar }, points: 5000, level: "Oro III" },
      ...
    ],
    myPosition: { position: 15, points: 1200 }
  }

GET /api/gamification/ranking/green-point/:greenPointId
→ Ranking por punto verde específico
```

**Consideraciones de performance:**

- Calcular rankings con una periodicidad fija (ej: cada 1 hora) y cachear
- O usar una **vista materializada** en PostgreSQL actualizada periódicamente
- No calcular en tiempo real en cada request

### 2.6 Beneficios por Nivel Propuestos

| Nivel   | Multiplicador de puntos | Badge especial | Desafíos exclusivos | Reconocimiento                 |
| ------- | ----------------------- | -------------- | ------------------- | ------------------------------ |
| Bronce  | 1.0×                    | No             | No                  | -                              |
| Plata   | 1.1×                    | No             | No                  | -                              |
| Oro     | 1.25×                   | Sí             | Sí                  | Mención en dashboard           |
| Platino | 1.5×                    | Sí (animado)   | Sí                  | Perfil destacado + certificado |

### 2.7 Endpoints

```typescript
// === API de Gamificación ===

// Perfil de gamificación del vecino
GET /api/gamification/neighbor/:neighborId/profile
→ { level: "Oro II", totalPoints: 4500, achievements: 12, challenges: 3 }

// Logros del vecino
GET /api/gamification/neighbor/:neighborId/achievements
→ [{ code: "first_delivery", name: "Primer Paso", unlockedAt: "..." }, ...]

// Desafíos activos
GET /api/gamification/neighbor/:neighborId/challenges
→ [{ name: "Semana del Plástico", progress: 0.6, endsAt: "..." }, ...]

// Ranking global (de la entity)
GET /api/gamification/entity/:entityId/ranking?period=monthly

// Administración de logros (solo Entity)
POST /api/gamification/achievements    // crear logro
PUT /api/gamification/achievements/:id // actualizar
DELETE /api/gamification/achievements/:id // desactivar

// Administración de desafíos (solo Entity)
POST /api/gamification/challenges
PUT /api/gamification/challenges/:id
DELETE /api/gamification/challenges/:id
```

### 2.8 Assets necesarios (SVGs vectoriales)

Para los badges de logros y niveles se necesitan SVGs:

```
assets/gamification/
├── levels/
│   ├── bronze-I.svg
│   ├── bronze-II.svg
│   ├── bronze-III.svg
│   ├── silver-I.svg
│   ├── silver-II.svg
│   ├── silver-III.svg
│   ├── gold-I.svg
│   ├── gold-II.svg
│   ├── gold-III.svg
│   └── platinum.svg
├── achievements/
│   ├── first-delivery.svg
│   ├── plastic-master.svg
│   ├── paper-master.svg
│   ├── glass-master.svg
│   ├── metal-master.svg
│   ├── streak-4weeks.svg
│   ├── co2-hero.svg
│   └── ...
└── challenges/
    ├── weekly-plastic.svg
    └── ...
```

Estilo sugerido: Vectoriales planos, 2-3 colores, diseño limpio (tipo Duolingo o Fitbit). No necesitan ser complejos — un ícono representativo + el nombre del nivel/logro.

### 2.9 Consideraciones Técnicas

1. **Performance de evaluación de logros**: No evaluar TODOS los logros en cada evento. Usar un sistema de triggers condicionales (ej: solo evaluar logros de categoría si el evento incluye esa categoría).
2. **Caching de niveles**: Los niveles son estáticos, se pueden cachear en memoria.
3. **Atomicidad**: La actualización de puntos + niveles debe ser transaccional.
4. **Backfill**: Al implementar, calcular niveles/logros iniciales para vecinos existentes basado en su historial de transacciones.
5. **Notificaciones**: Cada logro/nivel nuevo debe disparar notificación (#01).

---

## 3. Integración con Otras Propuestas

- **Notificaciones (#01)**: Dispara emails al desbloquear logros/subir de nivel
- **Timeline (#07)**: Cada logro/nivel/desafío se registra en el timeline
- **Catálogo Educativo (#04)**: Desafíos pueden ser temáticos ("Esta semana: aprendé a reciclar electrónicos")
- **Filtro Geográfico (#06)**: Rankings por zona/área geográfica
