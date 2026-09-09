"""HTTP-only adapter for the public Core vacancy contract."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class CoreUnavailableError(Exception):
    """Signal that Web cannot reach the configured Core API."""


class CoreGateway(Protocol):
    """Minimal Core operations required by the vacancy and Application views."""

    def list_vacancies(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Return the Core status and decoded vacancy collection."""
        ...

    def get_vacancy(self, vacancy_id: str) -> tuple[int, Any]:
        """Return one vacancy by local id."""
        ...

    def create_vacancy(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Create or replay one vacancy through Core."""
        ...

    def update_status(self, vacancy_id: str, status: str) -> tuple[int, Any]:
        """Update one vacancy status through Core."""
        ...

    def update_owner_decision(self, vacancy_id: str, owner_decision: str) -> tuple[int, Any]:
        """Update owner review decision through Core (not Assessment.verdict)."""
        ...

    def update_action_plan(self, vacancy_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Update intended action channel / next action through Core."""
        ...

    def post_vacancy_source_status(
        self, vacancy_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]:
        """Record an explicit source-availability observation for one vacancy."""
        ...

    def list_applications(self) -> tuple[int, Any]:
        """Return normalized Applications from Core."""
        ...

    def create_application(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Create or replay one local Application record through Core."""
        ...

    def list_direct_outreaches(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Return owner-recorded direct outreach facts."""
        ...

    def create_direct_outreach(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Record one owner-reported contact fact through Core."""
        ...

    def list_employer_responses(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Return owner-recorded employer response facts."""
        ...

    def create_employer_response(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Record one owner-reported employer reply through Core."""
        ...

    def list_hiring_processes(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Return hiring processes from Core."""
        ...

    def create_hiring_process(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Start one owner-explicit hiring process through Core."""
        ...

    def transition_hiring_stage(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Append a stage transition through Core."""
        ...

    def update_hiring_process(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Update hiring process status through Core."""
        ...

    def create_hiring_activity(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Create a hiring activity under a process."""
        ...

    def update_hiring_activity(self, activity_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Update a hiring activity."""
        ...

    def list_offers(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Return offers from Core."""
        ...

    def create_offer(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Record one Offer through Core."""
        ...

    def decide_offer(self, offer_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Accept or decline an Offer through Core."""
        ...

    def list_metrics(self) -> tuple[int, Any]:
        """Return bounded Daily Metric history from Core."""
        ...

    def update_metric(self, metric_date: str, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Apply one replay-safe partial Daily Metric snapshot through Core."""
        ...

    def list_people(self) -> tuple[int, Any]: ...

    def create_person(self, payload: dict[str, Any], key: str) -> tuple[int, Any]: ...

    def update_person_status(self, person_id: str, status: str) -> tuple[int, Any]: ...

    def list_hypotheses(self) -> tuple[int, Any]: ...

    def create_hypothesis(self, payload: dict[str, Any], key: str) -> tuple[int, Any]: ...

    def close_hypothesis(self, hypothesis_id: str, result: str) -> tuple[int, Any]: ...

    def list_assessments(self) -> tuple[int, Any]: ...

    def create_assessment(self, payload: dict[str, Any], key: str) -> tuple[int, Any]: ...

    def get_candidate_context(self) -> tuple[int, Any]: ...

    def list_search_profiles(self) -> tuple[int, Any]: ...

    def create_search_profile(self, payload: dict[str, Any]) -> tuple[int, Any]: ...

    def get_search_profile(self, profile_id: str) -> tuple[int, Any]: ...

    def update_search_profile(
        self, profile_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]: ...

    def list_search_runs(self, *, search_profile_id: str | None = None) -> tuple[int, Any]: ...

    def get_search_run(self, run_id: str) -> tuple[int, Any]: ...

    def download_resume_artifact(self, artifact_id: str) -> tuple[int, bytes, dict[str, str]]: ...


class CoreClient:
    """Synchronous bounded HTTP client with no knowledge of Core persistence."""

    def __init__(self, base_url: str, timeout_seconds: float = 5.0) -> None:
        """Configure a normalized Core endpoint and request timeout."""
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _request(self, method: str, path: str, **kwargs: Any) -> tuple[int, Any]:
        """Perform one Core request and translate transport failures."""
        try:
            response = httpx.request(
                method,
                f"{self.base_url}{path}",
                timeout=self.timeout_seconds,
                **kwargs,
            )
        except httpx.RequestError as error:
            raise CoreUnavailableError from error
        try:
            payload = response.json()
        except ValueError as error:
            raise CoreUnavailableError from error
        return response.status_code, payload

    def list_vacancies(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Fetch normalized vacancies from Core, optionally with review pagination."""
        return self._request("GET", "/api/v1/vacancies", params=params)

    def get_vacancy(self, vacancy_id: str) -> tuple[int, Any]:
        """Fetch one normalized vacancy by local id."""
        return self._request("GET", f"/api/v1/vacancies/{vacancy_id}")

    def create_vacancy(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward a validated vacancy with its idempotency key."""
        return self._request(
            "POST",
            "/api/v1/vacancies",
            json=payload,
            headers={"Idempotency-Key": key},
        )

    def update_status(self, vacancy_id: str, status: str) -> tuple[int, Any]:
        """Forward a controlled status update to Core."""
        return self._request("PATCH", f"/api/v1/vacancies/{vacancy_id}", json={"status": status})

    def update_owner_decision(self, vacancy_id: str, owner_decision: str) -> tuple[int, Any]:
        """Forward owner review decision to Core."""
        return self._request(
            "PATCH",
            f"/api/v1/vacancies/{vacancy_id}/owner-decision",
            json={"owner_decision": owner_decision},
        )

    def update_action_plan(self, vacancy_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward intended action channel / next action to Core."""
        return self._request(
            "PATCH",
            f"/api/v1/vacancies/{vacancy_id}/action-plan",
            json=payload,
        )

    def post_vacancy_source_status(
        self, vacancy_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]:
        """Forward an explicit source-availability observation to Core."""
        return self._request(
            "POST",
            f"/api/v1/vacancies/{vacancy_id}/source-status",
            json=payload,
        )

    def list_applications(self) -> tuple[int, Any]:
        """Fetch normalized Applications from Core."""
        return self._request("GET", "/api/v1/applications")

    def create_application(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward a validated local Application with its idempotency key."""
        return self._request(
            "POST",
            "/api/v1/applications",
            json=payload,
            headers={"Idempotency-Key": key},
        )

    def list_direct_outreaches(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Fetch owner-recorded direct outreach facts from Core."""
        return self._request("GET", "/api/v1/direct-outreaches", params=params)

    def create_direct_outreach(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward owner-reported contact fact; does not send messages."""
        return self._request("POST", "/api/v1/direct-outreaches", json=payload)

    def list_employer_responses(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Fetch owner-recorded employer responses from Core."""
        return self._request("GET", "/api/v1/employer-responses", params=params)

    def create_employer_response(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward owner-reported employer reply; does not send messages."""
        return self._request("POST", "/api/v1/employer-responses", json=payload)

    def list_hiring_processes(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Fetch hiring processes from Core."""
        return self._request("GET", "/api/v1/hiring-processes", params=params)

    def create_hiring_process(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward owner-explicit hiring process start."""
        return self._request("POST", "/api/v1/hiring-processes", json=payload)

    def transition_hiring_stage(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward stage transition for an active hiring process."""
        return self._request("POST", f"/api/v1/hiring-processes/{process_id}/stages", json=payload)

    def update_hiring_process(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward hiring process status update."""
        return self._request("PATCH", f"/api/v1/hiring-processes/{process_id}", json=payload)

    def create_hiring_activity(self, process_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward hiring activity create; does not advance stage."""
        return self._request(
            "POST", f"/api/v1/hiring-processes/{process_id}/activities", json=payload
        )

    def update_hiring_activity(self, activity_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward hiring activity update."""
        return self._request("PATCH", f"/api/v1/hiring-activities/{activity_id}", json=payload)

    def list_offers(
        self, params: list[tuple[str, str]] | dict[str, Any] | None = None
    ) -> tuple[int, Any]:
        """Fetch offers from Core."""
        return self._request("GET", "/api/v1/offers", params=params)

    def create_offer(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward owner-recorded Offer create."""
        return self._request("POST", "/api/v1/offers", json=payload)

    def decide_offer(self, offer_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Forward Offer accept/decline."""
        return self._request("PATCH", f"/api/v1/offers/{offer_id}/decision", json=payload)

    def list_metrics(self) -> tuple[int, Any]:
        """Fetch bounded Daily Metric history from Core."""
        return self._request("GET", "/api/v1/metrics?limit=90")

    def update_metric(self, metric_date: str, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward a partial dated snapshot with its retry key."""
        return self._request(
            "PUT",
            f"/api/v1/metrics/{metric_date}",
            json=payload,
            headers={"Idempotency-Key": key},
        )

    def list_people(self) -> tuple[int, Any]:
        """Fetch confirmed contacts from Core."""
        return self._request("GET", "/api/v1/people")

    def create_person(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward a confirmed contact with its retry key."""
        return self._request(
            "POST", "/api/v1/people", json=payload, headers={"Idempotency-Key": key}
        )

    def update_person_status(self, person_id: str, status: str) -> tuple[int, Any]:
        """Forward a controlled local contact status update."""
        return self._request("PATCH", f"/api/v1/people/{person_id}", json={"status": status})

    def list_hypotheses(self) -> tuple[int, Any]:
        """Fetch measurable experiments from Core."""
        return self._request("GET", "/api/v1/hypotheses")

    def create_hypothesis(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward an experiment with its explicit retry key."""
        return self._request(
            "POST",
            "/api/v1/hypotheses",
            json=payload,
            headers={"Idempotency-Key": key},
        )

    def close_hypothesis(self, hypothesis_id: str, result: str) -> tuple[int, Any]:
        """Forward the observed result that closes an active experiment."""
        return self._request(
            "POST", f"/api/v1/hypotheses/{hypothesis_id}/close", json={"result": result}
        )

    def list_assessments(self) -> tuple[int, Any]:
        """Fetch normalized vacancy assessments from Core."""
        return self._request("GET", "/api/v1/assessments")

    def create_assessment(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Forward a normalized result and explicit retry key."""
        return self._request(
            "POST",
            "/api/v1/assessments",
            json=payload,
            headers={"Idempotency-Key": key},
        )

    def get_candidate_context(self) -> tuple[int, Any]:
        """Return CandidateProfile / ProfileVersion / HH resume link from Core."""
        return self._request("GET", "/api/v1/candidate-context")

    def list_search_profiles(self) -> tuple[int, Any]:
        """List mutable SearchProfiles (newest first)."""
        return self._request("GET", "/api/v1/search-profiles")

    def create_search_profile(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Create one SearchProfile with semantic criteria only."""
        return self._request("POST", "/api/v1/search-profiles", json=payload)

    def get_search_profile(self, profile_id: str) -> tuple[int, Any]:
        """Read one SearchProfile by id."""
        return self._request("GET", f"/api/v1/search-profiles/{profile_id}")

    def update_search_profile(self, profile_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        """Patch semantic SearchProfile criteria."""
        return self._request("PATCH", f"/api/v1/search-profiles/{profile_id}", json=payload)

    def list_search_runs(self, *, search_profile_id: str | None = None) -> tuple[int, Any]:
        """List SearchRuns, optionally filtered by SearchProfile."""
        path = "/api/v1/search-runs"
        if search_profile_id:
            path = f"{path}?search_profile_id={search_profile_id}"
        return self._request("GET", path)

    def get_search_run(self, run_id: str) -> tuple[int, Any]:
        """Read one SearchRun including snapshots and counters."""
        return self._request("GET", f"/api/v1/search-runs/{run_id}")

    def download_resume_artifact(self, artifact_id: str) -> tuple[int, bytes, dict[str, str]]:
        """Download auxiliary resume file bytes from Core."""
        try:
            response = httpx.get(
                f"{self.base_url}/api/v1/resume-artifacts/{artifact_id}/download",
                timeout=self.timeout_seconds,
            )
        except httpx.RequestError as error:
            raise CoreUnavailableError from error
        headers = {
            key.lower(): value
            for key, value in response.headers.items()
            if key.lower() in {"content-type", "content-disposition"}
        }
        return response.status_code, response.content, headers
