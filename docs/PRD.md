# 📋 Product Requirements Document (PRD)
## GreenBin - Sistema de Recompensa por Reciclaje

---

## 1. Project Overview

| Campo | Detalle |
|-------|---------|
| **Nombre** | GreenBin |
| **Tipo** | Sistema Web de Recompensa por Reciclaje |
| **Stack Frontend** | Angular 17 + Bootstrap + Angular Material + Chart.js |
| **Stack Backend** | Fastify + MikroORM + PostgreSQL + TypeScript |
| **Testing** | Vitest (backend), Karma (frontend) |
| **DevOps** | Docker, ESLint, Prettier, Husky |
| **Descripción** | Plataforma que permite a vecinos entregar materiales reciclables, ganar puntos, y canjearlos por cupones en locales adheridos |

---

## 2. Usuarios y Roles

| Rol | Descripción | Funcionalidades Clave |
|-----|-------------|----------------------|
| **Vecino** | Ciudadano que entrega residuos | Registrarse, entregar residuos, ver puntos, obtener/canjear cupones |
| **Responsable** | Empleado de entidad | Registrar entregas de vecinos, ver historial |
| **Entidad** | Organización/Gobierno local | Gestionar puntos verdes, responsables, locales adheridos |
| **Local Adherido** | Comercio partner | Crear cupones, ofrecer descuentos, canjear cupones |

---

## 3. Flujo Principal del Sistema

```
Vecino entrega residuos → Responsable weigh/registra → Vecino gana puntos 
     → Vecino canjea cupón → Local adherido acepta → Descuento aplicado
```

---

## 4. Módulos del Sistema

### 4.1 Gestión de Residuos
- **Categorías**: Plástico (10pts/kg), Papel/Cartón (8pts/kg), Vidrio (6pts/kg), Metal (15pts/kg), Electrónico (25pts/kg), Orgánico (4pts/kg)
- Puntos por kg según categoría
- Historial de transacciones
- Impacto CO2 por categoría

### 4.2 Puntos Verdes (Green Points)
- Ubicaciones con coordenadas GPS
- Gestión CRUD por entidad
- Mapa de visualización

### 4.3 Cupones
- Descuentos en locales adheridos
- Estados: AVAILABLE → ADQUIRIDO → UTILIZADO / VENCIDO
- Costo en puntos
- Vencimiento por días

### 4.4 Autenticación y Autorización
- JWT con access/refresh tokens
- Sistema de recuperación de contraseña
- reCAPTCHA integration
- Roles con guards específicos

---

## 5. Flujos de Usuario

### 5.1 Autenticación

#### Landing → Login
```
/ → Botón "Ingresar" → /login
     │
     ├─ Seleccionar rol (Vecino/Local/Responsable)
     │
     ├─ Formulario: username + password + reCAPTCHA
     │
     └─ Validar credenciales
           ├─ OK: Guardar JWT → Redirect según rol
           └─ ERROR: Mostrar mensaje
```

#### Login Entidad/Responsable
```
/login-admin → Formulario Entidad/Responsable → /entidad o /responsable
```

### 5.2 Flujo Vecino

#### Registro
```
/registrar-vecino → Formulario (firstname, lastname, username, email, password, dni, birthdate, phoneNumber, entity)
     │
     └─ Validar → POST /api/neighbor
           ├─ OK: Login automático → /vecino
           └─ ERROR: Mostrar errores
```

#### Dashboard Vecino
```
/vecino → Dashboard
     ├─ Header: "Hola, {nombre}!" + "{puntos} puntos"
     ├─ Historial de transacciones
     └─ Sidebar:
           ├─ Mis Cupones → /mis-cupones
           ├─ Catálogo Cupones → /cupones
           ├─ Puntos Verdes → /puntos-verdes
           └─ Modificar Perfil → /modificar-vecino
```

#### Canje de Cupones
```
/cupones → Lista de cupones disponibles
     │
     └─ Click "Canjear" (validar puntos suficientes)
           ├─ OK: Descontar puntos → Crear transaction → /mis-cupones
           └─ ERROR: Mostrar mensaje
```

### 5.3 Flujo Responsable

