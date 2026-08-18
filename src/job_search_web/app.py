"""FastAPI delivery app serving the board and proxying versioned Core contracts."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from job_search_web.core_client import CoreClient, CoreGateway, CoreUnavailableError
from job_search_web.schemas import VacancyCreate, VacancyStatusUpdate

STATIC_DIR = Path(__file__).parent / "static"


def unavailable_response() -> JSONResponse:
    """Return a stable browser-facing error when Core cannot be reached."""
    return JSONResponse(
        status_code=503,
        content={"code": "core_unavailable", "message": "Core API is unavailable"},
    )


def proxy_response(status_code: int, payload: Any) -> JSONResponse:
    """Preserve Core HTTP semantics while keeping Web storage-agnostic."""
    return JSONResponse(status_code=status_code, content=payload)


def create_app(core: CoreGateway | None = None) -> FastAPI:
    """Build an isolated Web app around an injectable Core HTTP gateway."""
    gateway = core or CoreClient(os.getenv("CORE_API_URL", "http://127.0.0.1:8000"))
    application = FastAPI(title="Job Search Web", docs_url=None, redoc_url=None)
    application.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")

    @application.get("/", include_in_schema=False)
    def index() -> FileResponse:
        """Serve the single vacancy-board document."""
        return FileResponse(STATIC_DIR / "index.html")

    @application.get("/health/live")
    def liveness() -> dict[str, str]:
        """Report Web process liveness without hiding Core state."""
        return {"status": "ok", "component": "job-search-web"}

    @application.get("/api/v1/vacancies")
    def get_vacancies() -> JSONResponse:
        """Return vacancies obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_vacancies())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/vacancies")
    def post_vacancy(
        request: VacancyCreate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Forward a browser vacancy submission with safe retry semantics."""
        try:
            return proxy_response(
                *gateway.create_vacancy(request.model_dump(mode="json"), idempotency_key)
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.patch("/api/v1/vacancies/{vacancy_id}")
    def patch_status(vacancy_id: str, request: VacancyStatusUpdate) -> JSONResponse:
        """Forward a browser funnel transition to Core."""
        try:
            return proxy_response(*gateway.update_status(vacancy_id, request.status))
        except CoreUnavailableError:
            return unavailable_response()

    return application


app = create_app()
