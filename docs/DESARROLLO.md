# Documentación de Desarrollo - GreenBin

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js y pnpm instalados
- Puerto 5432 disponible (PostgreSQL)
- Puerto 8080 disponible (API)

---

## Comandos Principales

### Levantar el proyecto completo (recomendado para desarrollo)

```bash
make run
```

Este comando:

1. Levanta la base de datos en Docker
2. Espera a que esté lista
3. Ejecuta las migraciones
4. Ejecuta los seeders
5. Inicia el servidor

### Modo desarrollo con watch

```bash
make run.dev
```

Igual que `make run` pero con hot-reload (nodemon).

### Reiniciar desde cero

```bash
make reset
```

Útil cuando hay problemas con las migraciones o se desea empezar con una base de datos limpia.

---

## Estructura de la Base de Datos

### Entidades Principales

| Entidad                | Descripción                                               |
| ---------------------- | --------------------------------------------------------- |
| Entity                 | Entidad (Municipalidad/Cooperativa) - gestiona el sistema |
| Responsible            | Responsables - usuarios que registran transacciones       |
| Neighbor               | Vecinos - usuarios que reciclaje y ganan puntos           |
| GreenPoint             | Puntos verdes - lugares de recolección                    |
| WasteCategory          | Categorías de residuos (Plástico, Papel, Vidrio, etc.)    |
| Waste                  | Residuos registrados en transacciones                     |
| WasteTransaction       | Transacciones de residuo                                  |
| WasteTransactionDetail | Detalle de cada residuo en la transacción                 |
| RewardPartner          | Comercios asociados para canje de puntos                  |
| Coupon                 | Cupones disponibles para canje                            |
| CouponTransaction      | Transacciones de cupones (canjes)                         |

---

## Seeders - Datos de Prueba

Los seeders crean datos de ejemplo para probar la aplicación. Se ejecutan automáticamente con `make run` o `make reset`.

### Seeders Incluidos

1. **WasteCategory** - 6 categorías de residuos

   - Plástico (10 pts/kg)
   - Papel y Cartón (8 pts/kg)
   - Vidrio (6 pts/kg)
   - Metal (15 pts/kg)
   - Electrónico (25 pts/kg)
   - Orgánico (4 pts/kg)

2. **Entity** - 2 entidades

   - Municipalidad de Villa María
   - Cooperativa EcoVerde

3. **Responsible** - 3 responsables

   - Laura Fernández (Municipalidad)
   - Martín Rodríguez (Municipalidad)
   - Sofía López (Cooperativa)

4. **RewardPartner** - 3 comercios asociados

   - Carrefour Villa María
   - Farmacia Del Pueblo
   - Librería El Estudiante

5. **Neighbor** - 6 vecinos con diferentes saldos de puntos

6. **GreenPoint** - 4 puntos verdes

7. **Coupon** - 5 cupones disponibles

8. **WasteTransaction** - 7 transacciones de residuo con detalles

9. **CouponTransaction** - 5 transacciones de cupón (algunas usadas, algunas vigentes, algunas vencidas)

### Credenciales de Prueba

**Entidades (Entity):**
| Email | Password |
|-------|----------|
| reciclado@villamaria.gob.ar | entity123 |
| contacto@ecoverde.org.ar | entity123 |

**Responsables (Responsible):**
| Username | Password |
|----------|----------|
| lfernandez | responsi123 |
| mrodriguez | responsi123 |
| slopez | responsi123 |

**Vecinos (Neighbor):**
| Username | Password | Puntos |
|----------|----------|--------|
| cgomez | neighbor123 | (varía según transacciones) |
| amartinez | neighbor123 | (varía según transacciones) |
| dsanchez | neighbor123 | (varía según transacciones) |
| vtorres | neighbor123 | (varía según transacciones) |
| pherrera | neighbor123 | (varía según transacciones) |
| lflores | neighbor123 | (varía según transacciones) |

---

## Cómo Probar la Aplicación

### 1. Iniciar la aplicación

```bash
make run
```

El servidor estará disponible en `http://localhost:8080`

### 2. Documentación de API

Swagger disponible en: `http://localhost:8080/docs`

### 3. Flujo de prueba típico

#### Registrar una transacción de residuo