#### Dashboard
```
/responsable → Dashboard
     └─ Sidebar:
           ├─ Registrar Entrega → /entrega
           └─ Historial Entregas → /historial-responsable
```

#### Registrar Entrega
```
/entrega → Buscar vecino (DNI)
     │
     ├─ Seleccionar categoría de residuo
     ├─ Ingresar peso (kg)
     ├─ Seleccionar punto verde
     └─ Calcular puntos = peso × puntos_por_kg
           │
           └─ Submit
                 ├─ OK: Agregar puntos al vecino → Mostrar comprobante
                 └─ ERROR: Mostrar mensaje
```

### 5.4 Flujo Entidad

#### Dashboard
```
/entidad → Dashboard + Sidebar
     └─ Opciones:
           ├─ Registrar Responsable → /registrar-responsable
           ├─ Listar Responsables → /listar-responsables
           ├─ Registrar Punto Verde → /registrar-punto-verde
           ├─ Listar Puntos Verdes → /consultar-puntos-verdes
           ├─ Listar Vecinos → /consultar-vecinos
           ├─ Listar Locales → /consultar-locales
           ├─ Registrar Categoría → /registrar-categoria
           ├─ Listar Categorías → /consultar-categorias
           └─ Cerrar Sesión
```

### 5.5 Flujo Local Adherido

#### Dashboard
```
/local → Dashboard + Sidebar
     └─ Opciones:
           ├─ Mis Cupones → /cupones-ofrecidos
           ├─ Registrar Cupón → /registrar-cupon
           ├─ Usar Cupón → /usar-cupon
           ├─ Mis Reciclados → /mis-reciclados
           ├─ Modificar Perfil → /modificar-local
           └─ Cerrar Sesión
```

#### Usar Cupón
```
/usar-cupon → Ingresar código de cupón
     │
     ├─ Validar código
     │     ├─ VÁLIDO: Mostrar detalles → Confirmar uso
     │     └─ INVÁLIDO: Mostrar error
     │
     └─ Confirmar uso
           ├─ Actualizar estado → UTILIZADO
           └─ Mostrar mensaje éxito
```

---

## 6. Rutas del Frontend

### 6.1 Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Login vecino |
| `/login-admin` | Login entidad/responsable |
| `/registrar-vecino` | Registro ciudadano |
| `/registrar-local` | Registro comercio |
| `/forgot-password` | Olvidé mi contraseña |
| `/reset-password` | Nueva contraseña |

### 6.2 Rutas Protegidas por Rol

| Ruta | Rol Requerido | Descripción |
|------|---------------|-------------|
| `/vecino` | Vecino | Dashboard vecino |
| `/puntos-verdes` | Vecino | Ver mapa de puntos |
| `/cupones` | Vecino | Catálogo cupones |
| `/mis-cupones` | Vecino | Mis cupones |
| `/modificar-vecino` | Vecino | Modificar perfil |
| `/responsable` | Responsable | Dashboard responsable |
| `/entrega` | Responsable | Registrar entrega |
| `/historial-responsable` | Responsable | Historial entregas |
| `/entidad` | Entidad | Dashboard entidad |
| `/consultar-puntos-verdes` | Entidad | Listar puntos verdes |
| `/registrar-punto-verde` | Entidad | Registrar punto verde |
| `/modificar-punto-verde/:id` | Entidad | Modificar punto verde |
| `/consultar-vecinos` | Entidad | Listar vecinos |
| `/consultar-locales` | Entidad | Listar locales |
| `/listar-responsables` | Entidad | Listar responsables |
| `/registrar-responsable` | Entidad | Registrar responsable |
| `/modificar-responsable/:id` | Entidad | Modificar responsable |
| `/registrar-categoria` | Entidad | Registrar categoría |
| `/consultar-categorias` | Entidad | Listar categorías |
| `/modificar-categoria/:id` | Entidad | Modificar categoría |
| `/consultar-entidad` | Entidad | Listar entidades |
| `/registrar-entidad` | Entidad | Registrar entidad |
| `/modificar-entidad/:id` | Entidad | Modificar entidad |
| `/local` | Local | Dashboard local |
| `/registrar-cupon` | Local | Registrar cupón |
| `/modificar-cupon/:id` | Local | Modificar cupón |
| `/cupones-ofrecidos` | Local | Mis cupones |
| `/usar-cupon` | Local | Usar cupón |
| `/modificar-local` | Local | Modificar perfil |
| `/mis-reciclados` | Local | Historial cupones |

