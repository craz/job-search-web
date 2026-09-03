"""HTTP-only adapter for Scoring calibration labeling and semantic scoring (R2.4.1b)."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class ScoringUnavailableError(Exception):
    """Signal that Web cannot reach the configured Scoring API."""


class ScoringGateway(Protocol):
    """Minimal Scoring operations required by the owner labeling UI and manual score."""

    def get_calibration_suite(self, suite_id: str) -> tuple[int, Any]: ...

    def get_calibration_case(self, suite_id: str, case_id: str) -> tuple[int, Any]: ...

    def put_calibration_label(
        self, suite_id: str, case_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]: ...

    def put_calibration_session(
        self, suite_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]: ...

    def score_semantic_v1(self, vacancy_id: str) -> tuple[int, Any]: ...

    def get_job(self, job_id: str) -> tuple[int, Any]: ...

    def get_scoring_state(
        self, vacancy_id: str, scoring_mode: str = "semantic_v1"
    ) -> tuple[int, Any]: ...


class ScoringClient:
    """Bounded HTTP client with no knowledge of Scoring private storage."""

    def __init__(self, base_url: str, timeout_seconds: float = 20.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _request(self, method: str, path: str, **kwargs: Any) -> tuple[int, Any]:
        try:
            response = httpx.request(
                method, f"{self.base_url}{path}", timeout=self.timeout_seconds, **kwargs
            )
            return response.status_code, response.json()
        except (httpx.RequestError, ValueError) as error:
            raise ScoringUnavailableError from error

    def get_calibration_suite(self, suite_id: str) -> tuple[int, Any]:
        return self._request("GET", f"/api/v1/calibration/suites/{suite_id}")

    def get_calibration_case(self, suite_id: str, case_id: str) -> tuple[int, Any]:
        return self._request("GET", f"/api/v1/calibration/suites/{suite_id}/cases/{case_id}")

    def put_calibration_label(
        self, suite_id: str, case_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]:
        return self._request(
            "PUT",
            f"/api/v1/calibration/suites/{suite_id}/labels/{case_id}",
            json=payload,
        )

    def put_calibration_session(self, suite_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        return self._request(
            "PUT",
            f"/api/v1/calibration/suites/{suite_id}/session",
            json=payload,
        )

    def score_semantic_v1(self, vacancy_id: str) -> tuple[int, Any]:
        """Enqueue one semantic_v1 scoring job; never blocks on LLM completion."""
        return self._request(
            "POST",
            "/api/v1/score/semantic-v1",
            json={"vacancy_id": vacancy_id},
        )

    def get_job(self, job_id: str) -> tuple[int, Any]:
        """Return one Scoring job envelope for UI polling."""
        return self._request("GET", f"/api/v1/jobs/{job_id}")

    def get_scoring_state(
        self, vacancy_id: str, scoring_mode: str = "semantic_v1"
    ) -> tuple[int, Any]:
        """Return derived never_scored/current/stale state for one vacancy."""
        return self._request(
            "GET",
            f"/api/v1/vacancies/{vacancy_id}/scoring-state",
            params={"scoring_mode": scoring_mode},
        )
