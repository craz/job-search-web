"""FastAPI delivery app serving the board and proxying versioned Core contracts."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from job_search_web.core_client import CoreClient, CoreGateway, CoreUnavailableError
from job_search_web.hh_client import HhClient, HhGateway, HhUnavailableError
from job_search_web.osint_client import OsintClient, OsintGateway, OsintUnavailableError
from job_search_web.schemas import (
    ApplicationCreate,
    AssessmentCreate,
    DailyMetricUpdate,
    HypothesisClose,
    HypothesisCreate,
    PeopleConfirmRequest,
    PeopleResearchRequest,
    PersonCreate,
    PersonStatusUpdate,
    VacancyCreate,
    VacancyMirrorRequest,
    VacancyStatusUpdate,
)

STATIC_DIR = Path(__file__).parent / "static"


def static_revision() -> str:
    """Return a cheap revision that changes when a browser asset is edited."""
    timestamps = (path.stat().st_mtime_ns for path in STATIC_DIR.iterdir() if path.is_file())
    return str(max(timestamps, default=0))


def unavailable_response() -> JSONResponse:
    """Return a stable browser-facing error when Core cannot be reached."""
    return JSONResponse(
        status_code=503,
        content={"code": "core_unavailable", "message": "Core API is unavailable"},
    )


def proxy_response(status_code: int, payload: Any) -> JSONResponse:
    """Preserve Core HTTP semantics while keeping Web storage-agnostic."""
    return JSONResponse(status_code=status_code, content=payload)


def create_app(
    core: CoreGateway | None = None,
    osint: OsintGateway | None = None,
    hh: HhGateway | None = None,
    *,
    live_reload: bool | None = None,
) -> FastAPI:
    """Build an isolated Web app around injectable Core/OSINT/HH HTTP gateways."""
    gateway = core or CoreClient(os.getenv("CORE_API_URL", "http://127.0.0.1:8000"))
    osint_gateway = osint or OsintClient(os.getenv("OSINT_API_URL", "http://127.0.0.1:8081"))
    hh_gateway = hh or HhClient(os.getenv("HH_API_URL", "http://127.0.0.1:8092"))
    live_reload_enabled = (
        os.getenv("WEB_LIVE_RELOAD", "0") == "1" if live_reload is None else live_reload
    )
    application = FastAPI(title="Job Search Web", docs_url=None, redoc_url=None)
    application.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")

    @application.middleware("http")
    async def disable_dev_asset_cache(request: Request, call_next: Any) -> Any:
        """Prevent stale browser assets only in the explicit local dev mode."""
        response = await call_next(request)
        if live_reload_enabled and request.url.path.startswith("/assets/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    @application.get("/", include_in_schema=False)
    def index() -> FileResponse:
        """Serve the single vacancy-board document."""
        return FileResponse(STATIC_DIR / "index.html")

    @application.get("/health/live")
    def liveness() -> dict[str, str]:
        """Report Web process liveness without hiding Core state."""
        return {"status": "ok", "component": "job-search-web"}

    @application.get("/api/v1/hh/connection")
    def get_hh_connection() -> JSONResponse:
        """Return product-facing HH connection status without secrets."""
        try:
            return proxy_response(*hh_gateway.connection_status())
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH connection API is unavailable",
                    "status": "unavailable",
                },
            )

    @application.get("/api/v1/hh/account")
    def get_hh_account() -> JSONResponse:
        """Return normalized HH account/profile without raw /me or secrets."""
        try:
            return proxy_response(*hh_gateway.account_status())
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH account API is unavailable",
                    "status": "unavailable",
                    "account": None,
                },
            )

    @application.get("/api/v1/hh/resumes")
    def get_hh_resumes() -> JSONResponse:
        """Return normalized own-resume list (browser RO); never empty-success on auth fail."""
        try:
            return proxy_response(*hh_gateway.resumes_list())
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH resumes API is unavailable",
                    "status": "unavailable",
                    "items": [],
                },
            )

    @application.put("/api/v1/hh/resumes/active")
    def put_hh_active_resume(payload: dict[str, Any]) -> JSONResponse:
        """Set or clear active HH resume selection (R1.4); never invents Core linkage."""
        if "external_id" not in payload:
            return JSONResponse(
                status_code=400,
                content={
                    "code": "invalid_request",
                    "message": "external_id is required (string or null)",
                },
            )
        external_id = payload.get("external_id")
        if external_id is not None and not isinstance(external_id, str):
            return JSONResponse(
                status_code=400,
                content={
                    "code": "invalid_request",
                    "message": "external_id must be a string or null",
                },
            )
        try:
            return proxy_response(*hh_gateway.set_active_resume(external_id=external_id))
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH resumes API is unavailable",
                    "status": "unavailable",
                    "items": [],
                },
            )

    @application.get("/api/v1/candidate-context")
    def get_candidate_context() -> JSONResponse:
        """Return Core CandidateProfile / ProfileVersion / HH resume link (R1.5)."""
        try:
            return proxy_response(*gateway.get_candidate_context())
        except CoreUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "core_unavailable",
                    "message": "Core candidate-context API is unavailable",
                    "candidate_profile": None,
                    "profile_version": None,
                    "hh_resume_link": None,
                },
            )

    @application.post("/api/v1/hh/connection/open-login")
    def post_hh_open_login() -> JSONResponse:
        """Trigger existing HH noVNC login flow; never bypasses CAPTCHA."""
        try:
            return proxy_response(*hh_gateway.open_login())
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "hh_unavailable", "message": "HH connection API is unavailable"},
            )

    @application.post("/api/v1/hh/connection/confirm")
    def post_hh_confirm() -> JSONResponse:
        """Record explicit operator confirmation after interactive HH login."""
        try:
            return proxy_response(*hh_gateway.confirm_login(confirmed=True))
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "hh_unavailable", "message": "HH connection API is unavailable"},
            )

    @application.get("/dev/revision", include_in_schema=False)
    def dev_revision() -> dict[str, str | bool]:
        """Expose an asset revision used by the local browser reload loop."""
        return {
            "enabled": live_reload_enabled,
            "revision": static_revision() if live_reload_enabled else "",
        }

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

    @application.get("/api/v1/applications")
    def get_applications() -> JSONResponse:
        """Return local Application records obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_applications())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/applications")
    def post_application(
        request: ApplicationCreate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Record an Application fact without performing any external submission."""
        try:
            return proxy_response(
                *gateway.create_application(request.model_dump(mode="json"), idempotency_key)
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/metrics")
    def get_metrics() -> JSONResponse:
        """Return bounded Daily Metric history obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_metrics())
        except CoreUnavailableError:
            return unavailable_response()

    @application.put("/api/v1/metrics/{metric_date}")
    def put_metric(
        metric_date: str,
        request: DailyMetricUpdate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Forward one browser metric snapshot under replay-safe metadata."""
        if request.metric_date.isoformat() != metric_date:
            return JSONResponse(
                status_code=400,
                content={"code": "metric_date_mismatch", "message": "Metric dates differ"},
            )
        payload = request.model_dump(mode="json", exclude={"metric_date"}, exclude_none=True)
        try:
            return proxy_response(*gateway.update_metric(metric_date, payload, idempotency_key))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/people")
    def get_people() -> JSONResponse:
        """Return confirmed contacts obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_people())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/people")
    def post_person(
        request: PersonCreate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Forward a confirmed contact without discovery or messaging."""
        try:
            return proxy_response(
                *gateway.create_person(request.model_dump(mode="json"), idempotency_key)
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.patch("/api/v1/people/{person_id}")
    def patch_person(person_id: str, request: PersonStatusUpdate) -> JSONResponse:
        """Forward a local contact workflow state change."""
        try:
            return proxy_response(*gateway.update_person_status(person_id, request.status))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/osint/people-proposals")
    def get_people_proposals() -> JSONResponse:
        """Return normalized unconfirmed research without touching Core."""
        try:
            return proxy_response(*osint_gateway.list_people_proposals())
        except OsintUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "osint_unavailable", "message": "OSINT API is unavailable"},
            )

    @application.post("/api/v1/osint/people-research")
    def post_people_research(request: PeopleResearchRequest) -> JSONResponse:
        """Trigger bounded public research without creating a Core Person."""
        try:
            return proxy_response(*osint_gateway.research_people(request.model_dump(mode="json")))
        except OsintUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "osint_unavailable", "message": "OSINT API is unavailable"},
            )

    @application.post("/api/v1/osint/people-confirm")
    def post_people_confirm(request: PeopleConfirmRequest) -> JSONResponse:
        """Promote one proposed contact through OSINT into a Core Person."""
        try:
            return proxy_response(*osint_gateway.confirm_person(request.model_dump(mode="json")))
        except OsintUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "osint_unavailable", "message": "OSINT API is unavailable"},
            )

    @application.get("/api/v1/osint/vacancy-mirrors")
    def get_vacancy_mirrors() -> JSONResponse:
        """Return normalized unconfirmed vacancy mirrors without touching Core."""
        try:
            return proxy_response(*osint_gateway.list_vacancy_mirrors())
        except OsintUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "osint_unavailable", "message": "OSINT API is unavailable"},
            )

    @application.post("/api/v1/osint/vacancy-mirrors")
    def post_vacancy_mirrors(request: VacancyMirrorRequest) -> JSONResponse:
        """Trigger bounded career-page mirror search without Core writes."""
        try:
            return proxy_response(
                *osint_gateway.discover_vacancy_mirrors(request.model_dump(mode="json"))
            )
        except OsintUnavailableError:
            return JSONResponse(
                status_code=503,
                content={"code": "osint_unavailable", "message": "OSINT API is unavailable"},
            )

    @application.get("/api/v1/hypotheses")
    def get_hypotheses() -> JSONResponse:
        """Return experiments obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_hypotheses())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/hypotheses")
    def post_hypothesis(
        request: HypothesisCreate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Forward a measurable experiment under replay-safe metadata."""
        try:
            return proxy_response(
                *gateway.create_hypothesis(request.model_dump(mode="json"), idempotency_key)
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/hypotheses/{hypothesis_id}/close")
    def post_hypothesis_close(hypothesis_id: str, request: HypothesisClose) -> JSONResponse:
        """Forward an observed result without triggering external actions."""
        try:
            return proxy_response(*gateway.close_hypothesis(hypothesis_id, request.result))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/assessments")
    def get_assessments() -> JSONResponse:
        """Return normalized results obtained only through Core HTTP."""
        try:
            return proxy_response(*gateway.list_assessments())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/assessments")
    def post_assessment(
        request: AssessmentCreate,
        idempotency_key: str = Header(min_length=1, alias="Idempotency-Key"),
    ) -> JSONResponse:
        """Forward a normalized result without invoking a scoring provider."""
        try:
            return proxy_response(
                *gateway.create_assessment(request.model_dump(mode="json"), idempotency_key)
            )
        except CoreUnavailableError:
            return unavailable_response()

    return application


app = create_app()
