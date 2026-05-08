# 📋 Process Characterization Report (PCR)

## GreenBin - Sistema de Recompensa por Reciclaje

---

## 1. Resumen Ejecutivo

El **Process Characterization Report (PCR)** documenta los flujos de usuario y procesos de negocio del sistema GreenBin, una plataforma de recompensa por reciclaje donde los vecinos entregan residuos, ganan puntos y los canjean por cupones en locales adheridos.

---

## 2. Actores del Sistema

| Actor              | Descripción                                    | Permisos                                                    |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------- |
| **Vecino**         | Ciudadano que reciclaje y canjea puntos        | Registrarse, entregar residuos, ver puntos, obtener cupones |
| **Responsable**    | Empleado de la entidad que registra entregas   | Login, registrar entregas, ver historial                    |
| **Entidad**        | Organización/Gobierno que gestiona el programa | CRUD responsables, puntos verdes, locales, categorías       |
| **Local Adherido** | Comercio que ofrece cupones                    | Crear/gestionar cupones, canjear cupones de vecinos         |

---

## 3. Flujo de Autenticación

### 3.1 Landing Page (`/`)

```
┌─────────────────────────────────────────────────────────────┐
│  GREENBIN - Landing Page                                      │
│  ├─ Ver estadísticas (+4000 usuarios, +10 localidades)       │
│  ├─ Botón "Ingresar" ──────────────► /login                  │
│  └─ Botón "Entidades" ────────────► /login-admin           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Login Vecino (`/login`) ```

┌─────────────────────────────────────────────────────────────┐
│ LOGIN - Selección de Rol │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ VECINO │ │ LOCAL │ │ RESPONSABLE │ │
│ │ [clic] │ │ [clic] │ │ [clic] │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────┘

```

**Flujo POST selección:**
```

┌─────────────────────────────────────────────────────────────┐
│ FORMULARIO DE LOGIN │
│ ├─ Input: username (requerido) │
│ ├─ Input: password (requerido) │
│ ├─ reCAPTCHA (requerido) ────► Token válido requerido │
│ └─ Botón "Ingresar" ─────────► validar credenciales │
│ │ │
│ ┌──────────────┴──────────────┐ │
│ ▼ ▼ │
│ CREDENCIALES OK CREDENCIALES ERROR │
│ ├─ Guardar JWT tokens ├─ Mostrar error │
│ ├─ Redirect según rol └─ Permitir reintento │
│ └─ /vecino, /local, /responsable │
└─────────────────────────────────────────────────────────────┘

```

### 3.3 Login Entidad (`/login-admin`)
```

/login-admin ──► Form login ENTIDAD/RESPONSABLE ──► /entidad o /responsable

```

---

## 4. Flujo Vecino

### 4.1 Registro (`/registrar-vecino`)
```

┌─────────────────────────────────────────────────────────────┐
│ REGISTRO VECINO │
│ ├─ Formulario: │
│ │ ├─ firstname (requerido) │
│ │ ├─ lastname (requerido) │
│ │ ├─ username (requerido) │
│ │ ├─ email (requerido, email válido) │
│ │ ├─ password (requerido, uppercase + special char) │
│ │ ├─ dni (requerido, 8 dígitos) │
│ │ ├─ birthdate (dd/mm/yyyy) │
│ │ ├─ phoneNumber (10-15 dígitos) │
│ │ ├─ entityId (seleccionar de lista) │
│ │ └─ recaptchaToken │
│ ├─ Validación en tiempo real │
│ └─ Submit ──► POST /api/neighbor │
│ │ │
│ ┌──────────────┴──────────────┐ │
│ ▼ ▼ │
│ REGISTRO OK REGISTRO ERROR │
│ ├─ Guardar tokens ├─ Mostrar errores │
│ ├─ Redirect /vecino └─ Permitir reintento │
└─────────────────────────────────────────────────────────────┘

```

### 4.2 Dashboard Vecino (`/vecino`)
```

┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD VECINO │
│ ├─ Header: "Hola, {nombre}!" + "{puntos} puntos" │
│ ├─ Menú (sidenav): │
│ │ ├─ Mis Cupones ────────────► /mis-cupones │
│ │ ├─ Catalogo Cupones ───────► /cupones │
│ │ ├─ Puntos Verdes ─────────► /puntos-verdes │
│ │ ├─ Modificar Perfil ─────► /modificar-vecino │
│ │ └─ Cerrar Sesión │
│ ├─ Historial de transacciones (últimos 5) │
│ └─ Botones flotantes: │
│ ├─ [Mapa] ─────────► /puntos-verdes │
│ ├─ [Cupón] ─────────► /cupones │
│ └─ [Perfil] ────────► /modificar-vecino │
└─────────────────────────────────────────────────────────────┘

```

### 4.3 Catálogo Cupones (`/cupones`)
```

┌──────────────────────────���─��────────────────────────────────┐
│ CATÁLOGO CUPONES │
│ ├─ Lista de cupones disponibles (de todos los locales) │
│ ├─ Card por cupón: │
│ │ ├─ Título │
│ │ ├─ Descripción │
│ │ ├─ Descuento % │
│ │ ├─ Costo en puntos │
│ │ ├─ Local adherido │
│ │ └─ Botón "Canjear" ────► validar puntos suficientes │
│ └─ Post canje: │
│ ├─ Descontar puntos del vecino │
│ ├─ Crear coupon_transaction (estado: ADQUIRIDO) │
│ └─ Redirect /mis-cupones │
└─────────────────────────────────────────────────────────────┘

```

### 4.4 Mis Cupones (`/mis-cupones`)
```

┌─────────────────────────────────────────────────────────────┐
│ MIS CUPONES │
│ ├─ Tabs: [ADQUIRIDOS] [UTILIZADOS] [VENCIDOS] │
│ ├─ Lista de cupones obtenidos │
│ ├─ Card por cupón: │
│ │ ├─ Código qr (para canjear en local) │
│ │ ├─ Título, descripción, descuento │
│ │ ├─ Fecha adquisición, fecha vencimiento │
│ │ └─ Estado: ADQUIRIDO / UTILIZADO / VENCIDO │
│ └─ Mostrar código para usar en local adherido │
└─────────────────────────────────────────────────────────────┘

```

### 4.5 Puntos Verdes (`/puntos-verdes`)
```

┌─────────────────────────────────────────────────────────────┐
│ PUNTOS VERDES │
│ ├─ Mapa de Google Maps │
│ ├─ Marcadores por cada punto verde │
│ └─ Click marker ──► Info window con detalles │
│ ├─ Nombre │
│ ├─ Dirección │
│ ├─ Horarios │
│ └─ Teléfono │
└─────────────────────────────────────────────────────────────┘

```

### 4.6 Modificar Perfil (`/modificar-vecino`)
```

┌─────────────────────────────────────────────────────────────┐
│ MODIFICAR VECINO │
│ ├─ Cargar datos actuales del usuario │
│ ├─ Formulario editable: │
│ │ ├─ firstname, lastname │
│ │ ├─ username │
│ │ ├─ password (opcional) │
│ │ └�� phoneNumber │
│ └─ Submit ──► PUT /api/neighbor/{id} │
└─────────────────────────────────────────────────────────────┘

```

---

## 5. Flujo Responsable

### 5.1 Login (`/login-admin` → `/responsable`)
```

/login-admin ──► Login Responsable ──► /responsable

```

### 5.2 Dashboard Responsable (`/responsable`)
```

┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD RESPONSABLE │
│ ├─ Menú sidenav: │
│ │ ├─ Registrar entrega ────────────► /entrega │
│ │ ├─ Historial entregas ─────────► /historial-resp │
│ │ └─ Cerrar Sesión │
│ └─ Funcionalidad principal: /entrega │
└─────────────────────────────────────────────────────��───────┘

```

### 5.3 Registrar Entrega (`/entrega`)
```

