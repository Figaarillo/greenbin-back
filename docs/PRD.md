# PRD — GreenBin (Backend v1)

> **Estado de validación:** ✅ Todos los tests pasan (151 tests, 0 failures)
> _Ultima verificación: 07-May-2026_

## 1. Visión del Producto

GreenBin es una plataforma de gestión municipal de reciclaje que incentiva la participación ciudadana mediante un sistema de puntos canjeables por descuentos en comercios locales. La municipalidad opera como administradora del sistema: gestiona los puntos de recolección, el personal operativo y los comercios aliados.

**Modelo de negocio inicial:** licencia única vendida a una municipalidad (single-tenant).

---

## 2. Problema

Las municipalidades carecen de herramientas digitales para:

- Registrar y trazabilizar entregas de residuos reciclables por ciudadano.
- Incentivar económicamente la participación sostenida en programas de reciclaje.
- Medir el impacto ambiental real (CO₂ evitado) del programa.
- Articular el circuito entre vecinos, puntos verdes y comercios locales.

---

## 3. Actores y Roles

| Actor                      | Rol en el sistema | Descripción                                                                                                   |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Municipalidad (Entity)** | Administrador     | Gestiona todo el ecosistema: vecinos, responsables, puntos verdes, comercios aliados y categorías de residuos |
| **Vecino (Neighbor)**      | Participante      | Lleva residuos a los puntos verdes, acumula puntos y los canjea por cupones                                   |
| **Responsable**            | Operador de campo | Empleado municipal que atiende un green point y registra transacciones de residuos                            |
| **Reward Partner**         | Comercio aliado   | Empresa o comercio local que crea cupones de descuento canjeables con puntos                                  |

---

## 4. Economía de Puntos

```
Entrega de residuos:
  puntos = peso_kg × puntos_por_kg (definido por categoría de residuo)

Canje de cupón:
  balance_vecino -= costo_en_puntos (definido por el comercio al crear el cupón)
```

Cada categoría de residuo tiene además un factor `co2` para calcular impacto ambiental acumulado.

---

## 5. Módulos del Sistema

### 5.1 Autenticación

- JWT con refresh implícito.
- Hash de contraseñas con Argon2.
- Roles diferenciados: Entity, Neighbor, Responsible, RewardPartner.

### 5.2 Gestión de Puntos Verdes (Green Points)

- CRUD de puntos de recolección físicos.
- Ubicación georreferenciada (latitud/longitud).
- Asociados a la Entity administradora.

### 5.3 Gestión de Categorías de Residuos

- CRUD de categorías (plástico, papel, vidrio, etc.).
- Atributos: `pointsPerWeight`, `co2`, `isActive` (soft delete).

### 5.4 Transacciones de Residuos

- Un Responsable registra una entrega: selecciona vecino, green point, y agrega ítems (categoría + peso).
- El sistema calcula los puntos de cada ítem y el total.
- Los puntos se acreditan al balance del vecino.
- Estructura: `WasteTransaction` → N `WasteTransactionDetail`.

### 5.5 Cupones

- Creados por Reward Partners con: título, descripción, descuento (%), costo en puntos, días de vigencia, código de canje (6 chars).
- Estado base de un cupón: `AVAILABLE`.

### 5.6 Transacciones de Cupones

- Un vecino canjea un cupón: se debitan sus puntos y se genera una `CouponTransaction`.
- State machine del canje:
  ```
  ADQUIRIDO → USADO
            → EXPIRADO (automático si se supera la fecha de expiración)
  ```
- El Reward Partner valida y marca el cupón como `USADO` presentando el código.

---

## 6. Flujos Principales

### Flujo de reciclaje

```
Vecino lleva residuos al Green Point
  → Responsable registra la transacción
    → Sistema calcula puntos por cada ítem
      → Puntos acreditados al balance del Vecino
```

### Flujo de canje de cupón

```
Vecino selecciona cupón disponible
  → Sistema verifica balance suficiente
    → Se debitan los puntos
      → Se genera CouponTransaction (ADQUIRIDO) con código y fecha de expiración
        → Vecino presenta código al Reward Partner
          → Reward Partner valida el código
            → CouponTransaction → USADO
```

---

## 7. Restricciones Técnicas (v1)

| Restricción   | Decisión                                           |
| ------------- | -------------------------------------------------- |
| Multi-tenancy | ❌ Single-tenant (una municipalidad por instancia) |
| API           | REST (Fastify + Swagger documentado)               |
| Base de datos | PostgreSQL + MikroORM                              |
| Auth          | JWT stateless                                      |
| Deployment    | Docker Compose (DB + API)                          |