---

## 7. API Endpoints

### 7.1 Rutas Públicas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/waste-category` | Listar categorías de residuos |
| POST | `/api/neighbor` | Registrar vecino |
| POST | `/api/neighbor/auth/login` | Login vecino |
| POST | `/api/responsible/auth/login` | Login responsable |
| POST | `/api/reward-partner/auth/login` | Login local adherido |
| POST | `/api/entity/auth/login` | Login entidad |

### 7.2 Rutas Protegidas (requieren JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/neighbor` | Listar vecinos |
| GET | `/api/neighbor/:id` | get vec by ID |
| PUT | `/api/neighbor/:id` | Update vecino |
| DELETE | `/api/neighbor/:id` | Delete vecino |
| GET | `/api/green-point` | Listar puntos verdes |
| POST | `/api/green-point` | Crear punto verde |
| PUT | `/api/green-point/:id` | Update punto verde |
| DELETE | `/api/green-point/:id` | Delete punto verde |
| GET | `/api/coupon` | Listar cupones |
| POST | `/api/coupon` | Crear cupón |
| PUT | `/api/coupon/:id` | Update cupón |
| POST | `/api/coupon-transaction/acquire` | Adquirir cupón |
| POST | `/api/coupon-transaction/use` | Usar cupón |
| GET | `/api/waste/transaction/neighbor/:id` | Historial neighbor |
| GET | `/api/coupon-transaction/neighbor/:id` | Cupones neighbor |
| GET | `/api/waste-category` | Listar categorías |
| POST | `/api/waste-category` | Crear categoría |
| PUT | `/api/waste-category/:id` | Update categoría |

---

## 8. Estados de Cupón

```
AVAILABLE ──[vecino lo adquiere]──► ADQUIRIDO
     │
     ├────────[local usa]───────────► UTILIZADO
     │
     └────────[expiración]─────────► VENCIDO
```

---

## 9. Datos de Prueba (Seed)

### 9.1 Entidades Creadas
| Tipo | Cantidad | Ejemplos |
|------|---------|----------|
| Entidades | 2 | Municipalidad de Villa María, Cooperativa EcoVerde |
| Responsables | 3 | Laura Fernández, Martín Rodríguez, Sofía López |
| Vecinos | 6 | Carlos Gómez, Ana Martínez, Diego Sánchez, Valentina Torres, Pablo Herrera, Lucía Flores |
| Locales Adheridos | 3 | Carrefour VM, Farmacia Del Pueblo, Librería El Estudiante |
| Puntos Verdes | 4 | Plaza Central, Barrio San Martín, Universidad Nacional, Barrio Nueva Córdoba |
| Categorías | 6 | Plástico, Papel y Cartón, Vidrio, Metal, Electrónico, Orgánico |
| Transacciones Residuos | 7 | Varias transacciones con detalles |
| Cupones | 5 | 10% descuento, 20% descuento, etc. |

### 9.2 Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Vecino | `cgomez@gmail.com` | (hash argon2) |
| Vecino | `amartinez@hotmail.com` | (hash argon2) |

**Nota**: Los passwords están hasheados. Para testing usar el endpoint de registro.

---

## 10. Guards de Autenticación

| Guard | Función |
|-------|---------|
| `isLogged` | Verifica que exista accessToken y refreshToken |
| `vecinoGuard` | Valida que el token pertenezca a un Vecino |
| `responsableGuard` | Valida que el token pertenezca a un Responsable |
| `entityGuard` | Valida que el token pertenezca a una Entidad |
| `localGuard` | Valida que el token pertenezca a un Local |

---

## 11. Casos de Uso Principales