┌─────────────────────────────────────────────────────────────┐
│ REGISTRAR ENTREGA │
│ ├─ Buscar vecino (por DNI) │
│ ├─ Seleccionar categoría de residuo (de lista) │
│ ├─ Ingresar peso (kg) │
│ ├─ Seleccionar punto verde (donde se entrega) │
│ ├─ Calcular puntos = peso \* puntos_por_kg │
│ └─ Submit ──► POST /api/waste-transaction │
│ │ │
│ ┌──────────────┴──────────────┐ │
│ ▼ ▼ │
│ ENTREGA OK ERROR │
│ ├─ Agregar puntos al vecino ├─ Mostrar error │
│ ├─ Crear transacción └─ Permitir reintento │
│ └─ Mostrar comprobante │
└─────────────────────────────────────────────────────────────┘

```

### 5.4 Historial Responsable (`/historial-responsable`)
```

┌─────────────────────────────────────────────────────────────┐
│ HISTIORIAL RESPONSABLE │
│ ├─ Tabla de entregas realizadas │
│ ├─ Filtros: fecha, punto verde, vecino │
│ └─ Exportar (si está implementado) │
└─────────────────────────────────────────────────────────────┘

```

---

## 6. Flujo Entidad

### 6.1 Login Entidad (`/login-admin` → `/entidad`)
```

/login-admin ──► Login Entidad ──► /entidad

```

### 6.2 Dashboard Entidad (`/entidad`)
```

┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD ENTIDAD │
│ ├─ Sidebar con menú: │
│ │ ├─ Registrar Responsable ───► /registrar-responsable │
│ │ ├─ Listar Responsables ──────► /listar-responsables │
│ │ ├─ Registrar Punto Verde ───► /registrar-punto-verde│
│ │ ├─ Listar Puntos Verdes ────► /consultar-puntos │
│ │ ├─ Listar Vecinos ───────────► /consultar-vecinos │
│ │ ├─ Listar Locales ────────────► /consultar-locales │
│ │ ├─ Registrar Categoría ─────► /registrar-categoria│
│ │ ├─ Listar Categorías ───────► /consultar-categorias│
│ │ └─ Cerrar Sesión │
│ └─ Panel con estadísticas │
└─────────────────────────────────────────────────────────────┘

```

### 6.3 Gestión de Responsables
```

/registrar-responsable ──► Formulario ──► POST /api/responsible
/listar-responsables ──► Tabla ──► Editar/Eliminar

/modificar-responsable/:id ─��► Formulario PRE-cargado ──► PUT /api/responsible/:id

```

### 6.4 Gestión de Puntos Verdes
```

/registrar-punto-verde ──► Formulario + Mapa ──► POST /api/green-point
/consultar-puntos-verdes ──► Tabla ──► Editar/Eliminar

/modificar-punto-verde/:id ──► Formulario PRE-cargado + Mapa ──► PUT /api/green-point/:id

```

### 6.5 Gestión de Categorías
```

/registrar-categoria ──► Formulario ──► POST /api/waste-category
/consultar-categorias ──► Tabla ──► Editar/Eliminar/Habilitar

/modificar-categoria/:id ──► Formulario PRE-cargado ──► PUT /api/waste-category/:id

```

---

## 7. Flujo Local Adherido

### 7.1 Login (`/login` → selección LOCAL)
```

/login ──► Login Local ──► /local

```

### 7.2 Dashboard Local (`/local`)
```

┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD LOCAL │
│ ├─ Menú: │
│ │ ├─ Mis Cupones ──────────────► /cupones-ofrecidos │
│ │ ├─ Registrar Cupón ──────────► /registrar-cupon │
│ │ ├─ Usar Cupón ────────────────► /usar-cupon │
│ │ ├─ Mis Reciclados ──────────────► /mis-reciclados │
│ │ ├─ Modificar Perfil ─────────► /modificar-local │
│ │ └─ Cerrar Sesión │
│ └─ Historial de cupones canjeados │
└─────────────────────────────────────────────────────────────┘

