[English](./README.md) | [Spanish](./README.es.md)

# GreenBin Backend

[![CI](https://img.shields.io/github/actions/workflow/status/Figaarillo/greenbin-back/ci.yml?branch=develop&label=CI)](https://github.com/Figaarillo/greenbin-back/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/actions/workflow/status/Figaarillo/greenbin-back/release.yml?branch=master&label=Release)](https://github.com/Figaarillo/greenbin-back/actions/workflows/release.yml)
[![Docker Image](https://img.shields.io/docker/image-size/figaarillo/greenbin-back/latest?label=Docker%20Image)](https://github.com/Figaarillo/greenbin-back/pkgs/container/greenbin-back)

Final Project for the completion of the Systems Engineering degree at UTN FRVM.

A backend API for a waste recycling reward system where neighbors earn points by delivering recyclables and can redeem them for coupons at partner businesses.

## Technologies

- **[Fastify](https://fastify.dev/)**: High-performance web framework
- **[MikroORM](https://mikro-orm.io/)**: ORM for database interactions
- **[PostgreSQL](https://www.postgresql.org/)**: Relational database
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development
- **[Vitest](https://vitest.dev/)**: Testing framework
- **[Docker](https://www.docker.com/)**: Containerization
- **[SwaggerUI](https://swagger.io/)**: API documentation
- **[Husky](https://github.com/typicode/husky)**: Git hooks
- **[ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)**: Code quality

---

## Quick Start

```sh
# 1. Clone and install dependencies
git clone https://github.com/Figaarillo/greenbin-back.git
cd greenbin-back
pnpm install

# 2. Set up environment variables
cp .env.example .env

# 3. Set up development environment (creates DB, runs migrations, seeds data)
make dev.setup

# 4. Run the server
make run
```

The API will be available at `http://localhost:8080` and Swagger docs at `http://localhost:8080/docs`.

---

## Available Commands

All commands are run with `make <command>`:

### Development

| Command          | Description                                     |
| ---------------- | ----------------------------------------------- |
| `make run`       | Start the server with database in Docker        |
| `make run.dev`   | Start the server in watch mode (auto-reload)    |
| `make dev.setup` | Full setup: clean DB, run migrations, seed data |
| `make reset`     | Reset database (deletes all and recreates)      |

### Docker Management

| Command                      | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `make docker`                | Start full stack (backend + database) in Docker |
| `make docker.run.db`         | Start only the database container               |
| `make docker.restart.server` | Restart the API server container                |
| `make docker.stop`           | Stop all containers                             |
| `make docker.clean`          | Stop and remove all containers and volumes      |

### Database Migrations

| Command                   | Description                                |
| ------------------------- | ------------------------------------------ |
| `make migrations`         | Clean DB, create and run migrations        |
| `make migrations.create`  | Create a new migration from schema changes |
| `make migrations.up`      | Run pending migrations                     |
| `make migrations.delete`  | Delete all migrations                      |
| `make migrations.initial` | Reset DB and run initial migration         |

### Database Utilities

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `make seed`         | Seed the database with sample data    |
| `make pgadmin`      | Start pgAdmin for database management |
| `make pgadmin.stop` | Stop pgAdmin                          |

### Testing

| Command                            | Description                         |
| ---------------------------------- | ----------------------------------- |
| `make test`                        | Run all tests (unit + e2e)          |
| `make test.unit`                   | Run only unit tests                 |
| `make test.e2e`                    | Run all e2e integration tests       |
| `make test.e2e.entity`             | Run entity module tests             |
| `make test.e2e.neighbor`           | Run neighbor module tests           |
| `make test.e2e.responsible`        | Run responsible module tests        |
| `make test.e2e.reward-partner`     | Run reward-partner module tests     |
| `make test.e2e.green-point`        | Run green-point module tests        |
| `make test.e2e.waste-category`     | Run waste-category module tests     |
| `make test.e2e.waste-transaction`  | Run waste-transaction module tests  |
| `make test.e2e.coupon`             | Run coupon module tests             |
| `make test.e2e.coupon-transaction` | Run coupon-transaction module tests |

### Code Quality

| Command               | Description                                      |
| --------------------- | ------------------------------------------------ |
| `pnpm run lint`       | Lint all files                                   |
| `pnpm run prettier`   | Format all files                                 |
| `pnpm run ts-check`   | TypeScript type checking                         |
| `pnpm run pre-commit` | Run pre-commit hooks (lint + format + typecheck) |

---

## Project Structure

```
src/
├── entity/                      # Entity (company/organization) module
│   ├── application/usecases/    # Business logic
│   ├── domain/                  # Domain definitions (entities, errors, payloads)
│   ├── infrastructure/          # HTTP layer (handlers, routes, DTOs, repositories)
│   └── test/                    # Integration tests
├── neighbor/                    # Neighbor (user) module
├── responsible/                 # Responsible (employee) module
├── reward-partner/              # Reward partner (business) module
├── green-point/                 # Green point (drop-off location) module
├── waste-category/              # Waste category module
├── waste-transaction/           # Waste transaction module
├── waste-transaction-detail/    # Waste transaction detail module
├── waste/                      # Waste item module
├── coupon/                      # Coupon module
├── coupon-transaction/          # Coupon transaction (redemption) module
├── auth/                        # Authentication module
├── migrations/                  # Database migrations
└── shared/                      # Shared utilities and configs
    ├── config/
    ├── domain/
    ├── test/
    └── utils/
```

### Module Structure

Each module follows clean architecture:

```
module/
├── application/
│   └── usecases/              # Business logic
├── domain/
│   ├── entities/              # Domain models
│   ├── errors/                # Custom errors
│   ├── payloads/              # Data structures
│   └── repositories/          # Repository interfaces
├── infrastructure/
│   ├── dtos/                  # Request/Response DTOs
│   ├── handlers/              # HTTP controllers
│   ├── middlewares/           # Express middlewares
│   ├── repositories/           # Repository implementations
│   ├── routes/                # Route definitions
│   └── swagger-schemas/       # OpenAPI schemas
└── test/                      # Integration tests
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable            | Description        | Default       |
| ------------------- | ------------------ | ------------- |
| `SERVER_PORT`       | Server port        | `8080`        |
| `DATABASE_HOST`     | Database host      | `localhost`   |
| `DATABASE_PORT`     | Database port      | `5432`        |
| `DATABASE_NAME`     | Database name      | `greenbin_db` |
| `DATABASE_USER`     | Database user      | `postgres`    |
| `DATABASE_PASSWORD` | Database password  | `postgres`    |
| `JWT_SECRET`        | JWT signing secret | -             |

---

## API Documentation

When the server is running, access Swagger UI at:

```
http://localhost:8080/docs
```

---

## Release Process

Releases follow the [branching process](./docs/process/branching.md):

1. Create a release branch from `develop`: `git checkout -b release/v{x.y}`
2. Polish and test on the release branch (no new features)
3. Open PR targeting `master` — CI + Release pipeline must pass
4. Merge to `master` → Docker image automatically pushed to GHCR
5. Sync `develop` back: `git checkout develop && git merge master`

For more details, see [docs/process/branching.md](./docs/process/branching.md).

---

## License

MIT License
