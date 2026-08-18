.PHONY: bootstrap format format-check lint typecheck unit integration contract bdd test dev build smoke

UV ?= uv
UV_RUN := env -u VIRTUAL_ENV $(UV) run
export UV_LINK_MODE := copy

bootstrap:
	./scripts/ensure-venv.sh

format:
	$(UV_RUN) ruff format .
	$(UV_RUN) ruff check --fix .

format-check:
	$(UV_RUN) ruff format --check .

lint:
	$(UV_RUN) ruff check .

typecheck:
	$(UV_RUN) mypy src

unit:
	$(UV_RUN) pytest -q tests/unit

integration:
	$(UV_RUN) pytest -q tests/integration

contract:
	$(UV_RUN) pytest -q tests/contract

bdd:
	$(UV_RUN) pytest -q tests/bdd

test: format-check lint typecheck unit integration contract bdd

dev:
	$(UV_RUN) uvicorn job_search_web.app:app --host 127.0.0.1 --port $${WEB_PORT:-8080} --reload

build:
	docker build -t job-search-web:dev .

smoke:
	$(UV_RUN) python -m job_search_web.smoke
