[English](./README.md) | [Spanish](./README.es.md)

# Greenbin Project

Final Project for the completion of the Systems Engineering degree at UTN FRVM

## Technologies

- **[Fastify](https://fastify.dev/)**: A high-performance framework for Node.js.
- **[MikroORM](https://mikro-orm.io/) & [PostgreSQL](https://www.postgresql.org/)**: Simplifies database interactions with an ORM.
- **[TypeScript](https://www.typescriptlang.org/)**: Strongly typed development environment.
- **[pnpm](https://pnpm.io/)**: Personal package manager for Node.js.
- **[Vitest](https://vitest.dev/)**: Testing.
- **[Docker](https://www.docker.com/)**: Containerization and deployment.
- **[Docker Compose](https://www.docker.com/)**: Containerization and deployment.
- **[SwaggerUI](https://swagger.io/)**: Documentation.
- **[Husky](https://github.com/typicode/husky) & [Lint-staged](https://github.com/okonet/lint-staged)**: Git hooks.
- **[ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)**: Linting and formatting.
- **[dotenv](https://www.dotenv.org/docs/) & [env-valid](https://www.npmjs.com/package/env-valid)**: Environment configuration and validation.
- **Modular Architecture**: Clean separation of concerns with a well-defined structure.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 20.x)
- [PNPM](https://pnpm.io/) (>= 9.3.x)
- [Docker](https://docs.docker.com/get-docker/) (for database setup)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Figaarillo/greenbin-back.git
cd greenbin-back
```

2. Set up environment variables. Copy the `.env.example` file to `.env`:

```sh
cp .env.example .env
```

3. Install dependencies:

```sh
pnpm install
```

### How to run the project?

- Run the server and database through Docker

```sh
make docker
```

> If the server is not running, you can restart it:

```sh
make docker.restart.server
```

- Run the server locally and the database with Docker

```sh
make run
```

### How to run tests?

```sh
make test
```

### Running Migrations

- To generate new migrations:

```sh
make migrations
```

### Linting and Formatting

To lint the code:

```sh
pnpm run lint
```

To format the code:

```sh
pnpm run prettier
```

## Project Structure

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

## License

This project is licensed under the MIT License.
