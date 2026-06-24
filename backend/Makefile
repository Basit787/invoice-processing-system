.PHONY: sync lock lint format fix check dev

export PYTHONPATH := src

sync:
	uv sync

lock:
	uv lock

lint:
	uv run ruff check src

format:
	uv run ruff format src

fix:
	uv run ruff check --fix src
	uv run ruff format src

check:
	uv run ruff check src
	uv run ruff format --check src

dev:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000 --app-dir src
