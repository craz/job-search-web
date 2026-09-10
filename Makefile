.PHONY: bootstrap format format-check lint typecheck js-syntax js-smoke unit integration contract bdd test dev build smoke

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

js-syntax:
	node scripts/check-static-js.mjs

js-smoke:
	node scripts/bootstrap-smoke.mjs

unit:
	$(UV_RUN) pytest -q tests/unit

integration:
	$(UV_RUN) pytest -q tests/integration

contract:
	$(UV_RUN) pytest -q tests/contract

bdd:
	$(UV_RUN) pytest -q tests/bdd

# js-syntax / js-smoke are mandatory: contract string tests alone must not claim PASS
# when shipped app.js cannot parse or bootstrap.
test: format-check lint typecheck js-syntax unit integration contract bdd js-smoke

dev:
	$(UV_RUN) uvicorn job_search_web.app:app --host 127.0.0.1 --port $${WEB_PORT:-8080} --reload

build:
	docker build -t job-search-web:dev .

smoke:
	$(UV_RUN) python -m job_search_web.smoke
