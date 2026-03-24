.PHONY: docker.run docker.run.db docker.run.test docker.build docker.stop docker.clean docker.restart.server run run.dev test test.unit test.e2e test.e2e.entity test.e2e.waste-category test.e2e.neighbor test.e2e.responsible test.e2e.reward-partner test.e2e.green-point test.e2e.coupon test.e2e.waste-transaction test.e2e.coupon-transaction migrations migrations.up migrations.create migrations.delete migrations.initial seed dev.setup pgadmin pgadmin.stop

# ############ VARIABLES ############ #
DB_HOST=localhost

# ############# COMMANDS ############ #

run: docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │             RUNNING SERVER             │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm start

run.dev: docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │      RUNNING SERVER IN WATCH MODE      │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm dev

docker.run: docker.clean docker.build docker.run.db docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │  RUNNING CONTAINER FOR BACKEND SERVER  │ "
	@echo " ╰────────────────────────────────────────╯ "
	sleep 1
	docker compose up -d apiserver

docker.run.db:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       RUNNING DATABASE CONTAINER       │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose up -d database

docker.run.test:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       RUNNING CONTAINER FOR TESTS      │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose up -d database-test

docker.build:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          BUILDING DOCKER IMAGE         │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose build

docker.stop:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       STOPPING DOCKER CONTAINERS       │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose stop database database-test apiserver

docker.clean:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       CLEANING DOCKER CONTAINERS       │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose down --volumes

docker.restart.server:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          RESTARTING APISERVER          │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose stop apiserver
	docker compose up -d apiserver

test: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │           RUNNING ALL TESTS            │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run --config src/vitest.config.ts
	DATABASE_HOST=$(DB_HOST) pnpm vitest run --config src/vitest.unit.config.ts

test.unit:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │         RUNNING ALL UNIT TESTS         │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run --config src/vitest.unit.config.ts

test.e2e: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │         RUNNING ALL E2E TESTS          │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run --config src/vitest.config.ts 2>/dev/null

test.e2e.entity: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │      RUNNING E2E TESTS FOR ENTITY      │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/entity/test/entity.test.ts --config src/vitest.config.ts

test.e2e.waste-category: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │  RUNNING E2E TESTS FOR WASTE-CATEGORY  │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/waste-category/test/waste-category.test.ts --config src/vitest.config.ts

test.e2e.neighbor: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │     RUNNING E2E TESTS FOR NEIGHBOR     │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/neighbor/test/neighbor.test.ts --config src/vitest.config.ts

test.e2e.responsible: docker.run.test
	@echo " │   RUNNING E2E TESTS FOR RESPONSIBLE    │ "
	@echo " ╭────────────────────────────────────────╮ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/responsible/test/responsible.test.ts --config src/vitest.config.ts

test.e2e.reward-partner: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │  RUNNING E2E TESTS FOR REWARD-PARTNER  │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/reward-partner/test/reward-partner.test.ts --config src/vitest.config.ts

test.e2e.green-point: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │   RUNNING E2E TESTS FOR GREEN-POINT    │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/green-point/test/green-point.test.ts --config src/vitest.config.ts

test.e2e.coupon: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │      RUNNING E2E TESTS FOR COUPON      │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/coupon/test/coupon.test.ts --config src/vitest.config.ts

test.e2e.waste-transaction: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │ RUNNING E2E TESTS FOR WASTE-TRANSACTION│ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/waste-transaction/test/waste-transaction.test.ts --config src/vitest.config.ts

test.e2e.coupon-transaction: docker.run.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │RUNNING E2E TESTS FOR COUPON-TRANSACTION│ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm vitest run src/coupon-transaction/test/coupon-transaction.test.ts --config src/vitest.config.ts

migrations: docker.clean
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │    CREATING AND RUNNING MIGRATIONS     │ "
	@echo " ╰────────────────────────────────────────╯ "
	$(MAKE) migrations.create
	$(MAKE) migrations.up

migrations.create: docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          CREATING MIGRATIONS           │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm run migration:create

migrations.up: docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │           RUNNING MIGRATIONS           │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm run migration:up

migrations.delete:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          DELETING MIGRATIONS           │ "
	@echo " ╰────────────────────────────────────────╯ "
	rm -rf ./src/migrations

migrations.initial: migrations.delete docker.clean docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       INITIALIZING MIGRATIONS          │ "
	@echo " ╰────────────────────────────────────────╯ "
	sleep 1
	DATABASE_HOST=$(DB_HOST) pnpm run migration:initial

seed: docker.run.db migrations.up
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │         SEEDING DATABASE (DEV)         │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=$(DB_HOST) pnpm run seed

dev.setup: docker.clean docker.run.db migrations.up seed
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          DEV ENVIRONMENT READY         │ "
	@echo " ╰────────────────────────────────────────╯ "

pgadmin: docker.run.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │            RUNNING PGADMIN             │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose up -d pgadmin

pgadmin.stop:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │            STOPPING PGADMIN            │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose stop pgadmin
