.PHONY: up down build logs ps restart clean env health lock sync lint format fix check

env:
	@test -f .env || cp .env.example .env

up: env
	docker compose up --build -d

down:
	docker compose down

build:
	docker compose build --no-cache

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose restart

health:
	curl -s http://localhost:$${API_PORT:-8000}/api/health | python3 -m json.tool

clean:
	docker compose down -v --remove-orphans

# Backend dev (uv + ruff) — run from project root
lock:
	docker run --rm -v "$(CURDIR)/backend:/app" -w /app ghcr.io/astral-sh/uv:latest uv lock

sync:
	cd backend && uv sync

lint:
	cd backend && uv run ruff check src

format:
	cd backend && uv run ruff format src

fix:
	cd backend && uv run ruff check --fix src && uv run ruff format src

check:
	cd backend && uv run ruff check src && uv run ruff format --check src