| # | Caso de Uso | Actor | Flujo Principal |
|---|------------|-------|-----------------|
| 1 | Registrarse | Vecino | Landing → Registro → Validación → Login |
| 2 | Login | Todos | Login → reCAPTCHA → Validar → Dashboard |
| 3 | Entregar Residuos | Responsable | Login → Entrega → Buscar vecino → Categoría → Peso → Puntos |
| 4 | Obtener Cupón | Vecino | Catálogo → Seleccionar → Canjear puntos → Crear transaction |
| 5 | Usar Cupón | Local | Código → Validar → Confirmar → Actualizar estado |
| 6 | Gestionar Entidad | Entidad | Dashboard → CRUD (responsables, puntos, categorías) |
| 7 | Gestionar Local | Local | Dashboard → CRUD cupones |

---

## 12. Configuración

### 12.1 Variables de Entorno (.env)
```
# SERVER
SERVER_PORT=8080
SERVER_HOST=localhost
NODE_ENV=development

# DATABASE
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=postgres
DATABASE_NAME=greenbin_db

# JWT
ACCESS_TOKEN=secret
REFRESH_TOKEN=secret
ACCESS_TOKEN_EXPIRES_IN=10m
REFRESH_TOKEN_EXPIRES_IN=7d

# reCAPTCHA (REQUERIDO)
RECAPTCHA_SECRET_KEY="secret_key"

# EMAIL (REQUERIDO)
EMAIL_USER="noreply@greenbin.com"
EMAIL_APP_PASSWORD="secret_password"
```

---

## 13. Servicios y Componentes

### 13.1 Servicios Principales
- `VecinoService` - Gestión de vecinos
- `ResponsableService` - Gestión de responsables
- `EntidadService` - Gestión de entidades
- `LocalAdheridoService` - Gestión de locales
- `PuntoVerdeService` - Gestión de puntos verdes
- `WasteCategoryService` - Categorías de residuos
- `SesionService` - Gestión de sesión/tokens
- `WasteDeliveryService` - Gestión de entregas
- `CouponService` - Gestión de cupones

### 13.2 Componentes Importantes
- `LoginComponent` - Login con reCAPTCHA
- `RegistrarVecinoComponent` - Registro ciudadano
- `LandingVecinoComponent` - Dashboard vecino
- `LandingResponsableComponent` - Dashboard responsable
- `EntidadDashboardComponent` - Dashboard entidad
- `HomeLocalComponent` - Dashboard local
- `EntregaResiduosComponent` - Registro de entregas

---

## 14. Bugs y Issues Encontrados

### 14.1 Críticos

| Bug | Ubicación | Descripción | Impacto |
|-----|-----------|-------------|-----------|
| **102 console.log()** | Múltiples archivos | Quedaron en código de producción | Performance, seguridad |
| **reCAPTCHA blocking login** | `/api/neighbor/auth/login` | Token "test" es rechazado | Usuarios no pueden loguearse |
| **Sin manejo de errores** | 7 `.subscribe()` | No hay callback error | Sin feedback al usuario |
| **Green Points sin auth** | `/api/green-point` | Requiere JWT, no público | No muestra mapa |

### 14.2 Medios

| Bug | Ubicación | Descripción |
|-----|-----------|-------------|
| **98+ usos de `any`** | Servicios/páginas | Tipado debil dificulta mantenimiento |
| **API requiere offset/limit** | `/api/green-point` | No tiene valores por defecto |

### 14.3 Sugerencias

| Sugerencia | Prioridad |
|------------|-----------|
| Limpiar console.logs antes de prod | Alta |
| Agregar manejo de errores | Alta |
| Tipar datos con interfaces | Media |
| Deshabilitar reCAPTCHA en dev | Alta |
| Crear ruta pública green-points | Media |

---

## 15. Stack Operativo Actual

```
Frontend:  http://localhost:4200     (✅ Operativo)
Backend:   http://localhost:8080    (✅ Operativo)
Swagger:   http://localhost:8080/docs (✅ Operativo)
Database: PostgreSQL (Docker)      (✅ Operativo)
```

### Estado de Validación

| Feature | Estado | Notas |
|----------|--------|-------|
| Landing page | ✅ OK | |
| Login forms | ⚠️ | Requiere reCAPTCHA válido |
| Registro usuario | ✅ OK | |
| Categorías API | ✅ OK | 6 categorías |
| Entidades API | ✅ OK | 2 entidades |
| Puntos verdes | ⚠️ | Requiere auth |
| Login API | ⚠️ | Requiere reCAPTCHA |