```

### 7.3 Registrar Cupón (`/registrar-cupon`)
```

┌─────────────────────────────────────────────────────────────┐
│ REGISTRAR CUPÓN │
│ ├─ Formulario: │
│ │ ├─ título (requerido) │
│ │ ├─ descripción │
│ │ ├─ discount % (1-100) │
│ │ ├─ costInPoints (requerido) │
│ │ ├─ validDays (días de validez) │
│ │ └─ isAvailable (checkbox) │
│ └─ Submit ──► POST /api/coupon │
└─────────────────────────────────────────────────────────────┘

```

### 7.4 Usar Cupón (`/usar-cupon`)
```

┌─────────────────────────────────────────────────────────────┤
│ USAR CUPÓN │
│ ├─ Input: código de cupón (ingresado por cliente) │
│ ├─ Botón "Validar" ──► GET /api/coupon-transaction/use │
│ └─ Post validación: │
│ ├─ Si válido: mostrar detalles del cupón + descuento│
│ ├─ Confirmar uso ──► PUT estado UTILIZADO │
│ └─ Si inválido: mostrar error │
└────────────────────────────────────────────────��─��──────────┘

```

### 7.5 Mis Cupones (`/cupones-ofrecidos`)
```

/cupones-ofrecidos ──► Lista de cupones creados ──► Editar/Eliminar/Deshabilitar

/modificar-cupon/:id ──► Editar cupón

```

---

## 8. Rutas Públicas vs Protegidas

| Ruta | Acceso | Requiere Auth |
|------|--------|---------------|
| `/` | Público | No |
| `/login` | Público | No |
| `/login-admin` | Público | No |
| `/registrar-vecino` | Público | No |
| `/registrar-local` | Público | No |
| `/forgot-password` | Público | No |
| `/reset-password` | Público | No |
| `/test` | Público | No |
| `/puntos-verdes` | Vecino | Token + rol |
| `/modificar-vecino` | Vecino | Token + rol |
| `/cupones` | Vecino | Token + rol |
| `/mis-cupones` | Vecino | Token + rol |
| `/responsable` | Responsable | Token + rol |
| `/entrega` | Responsable | Token + rol |
| `/historial-responsable` | Responsable | Token + rol |
| `/entidad` | Entidad | Token + rol |
| `/local` | Local | Token + rol |
| `/registrar-cupon` | Local | Token + rol |
| `/usar-cupon` | Local | Token + rol |
| `/consultar-*` | Entidad | Token + rol |
| `/registrar-*` | Entidad | Token + rol |
| `/modificar-*` | Entidad/Vecino/Local | Token + rol |

---

## 9. Estados de Cupón

```

┌─────────────────────────────────────────────────────────────┐
│ ESTADOS DE CUPÓN TRANSACTION │
│ │
│ AVAILABLE ──[vecino lo adquiere]──► ADQUIRIDO │
│ │ │
│ │ │
│ └────────[local usa]─────────── UTILIZADO │
│ │ │
│ └─[expiración]──► VENCIDO │
└─────────────────────────────────────────────────────────────┘

```

---

## 10. Casos de Uso Principales

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

## 11. Diagramas de Flujo Resumidos

### Autenticación
```

START ──► Landing ──► Click "Ingresar"
│
▼
/login ──► Seleccionar Rol ──► Formulario
│
▼
Validar ──► [OK] Guardar JWT ──► Redirigir según rol
│
[ERROR] Mostrar error

```

### Entrega de Residuos
```

START ──► /responsable ──► /entrega
│
▼
Buscar Vecino (DNI)
│
▼
Seleccionar Categoría + Peso
│
▼
Calcular Puntos = Peso × PuntosPorKg
│
▼
Confirmar ──► POST Transaction
│
▼
Actualizar puntos vecino ──► Mostrar comprobante

```

---

## 12. Historial de Cambios

| Fecha | Cambio |
|--------|--------|
| 2026-05-08 | PCR inicial basado en análisis de rutas y componentes |

---

*Documento generado el 8 de mayo de 2026*
```