---

## 8. Fuera de Alcance (v1)

- App móvil (solo backend/API).
- Multi-tenancy / SaaS.
- Notificaciones push o email.
- Dashboard de analytics/reportes.
- Pasarela de pagos.
- Panel de administración web.

---

## 9. Métricas de Éxito (v1)

| Métrica                           | Descripción                            |
| --------------------------------- | -------------------------------------- |
| Transacciones registradas         | N° de entregas de residuos por período |
| Puntos emitidos vs. canjeados     | Ratio de participación activa          |
| CO₂ evitado acumulado             | Impacto ambiental calculado            |
| Cupones adquiridos vs. utilizados | Efectividad del programa de incentivos |

---

## 10. Validación, Arquitectura y Estado del Proyecto

> _Actualizado: 07-May-2026 — Producto de la ejecución completa de la suite de tests y análisis de infraestructura._

---

### 10.1 Stack Tecnológico (Confirmado)

| Capa         | Tecnología                                  |
| ------------ | ------------------------------------------- |
| Runtime      | Node.js + TypeScript 5.3 (strict mode, CJS) |
| Framework    | Fastify 4.x                                 |
| ORM          | MikroORM 6.3 + PostgreSQL                   |
| Validación   | Zod 3.x                                     |
| Auth         | JWT stateless (access + refresh)            |
| Hash         | Argon2                                      |
| Testing      | Vitest 2.0.5 + `@vitest/coverage-v8`        |
| Package Mgmt | pnpm                                        |
| Build        | tsc → `dist/`                               |
| Dev server   | nodemon + ts-node                           |
| Infra        | Docker Compose (API + DB + test DB)         |
| Calidad      | ESLint + Prettier + Husky + commitlint      |

---

### 10.2 Arquitectura del Proyecto

El proyecto sigue **Arquitectura Hexagonal / Clean Architecture / Screaming Architecture**. Cada módulo de dominio es autocontenido:

```
src/{modulo}/
├── application/usecases/    → Lógica de negocio (casos de uso)
├── domain/entities/         → Entidades del dominio
│   domain/repositories/     → Interfaces de repositorio
│   domain/errors/           → Errores específicos del dominio
├── infrastructure/handlers/ → Handlers HTTP (Fastify)
│   infrastructure/repositories/ → Implementaciones MikroORM
│   infrastructure/routes/   → Definición de rutas Fastify
│   infrastructure/dtos/     → DTOs de entrada/salida
│   infrastructure/middlewares/ → Validación Zod
└── test/                    → Tests del módulo
```

**Módulos implementados:**

| Módulo                     | Responsabilidad                                            |
| -------------------------- | ---------------------------------------------------------- |
| `auth`                     | JWT, autenticación, password-reset                         |
| `entity`                   | CRUD de municipalidades (admin del sistema)                |
| `neighbor`                 | CRUD de vecinos, login, búsqueda por DNI                   |
| `responsible`              | CRUD de responsables municipales, login                    |
| `reward-partner`           | CRUD de comercios aliados, login                           |
| `green-point`              | CRUD de puntos verdes georreferenciados                    |
| `waste-category`           | CRUD de categorías de residuos (con soft-delete)           |
| `waste`                    | Entidad Waste (residuo individual en transacción)          |
| `waste-transaction`        | Transacciones de entrega de residuos + cálculo pts         |
| `waste-transaction-detail` | Detalle ítem por ítem de cada transacción                  |
| `coupon`                   | CRUD de cupones creados por reward partners                |
| `coupon-transaction`       | Canje de cupones (state machine: ADQUIRIDO→USADO→EXPIRADO) |
| `statistics`               | Estadísticas y reportes                                    |

**Patrón de bootstrap:** Cada módulo exporta una función `bootstrap{Modulo}(app: FastifyInstance)` que se registra en `app.ts`. Esto mantiene el acoplamiento bajo entre módulos.

---

### 10.3 Estado de los Tests

#### 10.3.1 Resumen

| Tipo              | Archivos | Tests                      | Estado |
| ----------------- | -------- | -------------------------- | ------ |
| Unitarios         | 3        | 22 passed, 3 skipped       | ✅     |
| E2E / Integración | 9        | 129 passed                 | ✅     |
| **Total**         | **12**   | **151 passed, 0 failures** | **✅** |

