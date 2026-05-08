# Plan de Integración — GreenBin Evolución

> **Objetivo:** Coordinar la implementación de 7 propuestas de features, minimizando conflictos y maximizando el valor entregado en cada hito.
> **Fecha:** 2026-05-07

## 1. Mapa de Dependencias

```
                    ┌──────────────┐
                    │  Timeline    │ ←── Columna vertebral (recibe eventos de todos)
                    │  (#07)       │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐────────────────┐
          ▼                ▼                ▼                ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐
   │Notificaciones│  │ Gamificación │  │Seguridad │  │Cat. Educativo│
   │   (#01)     │  │    (#02)     │  │  (#05)   │  │    (#04)     │
   └─────────────┘  └──────────────┘  └──────────┘  └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Filtro Geogr. │
                    │    (#06)     │
                    └──────────────┘

Independientes: GreenPoint Horarios (#03)
```

**Leyenda:**

- Dependencia fuerte: B no puede arrancar sin A
- Dependencia débil: B se beneficia de A pero puede funcionar sin ella

## 2. Hitos Sugeridos

### Hito 1: Fundación (1 sprint)

_Propuestas que no dependen de nada y habilitan todo lo demás_

| Propuesta                     | Esfuerzo | Dependencias |
| ----------------------------- | -------- | ------------ |
| **Timeline (#07)**            | Bajo     | ─            |
| **GreenPoint Horarios (#03)** | Bajo     | ─            |
| **Seguridad Auth (#05)**      | Bajo     | ─            |

**Por qué primero:**

- Timeline es la columna vertebral. Implementarla primero significa que todas las features posteriores ya tienen dónde registrar eventos.
- GreenPoint Horarios es independiente y de bajo esfuerzo.
- Seguridad Auth es crítico y toca el core del sistema — mejor hacerlo antes de agregar más features.

**Riesgo:** Medio (toca auth, que es sensible). Requiere tests exhaustivos.

---

### Hito 2: Engagement (1-2 sprints)

_Features que incentivan la participación vecinal_

| Propuesta                    | Esfuerzo | Dependencias     |
| ---------------------------- | -------- | ---------------- |
| **Notificaciones (#01)**     | Medio    | Timeline (débil) |
| **Catálogo Educativo (#04)** | Medio    | ─                |

**Por qué segundo:**

- Notificaciones habilita la comunicación proactiva.
- Catálogo Educativo mejora la calidad de la separación de residuos.
- Ambos se integran naturalmente con Timeline.

**Riesgo:** Bajo. Notificaciones no toca lógica core de negocio. Catálogo extiende waste-category sin romper nada.

---

### Hito 3: Gamificación (2-3 sprints)

_Sistema completo de recompensas_

| Propuesta                   | Esfuerzo | Dependencias                              |
| --------------------------- | -------- | ----------------------------------------- |
| **Gamificación (#02)**      | Alto     | Timeline (fuerte), Notificaciones (débil) |
| **Filtro Geográfico (#06)** | Bajo     | ─                                         |

**Por qué tercero:**

- Gamificación requiere Timeline para persistir eventos y Notificaciones para comunicar logros.
- Filtro Geográfico es independiente y de bajo esfuerzo — se puede hacer en paralelo.

**Riesgo:** Medio-alto. Gamificación es el feature más complejo. Evaluación de logros en tiempo real requiere cuidado con performance.

---

## 3. Tabla de Esfuerzo Total Estimado

| Feature                   | Backend (días) | Tests (días) | Assets (días) | Total  |
| ------------------------- | -------------- | ------------ | ------------- | ------ |
| Timeline (#07)            | 2              | 2            | 0.5           | 4.5    |
| GreenPoint Horarios (#03) | 2              | 1.5          | 0             | 3.5    |
| Seguridad Auth (#05)      | 3              | 3            | 0             | 6      |
| Notificaciones (#01)      | 3              | 2            | 1             | 6      |
| Catálogo Educativo (#04)  | 2              | 1.5          | 2             | 5.5    |
| Gamificación (#02)        | 5              | 4            | 3             | 12     |
| Filtro Geográfico (#06)   | 2              | 1.5          | 0             | 3.5    |
| **Total**                 | **19**         | **15.5**     | **6.5**       | **41** |

_Nota: Días hábiles estimados. No incluye reviews ni imprevistos._

---

## 4. Conflictos y Riesgos

### 4.1 Conflictos de Código

| Módulo existente     | Propuestas que lo modifican | Riesgo de conflicto         |
| -------------------- | --------------------------- | --------------------------- |
| `waste-category`     | #04                         | Bajo (extensión de campos)  |
| `waste-transaction`  | #01, #02, #07               | Medio (puntos de inserción) |
| `coupon-transaction` | #01, #02, #07               | Medio (puntos de inserción) |
| `green-point`        | #03                         | Bajo (nuevas tablas)        |
| `auth`               | #05                         | Alto (modifica flujo core)  |
| `neighbor`           | #07, #02                    | Medio (nuevas relaciones)   |
| `reward-partner`     | #06                         | Bajo (nuevos endpoints)     |

### 4.2 Riesgos Técnicos

| Riesgo                                           | Impacto | Probabilidad | Mitigación                                |
| ------------------------------------------------ | ------- | ------------ | ----------------------------------------- |
| Refresh token rotation rompe sesiones existentes | Alto    | Media        | Migración gradual, tokens legacy conviven |
| Gamificación ralentiza transacciones             | Medio   | Baja         | Procesamiento asíncrono, eventos en cola  |
| PostGIS agrega complejidad a infraestructura     | Bajo    | Alta         | Tener plan B con Haversine                |
| Nodemailer sin cola bloquea requests             | Medio   | Media        | Worker separado o setImmediate() inicial  |

---

## 5. Orden Sugerido de Implementación

```
Sprint 1: Timeline (#07) + GreenPoint Horarios (#03)
Sprint 2: Seguridad Auth (#05)
Sprint 3: Notificaciones (#01)
Sprint 4: Catálogo Educativo (#04)
Sprint 5-6: Gamificación (#02)
Sprint 7: Filtro Geográfico (#06) + polish general
```

**Alternativa parallel-play:**
Si se dispone de más recursos, se pueden paralelizar:

- Dev A: Timeline + Notificaciones + Gamificación (secuencial)
- Dev B: Seguridad Auth + GreenPoint Horarios + Catálogo Educativo (independientes)
- Dev C: Filtro Geográfico (independiente)

---

## 6. Criterios para Decidir Siguiente Feature

Al evaluar qué construir después, considerar:

1. **Valor para el vecino**: ¿Mejora directamente su experiencia?
2. **Valor para la municipalidad**: ¿Ayuda a gestionar el programa?
3. **Esfuerzo**: ¿Cuántos sprints requiere?
4. **Dependencias**: ¿Bloquea otras features?
5. **Riesgo técnico**: ¿Puede romper algo existente?
6. **Cobertura de tests**: ¿Se puede testear adecuadamente?

### Scoring rápido

| Feature                   | Valor vecino | Valor municipio | Esfuerzo | Riesgo | Prioridad final |
| ------------------------- | ------------ | --------------- | -------- | ------ | --------------- |
| Timeline (#07)            | ⭐⭐⭐⭐     | ⭐⭐⭐          | Bajo     | Bajo   | **🥇**          |
| GreenPoint Horarios (#03) | ⭐⭐⭐       | ⭐⭐⭐⭐⭐      | Bajo     | Bajo   | **🥇**          |
| Seguridad (#05)           | ⭐⭐         | ⭐⭐⭐⭐        | Bajo     | Medio  | **🥇**          |
| Notificaciones (#01)      | ⭐⭐⭐⭐⭐   | ⭐⭐⭐          | Medio    | Bajo   | **🥇**          |
| Catálogo Educativo (#04)  | ⭐⭐⭐⭐     | ⭐⭐⭐          | Medio    | Bajo   | **🥈**          |
| Gamificación (#02)        | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐        | Alto     | Medio  | **🥈**          |
| Filtro Geográfico (#06)   | ⭐⭐⭐       | ⭐⭐            | Bajo     | Bajo   | **🥉**          |
