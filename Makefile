.PHONY: docker docker.db docker.build docker.db.test docker.stop docker.clean run run.dev migrations

# ############# COMMANDS ############ #
docker: docker.clean docker.build docker.db docker.db.test
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │  RUNNING CONTAINER FOR BACKEND SERVER  │ "
	@echo " ╰────────────────────────────────────────╯ "
	sleep 1
	docker compose up -d apiserver

docker.db:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │   RUNNING CONTAINER FOR THE DATABASE   │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose up -d database

docker.build:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │          BUILDING DOCKER IMAGE         │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose build

docker.db.test:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │       RUNNING CONTAINER FOR TESTS      │ "
	@echo " ╰────────────────────────────────────────╯ "
	docker compose up -d database-test

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

run: docker.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │             RUNNING SERVER             │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=localhost pnpm start

run.dev: docker.db
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │      RUNNING SERVER IN WATCH MODE      │ "
	@echo " ╰────────────────────────────────────────╯ "
	DATABASE_HOST=localhost pnpm dev

migrations:
	@echo " ╭────────────────────────────────────────╮ "
	@echo " │           RUNNING MIGRATIONS           │ "
	@echo " ╰────────────────────────────────────────╯ "
	pnpm run migration:create
	pnpm run migration:run