#### 10.3.2 Tests E2E por Módulo

| Módulo            | Tests | Lo que cubre                                                                         |
| ----------------- | ----- | ------------------------------------------------------------------------------------ |
| Entity            | 24    | CRUD completo, login, validaciones (body vacío, password débil, uuid inválido)       |
| Neighbor          | 21    | CRUD, login, búsqueda por DNI, validación de fecha de nacimiento, autorización       |
| WasteCategory     | 15    | CRUD, validaciones (body vacío, pointsPerWeight=0), soft-delete                      |
| Responsible       | 13    | CRUD, login, validación de entityId inexistente                                      |
| RewardPartner     | 12    | CRUD, login, validación de CUIT, 409 en duplicado                                    |
| GreenPoint        | 11    | CRUD, validación entityId inexistente, 409 en coordenadas duplicadas                 |
| WasteTransaction  | 11    | Registro de delivery, cálculo de puntos, validaciones (peso negativo, IDs inválidos) |
| Coupon            | 13    | CRUD, validaciones (descuento >100, costInPoints=0, validDays>365)                   |
| CouponTransaction | 9     | Canje de cupón, state machine (adquisición, uso, expiración)                         |

#### 10.3.3 Tests Unitarios

| Módulo           | Tests         | Lo que cubre                             |
| ---------------- | ------------- | ---------------------------------------- |
| Waste            | 8             | Cálculo de puntos por peso y categoría   |
| Neighbor         | 11            | Lógica de validación de datos del vecino |
| WasteTransaction | 6 (3 skipped) | Lógica de registro de transacciones      |

#### 10.3.4 Cobertura — Módulos sin Tests

Los siguientes módulos existen en el código pero **no tienen archivos de test**:

| Módulo                     | Archivos sin test                  |
| -------------------------- | ---------------------------------- |
| `auth` (password-reset)    | `src/auth/`                        |
| `waste` (CRUD de wastes)   | Solo tiene tests unitarios, no E2E |
| `waste-transaction-detail` | `src/waste-transaction-detail/`    |
| `statistics`               | `src/statistics/`                  |

---

### 10.4 Infraestructura de Testing

#### Setup

- **Framework:** Vitest v2.0.5 con `fileParallelism: false` (los tests corren secuencialmente).
- **Base de datos de test:** PostgreSQL 16.2 via Docker (`database-test` container, puerto 5433).
- **Setup global:** `src/shared/test/test.setup.ts`
  - `beforeAll`: crea instancia de Fastify + MikroORM, refresca schema completo.
  - `beforeEach`: dropea y recrea schema (`refreshDatabase()`) para aislamiento total entre tests.
  - `afterEach`: dropea schema.
  - `afterAll`: cierra la app.
- **Helper:** `src/shared/test/test-helpers.ts` — funciones factory para crear entidades, vecinos, responsables, etc. con tokens JWT incluidos.
- **Test DB:** `TEST_DATABASE_NAME=:memory:` en `.env` — se usa literalmente como nombre de base de datos PostgreSQL.

#### Patrón de test

```typescript
// Ejemplo representativo
import { app } from '../../shared/test/test.setup'
import { createEntity } from '../../shared/test/test-helpers'

it('crea un recurso', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/recurso',
    body: {
      /* ... */
    }
  })
  expect(res.statusCode).toBe(201)
})
```

Todos los tests son tests de integración que usan `app.inject()` (Fastify lo inyecta sin levantar un servidor HTTP real). Esto significa que **no hay mocking** — cada test golpea la base de datos real.

#### Comandos

```bash
make test                          # Tests E2E + Unitarios
make test.e2e                      # Solo tests E2E
make test.unit                     # Solo tests unitarios
make test.e2e.entity               # Módulo específico
make test.e2e.neighbor             # Módulo específico
make test.e2e.{waste-category|responsible|reward-partner|green-point|coupon|waste-transaction|coupon-transaction}
```

---

### 10.5 Lo que se Aprendió / Descubrimientos Técnicos

#### 10.5.1 Bug corregido: `2>/dev/null` en el Makefile

**Problema:** Todos los targets de test en el Makefile tenían `2>/dev/null` al final. Esto redirigía stderr a `/dev/null`, silenciando **todas** las salidas de error. Si un test fallaba, el único indicador era el exit code — no se veía el mensaje de error, el stack trace, ni qué assertion falló.

