# PRD — GreenBin (Backend v1)

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

| Actor | Rol en el sistema | Descripción |
|---|---|---|
| **Municipalidad (Entity)** | Administrador | Gestiona todo el ecosistema: vecinos, responsables, puntos verdes, comercios aliados y categorías de residuos |
| **Vecino (Neighbor)** | Participante | Lleva residuos a los puntos verdes, acumula puntos y los canjea por cupones |
| **Responsable** | Operador de campo | Empleado municipal que atiende un green point y registra transacciones de residuos |
| **Reward Partner** | Comercio aliado | Empresa o comercio local que crea cupones de descuento canjeables con puntos |

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

| Restricción | Decisión |
|---|---|
| Multi-tenancy | ❌ Single-tenant (una municipalidad por instancia) |
| API | REST (Fastify + Swagger documentado) |
| Base de datos | PostgreSQL + MikroORM |
| Auth | JWT stateless |
| Deployment | Docker Compose (DB + API) |

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

| Métrica | Descripción |
|---|---|
| Transacciones registradas | N° de entregas de residuos por período |
| Puntos emitidos vs. canjeados | Ratio de participación activa |
| CO₂ evitado acumulado | Impacto ambiental calculado |
| Cupones adquiridos vs. utilizados | Efectividad del programa de incentivos |