---

## 16. Dockerfile

El proyecto usa **pnpm 8** que es compatible con Node 20:

```dockerfile
# Stage 1: Build
FROM node:20.15.0-alpine3.19 AS builder
RUN npm install -g pnpm@8 && pnpm install
RUN pnpm build

# Stage 2: Production
FROM node:20.16-slim AS production
ENV NODE_ENV=production
RUN npm install -g pnpm@8 && pnpm install --prod
```

---

## 17. Comandos Útiles

```sh
# Backend
cd greenbin-back
docker compose up -d --wait    # Levantar DB + API
docker compose logs -f       # Ver logs

# Frontend
cd greenbin-front
npm start                     # Levantar en :4200
npm run build                  # Build producción
```

---

## 18. Historial de Cambios

| Fecha | Cambio |
|--------|--------|
| 2026-05-08 | PRD inicial basado en análisis código |
| 2026-05-08 | Añadido flujos de usuario y casos de uso |
| 2026-05-08 | Añadido reporte de bugs encontrados |
| 2026-05-08 | Actualizado con validación de deployment |

---

*Documento generado el 8 de mayo de 2026*
## 19. Access Control (OWASP A01)


> _Implementado: 27-May-2026 — Rama `fix/broken-access-control`_

#### 10.3.1 Problema original

El backend carecía de autorización real. Decenas de endpoints estaban completamente abiertos (sin autenticación), no había verificación de roles (el decorator `authorizate` existía pero nunca se invocaba), y no había validación de ownership — cualquier usuario autenticado podía operar sobre recursos de cualquier otro usuario. El usuario autenticado se almacenaba en propiedades separadas del request (`req.neighbor`, `req.entity`, `req.responsible`, `req.rewardPartner`) lo cual fragmentaba el acceso y complicaba cualquier middleware transversal.

#### 10.3.2 Solución implementada

**Tres capas de protección:**

| Capa | Middleware | Responsabilidad |
|------|-----------|-----------------|
| Autenticación | `validateAccessToken` | Verifica JWT, almacena payload en `req.user` |
| Roles (RBAC) | `requireRoles(...roles)` | Verifica que `req.user.role` esté en la lista de roles permitidos |
| Ownership | `requireOwnership(paramKey)` | Verifica que `req.user.sub === req.params[paramKey]` |

**Decorators compuestos (registrados en `auth.bootstrap.ts`):**

- `protect(...roles)` — encadena autenticación + RBAC. Retorna un solo preHandler.
- `protectOwner(paramKey, ...roles)` — encadena autenticación + RBAC + ownership. Retorna un solo preHandler.

**Interfaz `AuthUser` (`src/auth/domain/entities/auth-user.ts`):**

```typescript
interface AuthUser {
  sub: string    // ID del usuario (UUID)
  role: Roles    // enum: entity | neighbor | responsible | rewardPartner | admin
  email: string
  type: string   // 'access' | 'refresh'
}
```

**Acceso unificado:** `req.user` reemplaza a `req.neighbor`, `req.entity`, `req.responsible`, `req.rewardPartner`. Todos los handlers usan `req.user.sub` para el ID y `req.user.role` para el rol.

#### 10.3.3 Archivos del sistema de access control

```
src/auth/
├── domain/entities/
│   ├── role.ts                          → Enum Roles
│   └── auth-user.ts                     → Interfaz AuthUser
├── infrastructure/middlewares/
│   ├── validate-access-token.middleware.ts  → Autenticación (sets req.user)
│   ├── validate-refresh-token.middleware.ts → Refresh token (sets req.user)
│   ├── require-roles.middleware.ts          → Factory RBAC
│   └── require-ownership.middleware.ts      → Factory Ownership
└── auth.bootstrap.ts                    → Registra protect/protectOwner como decorators
types/index.d.ts                         → Tipado de FastifyInstance y FastifyRequest
```

#### 10.3.4 Cómo proteger un nuevo endpoint

**Paso 1 — Elegir el nivel de protección:**

