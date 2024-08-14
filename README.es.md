[Español](./README.es.md) | [English](./README.md)

# Proyecto Greenbin

Proyecto Final para la finalización de la carrera Ingenieria en Sistemas de UTN FRVM

## Tecnologías

- **[Fastify](https://fastify.dev/)**: Framework de alto rendimiento para Node.js.
- **[MikroORM](https://mikro-orm.io/) & [PostgreSQL](https://www.postgresql.org/)**: Simplificación de interacción con un ORM.
- **[TypeScript](https://www.typescriptlang.org/)**: Entorno de desarrollo de tipo fuerte.
- **[PNPM](https://pnpm.io/)**: Gestor de paquetes personalizado para Node.js.
- **[Vitest](https://vitest.dev/)**: Pruebas.
- **[Docker](https://www.docker.com/)**: Contenedores y despliegue.
- **[Docker Compose](https://www.docker.com/)**: Contenedores y despliegue.
- **[SwaggerUI](https://swagger.io/)**: Documentación.
- **[Husky](https://github.com/typicode/husky) & [Lint-staged](https://github.com/okonet/lint-staged)**: Hooks de Git.
- **[ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)**: Linteo y formateo.
- **[dotenv](https://www.dotenv.org/docs/) & [env-valid](https://www.npmjs.com/package/env-valid)**: Configuración de entorno y validación.
- **Arquitectura Modular**: Separación de preocupaciones con una estructura de arquitectura bien definida.

## Primeros pasos

### Prerrequisitos

- [Node.js](https://nodejs.org/) (>= 20.x)
- [PNPM](https://pnpm.io/) (>= 9.3.x)
- [Docker](https://docs.docker.com/get-docker/) (para configurar la base de datos)

### Instalación

1. Clonar el repositorio:

```sh
git clone https://github.com/Figaarillo/greenbin-back.git
cd greenbin-back
```

2. Establecer variables de entorno. Copiar el archivo `.env.example` a `.env`:

```sh
cp .env.example .env
```

3. Instalar dependencias:

```sh
pnpm install
```

### ¿Cómo ejecutar el proyecto?

- Ejecutar el servidor y la base de datos a traves de Docker

```sh
make docker
```

> Si el servidor no está corriendo, puedes reiniciarlo:

```sh
make docker.restart.server
```

- Ejecutar el servidor localmente y la base de datos a traves de Docker

```sh
make run
```

### Ejecutar las migraciones

```sh
make migrations
```

### Linteo y formateo

- Lintear el proyecto

```sh
pnpm run lint
```

- Formatear el proyecto

```sh
pnpm run prettier
```

## Estructura del proyecto

```sh
src
├── entity
│   ├── aplication
│   │   └── usecases            # Application use cases
│   ├── domain
│   │   ├── entities            # Domain entity definitions
│   │   ├── errors              # Domain error definitions
│   │   ├── payloads            # Payloads for domain entities
│   │   └── repositories        # Repository definition
│   ├── infrastructure
│   │   ├── dtos                # Data Transfer Objects for entity data
│   │   ├── handler             # HTTP controllers / handlers for routes
│   │   ├── middlewares         # Middleware
│   │   ├── repositories        # Implementation of repositories
│   │   └── routes              # HTTP routes
│   └── test                    # End-to-end tests
├── migrations                  # Database migrations
└── shared                      # Shared modules and utilities
    ├── config
    ├── domain
    ├── test
    └── utils
```

## Licencia

Este proyecto se distribuye bajo la licencia MIT.
