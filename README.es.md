[Español](./README.es.md) | [English](./README.md)

# GreenBin Backend

Proyecto Final para la finalización de la carrera Ingeniería en Sistemas de Información de UTN FRVM.

API backend para un sistema de recompensas por reciclaje donde los vecinos ganan puntos al entregar residuos reciclables y pueden canjearlos por cupones en negocios asociados.

## Tecnologías

- **[Fastify](https://fastify.dev/)**: Framework web de alto rendimiento
- **[MikroORM](https://mikro-orm.io/)**: ORM para interacciones con la base de datos
- **[PostgreSQL](https://www.postgresql.org/)**: Base de datos relacional
- **[TypeScript](https://www.typescriptlang.org/)**: Desarrollo con tipos seguros
- **[Vitest](https://vitest.dev/)**: Framework de testing
- **[Docker](https://www.docker.com/)**: Contenedores
- **[SwaggerUI](https://swagger.io/)**: Documentación de API
- **[Husky](https://github.com/typicode/husky)**: Hooks de Git
- **[ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)**: Calidad de código

---

## Inicio Rápido

```sh
# 1. Clonar e instalar dependencias
git clone https://github.com/Figaarillo/greenbin-back.git
cd greenbin-back
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Configurar entorno de desarrollo (crea DB, ejecuta migraciones, carga datos iniciales)
make dev.setup

# 4. Ejecutar el servidor
make run
```

La API estará disponible en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/docs`.

---

## Comandos Disponibles

Todos los comandos se ejecutan con `make <comando>`:

### Desarrollo

| Comando          | Descripción                                                    |
| ---------------- | -------------------------------------------------------------- |
| `make run`       | Iniciar el servidor con la base de datos en Docker             |
| `make run.dev`   | Iniciar el servidor en modo watch (auto-recarga)               |
| `make dev.setup` | Configuración completa: limpiar DB, ejecutar migraciones, seed |

### Gestión de Docker

| Comando                      | Descripción                                                |
| ---------------------------- | ---------------------------------------------------------- |
| `make docker`                | Iniciar stack completo (backend + base de datos) en Docker |
| `make docker.run.db`         | Iniciar solo el contenedor de la base de datos             |
| `make docker.restart.server` | Reiniciar el contenedor del servidor API                   |
| `make docker.stop`           | Detener todos los contenedores                             |
| `make docker.clean`          | Detener y eliminar todos los contenedores y volúmenes      |

### Migraciones de Base de Datos

| Comando                   | Descripción                                                |
| ------------------------- | ---------------------------------------------------------- |
| `make migrations`         | Limpiar DB, crear y ejecutar migraciones                   |
| `make migrations.create`  | Crear una nueva migración a partir de cambios en el schema |
| `make migrations.up`      | Ejecutar migraciones pendientes                            |
| `make migrations.delete`  | Eliminar todas las migraciones                             |
| `make migrations.initial` | Reiniciar DB y ejecutar migración inicial                  |

### Utilidades de Base de Datos

| Comando             | Descripción                                      |
| ------------------- | ------------------------------------------------ |
| `make seed`         | Poblar la base de datos con datos de ejemplo     |
| `make pgadmin`      | Iniciar pgAdmin para gestión de la base de datos |
| `make pgadmin.stop` | Detener pgAdmin                                  |

### Testing

| Comando                            | Descripción                                  |
| ---------------------------------- | -------------------------------------------- |
| `make test`                        | Ejecutar todos los tests (unitarios + e2e)   |
| `make test.unit`                   | Ejecutar solo tests unitarios                |
| `make test.e2e`                    | Ejecutar todos los tests de integración e2e  |
| `make test.e2e.entity`             | Ejecutar tests del módulo entity             |
| `make test.e2e.neighbor`           | Ejecutar tests del módulo neighbor           |
| `make test.e2e.responsible`        | Ejecutar tests del módulo responsible        |
| `make test.e2e.reward-partner`     | Ejecutar tests del módulo reward-partner     |
| `make test.e2e.green-point`        | Ejecutar tests del módulo green-point        |
| `make test.e2e.waste-category`     | Ejecutar tests del módulo waste-category     |
| `make test.e2e.waste-transaction`  | Ejecutar tests del módulo waste-transaction  |
| `make test.e2e.coupon`             | Ejecutar tests del módulo coupon             |
| `make test.e2e.coupon-transaction` | Ejecutar tests del módulo coupon-transaction |

### Calidad de Código

| Comando               | Descripción                                              |
| --------------------- | -------------------------------------------------------- |
| `pnpm run lint`       | Lintear todos los archivos                               |
| `pnpm run prettier`   | Formatear todos los archivos                             |
| `pnpm run ts-check`   | Verificación de tipos TypeScript                         |
| `pnpm run pre-commit` | Ejecutar hooks de pre-commit (lint + format + typecheck) |

---

## Estructura del Proyecto

```
src/
├── entity/                      # Módulo Entidad (empresa/organización)
│   ├── application/usecases/    # Lógica de negocio
│   ├── domain/                  # Definiciones de dominio (entidades, errores, payloads)
│   ├── infrastructure/          # Capa HTTP (handlers, routes, DTOs, repositorios)
│   └── test/                   # Tests de integración
├── neighbor/                    # Módulo Vecino (usuario)
├── responsible/                 # Módulo Responsable (empleado)
├── reward-partner/              # Módulo Comercio Asociado
├── green-point/                 # Módulo Punto Verde (punto de acopio)
├── waste-category/              # Módulo Categoría de Residuo
├── waste-transaction/           # Módulo Transacción de Residuos
├── waste-transaction-detail/    # Módulo Detalle de Transacción de Residuos
├── waste/                       # Módulo Residuo
├── coupon/                     # Módulo Cupón
├── coupon-transaction/         # Módulo Transacción de Cupón (canje)
├── auth/                       # Módulo de Autenticación
├── migrations/                  # Migraciones de base de datos
└── shared/                      # Utilidades y configs compartidas
    ├── config/
    ├── domain/
    ├── test/
    └── utils/
```

### Estructura de un Módulo

Cada módulo sigue arquitectura limpia:

```
modulo/
├── application/
│   └── usecases/              # Lógica de negocio
├── domain/
│   ├── entities/              # Modelos de dominio
│   ├── errors/                # Errores personalizados
│   ├── payloads/             # Estructuras de datos
│   └── repositories/         # Interfaces de repositorio
├── infrastructure/
│   ├── dtos/                  # DTOs de Request/Response
│   ├── handlers/              # Controladores HTTP
│   ├── middlewares/           # Middlewares de Express
│   ├── repositories/          # Implementaciones de repositorio
│   ├── routes/                # Definiciones de rutas
│   └── swagger-schemas/       # Esquemas de OpenAPI
└── test/                      # Tests de integración
```

---

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

| Variable            | Descripción                    | Por defecto |
| ------------------- | ------------------------------ | ----------- |
| `PORT`              | Puerto del servidor            | `3000`      |
| `DATABASE_HOST`     | Host de la base de datos       | `localhost` |
| `DATABASE_PORT`     | Puerto de la base de datos     | `5432`      |
| `DATABASE_NAME`     | Nombre de la base de datos     | `greenbin`  |
| `DATABASE_USER`     | Usuario de la base de datos    | `postgres`  |
| `DATABASE_PASSWORD` | Contraseña de la base de datos | `postgres`  |
| `JWT_SECRET`        | Secreto para firmar JWT        | -           |

---

## Documentación de la API

Cuando el servidor está corriendo, acceder a Swagger UI en:

```
http://localhost:3000/docs
```

---

## Licencia

Licencia MIT