1. Iniciar sesión como **Responsible** (ej: `lfernandez` / `responsi123`)
2. Obtener el token JWT
3. Usar endpoint de WasteTransaction para registrar residuos de un neighbor
4. Verificar que los puntos se sumen al neighbor

#### Canjear puntos por cupón

1. Iniciar sesión como **Neighbor** (ej: `cgomez` / `neighbor123`)
2. Verificar saldo de puntos
3. Ver cupones disponibles
4. Canjear cupón (se restan los puntos)

#### Gestionar cupones (RewardPartner)

1. Iniciar sesión como **Entity** o crear endpoint para reward partner
2. Ver cupones canjeados
3. Marcar cupón como utilizado

---

## Solución de Problemas

### Error: "migration failed - column already exists"

Esto ocurre cuando una migración intenta agregar una columna que ya existe.

**Solución 1: Usar `make reset`**

```bash
make reset
```

Esto borra todo y recrea la base de datos desde cero.

**Solución 2: Ejecutar migraciones manualmente**

```bash
# Ver estado de migraciones
pnpm run mikro-orm migration:list

# Forzar migración específica
pnpm run mikro-orm migration:up -t NombreDeMigration
```

### Error: "database connection refused"

Asegurarse que Docker esté corriendo:

```bash
docker ps
docker compose ps
```

Si no está corriendo:

```bash
docker compose up -d database
```

### Error: "seed already exists"

Los seeders tienen protección para no duplicar datos. Si querés recrear los datos:

```bash
make reset
```

### Ver logs de la base de datos

```bash
docker compose logs database
```

### Conectarse a la base de datos directamente

```bash
# Con Docker
docker compose exec database psql -U usuario -d greenbin_db

# Con variables de entorno del .env
psql -h localhost -U usuario -d greenbin_db
```

### Limpiar todo y empezar de nuevo

```bash
make docker.clean
make docker.run.db
make migrations.up
make seed
```

---

## Comandos Adicionales

| Comando              | Descripción                                |
| -------------------- | ------------------------------------------ |
| `make run`           | Levantar proyecto completo                 |
| `make run.dev`       | Modo desarrollo con watch                  |
| `make reset`         | Reiniciar base de datos                    |
| `make dev.setup`     | Configurar entorno de desarrollo           |
| `make seed`          | Ejecutar seeders                           |
| `make migrations.up` | Ejecutar migraciones                       |
| `make test`          | Ejecutar todos los tests                   |
| `make test.unit`     | Ejecutar tests unitarios                   |
| `make test.e2e`      | Ejecutar tests E2E                         |
| `make docker.clean`  | Limpiar contenedores Docker                |
| `make pgadmin`       | Levantar pgAdmin (interfaz visual para BD) |

---

## Estructura del Proyecto

```
greenbin-back/
├── src/
│   ├── main.ts                 # Punto de entrada
│   ├── mikro-orm.config.ts     # Configuración de MikroORM
│   ├── seed.ts                # Punto de entrada de seeders
│   ├── migrations/            # Migraciones de base de datos
│   ├── shared/
│   │   ├── config/           # Configuraciones (env, etc)
│   │   ├── database/         # Utilidades de base de datos
│   │   └── domain/          # Entidades base
│   ├── entity/              # Módulo de entidades
│   ├── neighbor/            # Módulo de vecinos
│   ├── responsible/         # Módulo de responsables
│   ├── waste-category/      # Módulo de categorías de residuo
│   ├── waste/               # Módulo de residuos
│   ├── waste-transaction/   # Módulo de transacciones de residuo
│   ├── green-point/         # Módulo de puntos verdes
│   ├── reward-partner/      # Módulo de comercios asociados
│   ├── coupon/              # Módulo de cupones
│   └── coupon-transaction/  # Módulo de transacciones de cupón
├── docker-compose.yml        # Configuración de Docker
├── Makefile                 # Comandos disponibles
└── package.json             # Dependencias
```

---

## Notas Importantes

- Las contraseñas en los seeders están hasheadas con argon2
- El sistema usa JWT para autenticación
- Los puntos se calculan automáticamente según el peso y categoría del residuo
- Los cupones tienen fecha de vencimiento
- Las transacciones de residuo crean automáticamente los detalles y actualizan los puntos del vecino
