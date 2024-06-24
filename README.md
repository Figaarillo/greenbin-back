# Noderplate

Noderplate is a boilerplate for Node.js projects, providing a well-structured foundation for building scalable and maintainable applications. It includes a setup with TypeORM, Fastify, and other essential tools for development.

## Features

- **[TypeORM Integration](https://typeorm.io/)**: Simplifies database interactions with a TypeScript ORM.
- **[Fastify](https://fastify.dev/)**: A high-performance framework for Node.js.
- **Modular Architecture**: Clean separation of concerns with a well-defined structure.
- **Environment Configuration**: Managed via dotenv.
- **TypeScript**: Strongly typed development environment.
- **Pre-configured Tooling**: Includes ESLint, Prettier, Husky, and more for code quality and consistency.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- pnpm (>= 6.x)
- Docker (for database setup)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Figaarillo/noderplate.git
    cd noderplate
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Set up environment variables:
    ```sh
    cp .env.dev .env
    # Update .env with your configuration
    ```

4. Run the database using Docker:
    ```sh
    docker-compose up -d
    ```

### Development

To start the development server:
```sh
pnpm run dev
```

### Building

To build the project:
```sh
pnpm run build
```

### Running Migrations

To generate new migrations:
```sh
pnpm run migration:generate
```

To run migrations:
```sh
pnpm run migration:run
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

### Testing

To run tests:
```sh
pnpm run test
```

## Project Structure

```
.
├── src
│   ├── main.ts                 # Application entry point
│   ├── shared                  # Shared modules and utilities
│   │   ├── config
│   │   ├── domain
│   │   └── utils
│   └── user                    # User domain-related modules
│       ├── aplication
│       ├── domain
│       └── infrastructure
├── docker-compose.yml          # Docker configuration
├── package.json                # Project configuration and scripts
└── tsconfig.json               # TypeScript configuration
```

## Contributing

Contributions are welcome! Please follow the [code of conduct](CODE_OF_CONDUCT.md) and submit pull requests for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