**Fix:** Se removió `2>/dev/null` de todos los targets de test (`test`, `test.e2e`, `test.e2e.{modulo}`). También se removió de los targets `docker.clean` que lo usaban para la eliminación de volúmenes.

**Impacto:** Ahora cuando un test falla, el error completo es visible inmediatamente en la terminal.

#### 10.5.2 Base de datos de test compartida: `:memory:`

**Problema:** El `.env` define `TEST_DATABASE_NAME=:memory:`. Todas las instancias de vitest que se ejecuten simultáneamente apuntan a la **misma** base de datos PostgreSQL literalmente llamada `:memory:`. Cuando dos procesos distintos ejecutan `refreshDatabase()` al mismo tiempo, PostgreSQL corrompe su catálogo interno (`pg_type_typname_nsp_index`, OIDs inválidos, etc.).

**Síntomas de corrupción del catálogo:**

- `could not open relation with OID X`
- `duplicate key value violates unique constraint "pg_type_typname_nsp_index"`
- `relation "X" already exists`
- `relation "public.X" does not exist`

**Mitigación actual:**

- `vitest.config.ts` usa `fileParallelism: false` — los archivos de test se ejecutan secuencialmente **dentro** de un mismo proceso vitest.
- Los tests deben correrse con un único proceso vitest (ej: `pnpm vitest run` sin especificar archivos individuales).
- **No ejecutar** tests en paralelo con múltiples comandos de terminal.

**Recuperación de catálogo corrupto:**

```bash
docker compose exec database-test psql -U glomtech -d template1 \
  -c "DROP DATABASE IF EXISTS \":memory:\"; CREATE DATABASE \":memory:\";"
```

**Causa raíz:** El nombre `:memory:` hereda de una convención de SQLite que no aplica a PostgreSQL. Para parallelización real, cada test file debería usar una base de datos con nombre único, o implementar esquemas separados.

#### 10.5.3 Performance de tests

- La suite E2E completa tarda ~5.5 minutos en ejecutarse.
- Cada archivo de test ejecuta `refreshDatabase()` **dos veces** (una en `beforeAll`, una en `beforeEach` del primer test).
- `refreshDatabase()` dropea y recrea todas las tablas, índices, constraints y foreign keys. Esta operación DDL pesada es el principal cuello de botella.
- Los tests unitarios son casi instantáneos (~5s en total).

#### 10.5.4 Naturaleza de los tests

- **No hay mocking.** Todos los tests E2E son tests de integración real contra PostgreSQL.
- Usan `app.inject()` de Fastify que simula requests HTTP sin levantar un puerto de red.
- Los fixtures (datos de prueba) están centralizados en `test-helpers.ts` con factories reutilizables: `createEntity()`, `createNeighborWithToken()`, `createCoupon()`, etc.
- No hay tests de contratos de API (como supertest), no hay property-based testing, no hay fuzzing.

---

### 10.6 Deuda Técnica / Áreas de Mejora

| Área                  | Descripción                                                                 | Prioridad |
| --------------------- | --------------------------------------------------------------------------- | --------- |
| Tiempo de suite E2E   | ~5.5 minutos completa. El `refreshDatabase()` en cada test es el bottleneck | Media     |
| Tests paralelizables  | Todos usan la misma DB `:memory:`. Ideal: schema per test file o DB única   | Media     |
| Cobertura de módulos  | auth/password-reset, waste CRUD, statistics sin tests                       | Baja      |
| Nombre de DB confuso  | `:memory:` es engañoso — parece SQLite pero es PostgreSQL                   | Baja      |
| Seeders sin tests     | Los datos de prueba no tienen tests que validen su consistencia             | Baja      |
| Test helpers frágiles | `createNeighborWithToken()` depende del orden de creación implícita         | Baja      |

---

### 10.7 Comandos de Recuperación Rápida

```bash
# Reset completo de la base de test (catálogo corrupto)
docker compose exec database-test psql -U glomtech -d template1 \
  -c "DROP DATABASE IF EXISTS \":memory:\"; CREATE DATABASE \":memory:\";"

# Ver logs de la base de test
docker compose logs database-test

# Conectarse a la base de test
docker compose exec database-test psql -U glomtech -d ":memory:"

# Correr un módulo específico viendo los errores
DATABASE_HOST=localhost pnpm vitest run src/entity/test/entity.test.ts --config src/vitest.config.ts

# Coverage
pnpm vitest run --coverage --config src/vitest.config.ts
```