| Necesidad | Decorator | Ejemplo |
|-----------|-----------|---------|
| Solo autenticado, cualquier rol | `protect(Roles.ENTITY, Roles.NEIGHBOR, Roles.RESPONSIBLE, Roles.REWARD_PARTNER)` | Listar recursos públicos |
| Autenticado + roles específicos | `protect(Roles.ENTITY, Roles.RESPONSIBLE)` | Crear/modificar recursos de gestión |
| Autenticado + roles + ownership | `protectOwner('id', Roles.NEIGHBOR)` | Editar/eliminar el propio perfil |
| Público (sin auth) | No usar preHandler | Login, register, forgot-password |

**Paso 2 — Aplicar en la ruta:**

```typescript
// Ruta con schema (Swagger) → envolver en this.server.auth([])
this.server.post('/api/recurso', {
  schema: miSwaggerSchema,
  preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
  handler: async (req: FastifyRequest<{ Body: MiPayload }>, rep) => {
    await this.handler.create(req, rep)
  }
})

// Ruta sin schema → usar directamente
this.server.get('/api/recurso/:id', {
  preHandler: this.server.protect(Roles.ENTITY, Roles.NEIGHBOR),
  handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
    await this.handler.findByID(req, rep)
  }
})

// Ruta con ownership
this.server.put('/api/recurso/:id', {
  preHandler: this.server.protectOwner('id', Roles.NEIGHBOR),
  handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
    await this.handler.update(req, rep)
  }
})
```

> **Importante sobre Fastify + TypeScript:** cuando una ruta tiene `schema` de Swagger, el `preHandler` DEBE estar envuelto en `this.server.auth([...])` para que la resolución de tipos funcione correctamente. Sin schema, se puede usar `this.server.protect(...)` directamente. Esto es una limitación conocida del sistema de tipos de Fastify 4.x.

**Paso 3 — Acceder al usuario en el handler:**

```typescript
const userId = req.user.sub       // UUID del usuario autenticado
const userRole = req.user.role    // Roles enum
const userEmail = req.user.email
```

#### 10.3.5 Cómo cambiar los permisos de un endpoint existente

Modificar los roles en la llamada a `protect()` o `protectOwner()` en el archivo de rutas correspondiente:

```typescript
// Antes: solo entity y responsible podían crear cupones
preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)

// Después: ahora también reward partner puede crear cupones
preHandler: this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.REWARD_PARTNER)
```

Es un cambio de una sola línea en el archivo `*.route.ts` del módulo.

#### 10.3.6 Permisos actuales por módulo (temporarios)

Los permisos actuales son **placeholders** — la tabla definitiva de permisos por rol no está definida aún por producto. El criterio temporario aplicado:

| Operación | Roles permitidos |
|-----------|-----------------|
| **Lectura de recursos** (GET) | Todos los roles autenticados |
| **Gestión** (POST/PUT/DELETE coupon, green-point, waste-category, waste) | Entity, Responsible |
| **Transacciones de residuos** (POST waste-transaction) | Entity, Responsible |
| **Canje de cupones** (POST redeem-coupon) | Neighbor |
| **Uso de cupones** (POST coupon-transaction/use) | Neighbor, RewardPartner |
| **Estadísticas de entidad** | Entity, Responsible |
| **Estadísticas de vecino** | Neighbor, Entity, Responsible |
| **Editar/eliminar propio perfil** (PUT/DELETE con `:id`) | Rol propio (con ownership check) |
| **Crear responsables / reward partners** | Entity |
| **Eliminar responsables / reward partners** | Entity |
| **Registro y login** | Público (sin auth) |

#### 10.3.7 Endpoints públicos (sin auth)

Los siguientes endpoints NO requieren autenticación por diseño:

- `POST /api/entity` — registro de entidad
- `POST /api/neighbor` — registro de vecino
- `POST /api/{entity|neighbor|responsible|reward-partner}/auth/login` — login
- `GET /api/{entity|neighbor|responsible|reward-partner}/auth/refresh-token` — refresh (usa validateRefreshToken)
- `POST /api/auth/forgot-password` — solicitar reset de contraseña
- `POST /api/auth/reset-password` — ejecutar reset de contraseña

---

### 10.4 Estado de los Tests (anterior a access control)

#### 10.4.1 Resumen

