"""FastAPI delivery app serving the board and proxying versioned Core contracts."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, Header, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from job_search_web.automation_client import (
    AutomationClient,
    AutomationGateway,
    AutomationUnavailableError,
)
from job_search_web.core_client import CoreClient, CoreGateway, CoreUnavailableError
from job_search_web.hh_client import HhClient, HhGateway, HhUnavailableError
from job_search_web.osint_client import OsintClient, OsintGateway, OsintUnavailableError
from job_search_web.schemas import (
    ApplicationCreate,
    AssessmentCreate,
    DailyMetricUpdate,
    DirectOutreachCreate,
    HypothesisClose,
    HypothesisCreate,
    PeopleConfirmRequest,
    PeopleResearchRequest,
    PersonCreate,
    PersonStatusUpdate,
    VacancyActionPlanUpdate,
    VacancyCreate,
    VacancyMirrorRequest,
    VacancyOwnerDecisionUpdate,
    VacancyStatusUpdate,
)
from job_search_web.scoring_client import ScoringClient, ScoringGateway, ScoringUnavailableError

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


def scoring_unavailable_response() -> JSONResponse:
    """Return a stable browser-facing error when Scoring cannot be reached."""
    return JSONResponse(
        status_code=503,
        content={
            "code": "scoring_unavailable",
            "message": (
                "Scoring сейчас недоступен. Очередь и ваши решения работают; "
                "оценку повторите позже."
            ),
        },
    )


def automation_unavailable_response() -> JSONResponse:
    """Return a stable browser-facing error when automation cannot be reached."""
    return JSONResponse(
        status_code=503,
        content={
            "code": "automation_unavailable",
            "message": "Автоматизация сейчас недоступна",
        },
    )


def hh_unavailable_response() -> JSONResponse:
    """Return a stable browser-facing error when HH cannot be reached."""
    return JSONResponse(
        status_code=503,
        content={"code": "hh_unavailable", "message": "HH connection API is unavailable"},
    )


def _source_status_of(vacancy: dict[str, Any]) -> str:
    """Normalize Core vacancy source_status; missing values behave as unknown."""
    value = vacancy.get("source_status")
    if value in {"active", "archived", "unknown"}:
        return str(value)
    return "unknown"


def _vacancy_archived_response() -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={
            "code": "vacancy_archived",
            "message": "Vacancy is archived on the source; scoring is blocked",
        },
    )


def _source_status_unknown_response() -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={
            "code": "source_status_unknown",
            "message": "Vacancy source status is still unknown after refresh",
            "retryable": True,
        },
    )


def create_app(
    core: CoreGateway | None = None,
    osint: OsintGateway | None = None,
    hh: HhGateway | None = None,
    scoring: ScoringGateway | None = None,
    automation: AutomationGateway | None = None,
    *,
    live_reload: bool | None = None,
) -> FastAPI:
    """Build an isolated Web app around injectable Core/OSINT/HH/Scoring HTTP gateways."""
    gateway = core or CoreClient(os.getenv("CORE_API_URL", "http://127.0.0.1:8000"))
    osint_gateway = osint or OsintClient(os.getenv("OSINT_API_URL", "http://127.0.0.1:8081"))
    hh_gateway = hh or HhClient(os.getenv("HH_API_URL", "http://127.0.0.1:8092"))
    scoring_gateway = scoring or ScoringClient(
        os.getenv("SCORING_API_URL", "http://127.0.0.1:8090")
    )
    automation_gateway = automation or AutomationClient(
        os.getenv("AUTOMATION_API_URL", "http://127.0.0.1:8095")
    )
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

    @application.get("/calibration", include_in_schema=False)
    def calibration_page() -> FileResponse:
        """Serve the blind owner calibration labeling UI."""
        return FileResponse(STATIC_DIR / "calibration.html")

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

    @application.post("/api/v1/hh/resumes/sync")
    def post_hh_resume_sync(payload: dict[str, Any]) -> JSONResponse:
        """Proxy manual resume content sync to HH (R2.1.5); Core remains SoT."""
        external_id = payload.get("external_id")
        if external_id is not None and not isinstance(external_id, str):
            return JSONResponse(
                status_code=400,
                content={
                    "code": "invalid_request",
                    "message": "external_id must be a string when provided",
                },
            )
        try:
            return proxy_response(
                *hh_gateway.sync_resume_content(
                    external_id=external_id if isinstance(external_id, str) else None
                )
            )
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH resumes sync API is unavailable",
                    "ok": False,
                    "status": "unavailable",
                },
            )

    @application.get("/api/v1/candidate-context")
    def get_candidate_context() -> JSONResponse:
        """Return Core CandidateProfile / HH link / resume content meta."""
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
                    "resume_content": None,
                },
            )

    @application.get("/api/v1/resume-artifacts/{artifact_id}/download", response_model=None)
    def download_resume_artifact(artifact_id: str) -> Response | JSONResponse:
        """Proxy exact stored resume file bytes from Core."""
        try:
            status, payload, headers = gateway.download_resume_artifact(artifact_id)
        except CoreUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "core_unavailable",
                    "message": "Core resume artifact download is unavailable",
                },
            )
        if status != 200:
            return JSONResponse(status_code=status, content={"code": "download_failed"})
        media_type = headers.get("content-type", "application/octet-stream")
        response_headers = {}
        if "content-disposition" in headers:
            response_headers["Content-Disposition"] = headers["content-disposition"]
        return Response(content=payload, media_type=media_type, headers=response_headers)

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

    @application.get("/api/v1/search-profiles")
    def get_search_profiles() -> JSONResponse:
        """List SearchProfiles from Core (newest first)."""
        try:
            return proxy_response(*gateway.list_search_profiles())
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/search-profiles")
    def post_search_profile(payload: dict[str, Any]) -> JSONResponse:
        """Create one SearchProfile with semantic criteria only."""
        try:
            return proxy_response(*gateway.create_search_profile(payload))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/search-profiles/{profile_id}")
    def get_search_profile(profile_id: str) -> JSONResponse:
        """Read one SearchProfile."""
        try:
            return proxy_response(*gateway.get_search_profile(profile_id))
        except CoreUnavailableError:
            return unavailable_response()

    @application.patch("/api/v1/search-profiles/{profile_id}")
    def patch_search_profile(profile_id: str, payload: dict[str, Any]) -> JSONResponse:
        """Update semantic SearchProfile criteria."""
        try:
            return proxy_response(*gateway.update_search_profile(profile_id, payload))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/search-runs")
    def get_search_runs(search_profile_id: str | None = None) -> JSONResponse:
        """List SearchRuns; optional filter by SearchProfile."""
        try:
            return proxy_response(*gateway.list_search_runs(search_profile_id=search_profile_id))
        except CoreUnavailableError:
            return unavailable_response()

    @application.get("/api/v1/search-runs/{run_id}")
    def get_search_run(run_id: str) -> JSONResponse:
        """Read one SearchRun including counters and snapshots."""
        try:
            return proxy_response(*gateway.get_search_run(run_id))
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/hh/vacancies/search")
    def post_hh_vacancies_search(payload: dict[str, Any]) -> JSONResponse:
        """Proxy HH profile_search orchestration (secondary/manual path)."""
        profile_id = payload.get("search_profile_id")
        if not isinstance(profile_id, str) or not profile_id.strip():
            return JSONResponse(
                status_code=400,
                content={
                    "code": "invalid_request",
                    "message": "search_profile_id is required (string)",
                },
            )
        execution = payload.get("execution")
        if execution is not None and not isinstance(execution, dict):
            return JSONResponse(
                status_code=400,
                content={"code": "invalid_request", "message": "execution must be an object"},
            )
        body: dict[str, Any] = {"search_profile_id": profile_id.strip()}
        if isinstance(execution, dict):
            body["execution"] = execution
        try:
            return proxy_response(*hh_gateway.search_vacancies(body))
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH vacancy search API is unavailable",
                },
            )

    @application.post("/api/v1/hh/vacancies/suitable")
    def post_hh_vacancies_suitable(payload: dict[str, Any] | None = None) -> JSONResponse:
        """Proxy primary resume-suitable SearchRun orchestration."""
        body = payload if isinstance(payload, dict) else {}
        execution = body.get("execution")
        if execution is not None and not isinstance(execution, dict):
            return JSONResponse(
                status_code=400,
                content={"code": "invalid_request", "message": "execution must be an object"},
            )
        request_body: dict[str, Any] = {}
        if isinstance(execution, dict):
            request_body["execution"] = execution
        try:
            return proxy_response(*hh_gateway.search_suitable_vacancies(request_body))
        except HhUnavailableError:
            return JSONResponse(
                status_code=503,
                content={
                    "code": "hh_unavailable",
                    "message": "HH suitable vacancy API is unavailable",
                },
            )

    @application.get("/api/v1/automation/status")
    def get_automation_status() -> JSONResponse:
        """Return automation enablement, schedule and last cycle summary."""
        try:
            return proxy_response(*automation_gateway.get_status())
        except AutomationUnavailableError:
            return automation_unavailable_response()

    @application.post("/api/v1/automation/enable")
    def post_automation_enable(payload: dict[str, Any]) -> JSONResponse:
        """Enable or disable the daily vacancy automation loop."""
        enabled = payload.get("enabled")
        if not isinstance(enabled, bool):
            return JSONResponse(
                status_code=400,
                content={"code": "invalid_request", "message": "enabled must be a boolean"},
            )
        try:
            return proxy_response(*automation_gateway.set_enabled(enabled))
        except AutomationUnavailableError:
            return automation_unavailable_response()

    @application.post("/api/v1/automation/run-now")
    def post_automation_run_now() -> JSONResponse:
        """Trigger one automation cycle through the same path as the scheduler."""
        try:
            return proxy_response(*automation_gateway.run_now())
        except AutomationUnavailableError:
            return automation_unavailable_response()

    @application.get("/dev/revision", include_in_schema=False)
    def dev_revision() -> dict[str, str | bool]:
        """Expose an asset revision used by the local browser reload loop."""
        return {
            "enabled": live_reload_enabled,
            "revision": static_revision() if live_reload_enabled else "",
        }

    @application.get("/api/v1/vacancies")
    def get_vacancies(request: Request) -> JSONResponse:
        """Return a Core vacancy page, forwarding review filters and pagination."""
        try:
            return proxy_response(*gateway.list_vacancies(list(request.query_params.multi_items())))
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

    @application.patch("/api/v1/vacancies/{vacancy_id}/owner-decision")
    def patch_owner_decision(vacancy_id: str, request: VacancyOwnerDecisionUpdate) -> JSONResponse:
        """Forward owner review decision to Core without changing Assessment.verdict."""
        try:
            return proxy_response(
                *gateway.update_owner_decision(vacancy_id, request.owner_decision)
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.patch("/api/v1/vacancies/{vacancy_id}/action-plan")
    def patch_action_plan(vacancy_id: str, request: VacancyActionPlanUpdate) -> JSONResponse:
        """Forward intended channel/next action; does not create Application."""
        try:
            return proxy_response(
                *gateway.update_action_plan(
                    vacancy_id, request.model_dump(mode="json", exclude_none=True)
                )
            )
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

    @application.get("/api/v1/direct-outreaches")
    def get_direct_outreaches(request: Request) -> JSONResponse:
        """Return owner-recorded direct outreach facts from Core."""
        try:
            return proxy_response(
                *gateway.list_direct_outreaches(list(request.query_params.multi_items()))
            )
        except CoreUnavailableError:
            return unavailable_response()

    @application.post("/api/v1/direct-outreaches")
    def post_direct_outreach(request: DirectOutreachCreate) -> JSONResponse:
        """Record owner-reported contact fact; does not send any external message."""
        try:
            return proxy_response(
                *gateway.create_direct_outreach(request.model_dump(mode="json", exclude_none=True))
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

    @application.get("/api/v1/calibration/suites/{suite_id}")
    def get_calibration_suite(suite_id: str) -> JSONResponse:
        """Return calibration suite progress for blind owner labeling."""
        try:
            return proxy_response(*scoring_gateway.get_calibration_suite(suite_id))
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    @application.get("/api/v1/calibration/suites/{suite_id}/cases/{case_id}")
    def get_calibration_case(suite_id: str, case_id: str) -> JSONResponse:
        """Return one blind vacancy case without model/assessment fields."""
        try:
            return proxy_response(*scoring_gateway.get_calibration_case(suite_id, case_id))
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    @application.put("/api/v1/calibration/suites/{suite_id}/labels/{case_id}")
    def put_calibration_label(suite_id: str, case_id: str, payload: dict[str, Any]) -> JSONResponse:
        """Persist an owner label into the Scoring calibration store."""
        try:
            return proxy_response(
                *scoring_gateway.put_calibration_label(suite_id, case_id, payload)
            )
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    @application.put("/api/v1/calibration/suites/{suite_id}/session")
    def put_calibration_session(suite_id: str, payload: dict[str, Any]) -> JSONResponse:
        """Persist labeling navigation index for resume-after-reload."""
        try:
            return proxy_response(*scoring_gateway.put_calibration_session(suite_id, payload))
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    def refresh_vacancy_source_status(vacancy_id: str) -> tuple[int, Any] | JSONResponse:
        """HH RO check → Core source-status write → re-read vacancy.

        Returns either a ``(status_code, vacancy)`` tuple from Core or a
        browser-facing ``JSONResponse`` error. Does not call Scoring.
        """
        try:
            status, vacancy = gateway.get_vacancy(vacancy_id)
        except CoreUnavailableError:
            return unavailable_response()
        if status != 200 or not isinstance(vacancy, dict):
            return proxy_response(status, vacancy)

        external_id = str(vacancy.get("external_id") or "").strip()
        if not external_id:
            return JSONResponse(
                status_code=409,
                content={
                    "code": "source_status_unknown",
                    "message": "Vacancy has no external_id for source-status refresh",
                    "retryable": True,
                },
            )

        try:
            hh_status, hh_payload = hh_gateway.get_vacancy_source_status(external_id)
        except HhUnavailableError:
            return hh_unavailable_response()
        if hh_status != 200 or not isinstance(hh_payload, dict):
            return proxy_response(hh_status, hh_payload)

        observed = hh_payload.get("status")
        if observed not in {"active", "archived", "unknown"}:
            observed = "unknown"
        core_body: dict[str, Any] = {"status": observed}
        if hh_payload.get("reason"):
            core_body["reason"] = hh_payload["reason"]
        if hh_payload.get("checked_at"):
            core_body["checked_at"] = hh_payload["checked_at"]

        try:
            write_status, written = gateway.post_vacancy_source_status(vacancy_id, core_body)
        except CoreUnavailableError:
            return unavailable_response()
        if write_status not in {200, 201} or not isinstance(written, dict):
            return proxy_response(write_status, written)

        try:
            reread_status, reread = gateway.get_vacancy(vacancy_id)
        except CoreUnavailableError:
            return unavailable_response()
        if reread_status != 200 or not isinstance(reread, dict):
            return proxy_response(reread_status, reread)
        return reread_status, reread

    @application.post("/api/v1/vacancies/{vacancy_id}/source-status/refresh")
    def post_vacancy_source_status_refresh(vacancy_id: str) -> JSONResponse:
        """Refresh Core source_status from HH without enqueueing Scoring."""
        result = refresh_vacancy_source_status(vacancy_id)
        if isinstance(result, JSONResponse):
            return result
        return proxy_response(*result)

    @application.post("/api/v1/vacancies/{vacancy_id}/score")
    def post_vacancy_score(vacancy_id: str) -> JSONResponse:
        """Manual semantic_v1 score with source-status gate (R2.4.1b).

        Flow: Core vacancy → block archived → refresh unknown via HH→Core →
        enqueue Scoring only when source_status is active. Never invokes LLM
        inside Web; Scoring identity reuse handles double-submit.
        """
        try:
            status, vacancy = gateway.get_vacancy(vacancy_id)
        except CoreUnavailableError:
            return unavailable_response()
        if status != 200 or not isinstance(vacancy, dict):
            return proxy_response(status, vacancy)

        source_status = _source_status_of(vacancy)
        if source_status == "archived":
            return _vacancy_archived_response()

        if source_status == "unknown":
            refreshed = refresh_vacancy_source_status(vacancy_id)
            if isinstance(refreshed, JSONResponse):
                return refreshed
            _, vacancy = refreshed
            source_status = _source_status_of(vacancy)
            if source_status == "archived":
                return _vacancy_archived_response()
            if source_status != "active":
                return _source_status_unknown_response()

        try:
            return proxy_response(*scoring_gateway.score_semantic_v1(vacancy_id))
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    @application.get("/api/v1/score/jobs/{job_id}")
    def get_score_job(job_id: str) -> JSONResponse:
        """Proxy Scoring job status for light UI polling after queue accept."""
        try:
            return proxy_response(*scoring_gateway.get_job(job_id))
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    @application.get("/api/v1/semantic-failures")
    def get_semantic_failures() -> JSONResponse:
        """Proxy terminal semantic failure memory for vacancy board actions."""
        try:
            return proxy_response(*scoring_gateway.list_semantic_failures())
        except ScoringUnavailableError:
            return scoring_unavailable_response()

    return application


app = create_app()
