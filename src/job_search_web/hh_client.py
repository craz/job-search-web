"""HTTP-only adapter for product-facing HH connection status."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class HhUnavailableError(Exception):
    """Signal that Web cannot reach the HH connection API."""


class HhGateway(Protocol):
    def connection_status(self) -> tuple[int, Any]: ...

    def health_ready(self) -> tuple[int, Any]: ...

    def account_status(self) -> tuple[int, Any]: ...

    def resumes_list(self) -> tuple[int, Any]: ...

    def set_active_resume(self, *, external_id: str | None) -> tuple[int, Any]: ...

    def sync_resume_content(self, *, external_id: str | None = None) -> tuple[int, Any]: ...

    def open_login(self) -> tuple[int, Any]: ...

    def confirm_login(self, *, confirmed: bool) -> tuple[int, Any]: ...

    def search_vacancies(self, payload: dict[str, Any]) -> tuple[int, Any]: ...

    def search_suitable_vacancies(
        self, payload: dict[str, Any] | None = None
    ) -> tuple[int, Any]: ...

    def get_vacancy_source_status(self, external_id: str) -> tuple[int, Any]: ...


class HhClient:
    """Bounded HTTP client for HH connection/account; never touches HH volumes."""

    def __init__(self, base_url: str, timeout_seconds: float = 10.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def _request(
        self, method: str, path: str, *, timeout: float | None = None, **kwargs: Any
    ) -> tuple[int, Any]:
        try:
            response = httpx.request(
                method,
                f"{self.base_url}{path}",
                timeout=timeout if timeout is not None else self.timeout_seconds,
                **kwargs,
            )
            return response.status_code, response.json()
        except (httpx.RequestError, ValueError) as error:
            raise HhUnavailableError from error

    def connection_status(self) -> tuple[int, Any]:
        return self._request("GET", "/api/v1/connection")

    def health_ready(self) -> tuple[int, Any]:
        """HH readiness including browser egress CONNECT probe."""
        return self._request("GET", "/health/ready", timeout=max(self.timeout_seconds, 10.0))

    def account_status(self) -> tuple[int, Any]:
        return self._request("GET", "/api/v1/account")

    def resumes_list(self) -> tuple[int, Any]:
        # Browser RO navigation can exceed the default short proxy timeout.
        return self._request("GET", "/api/v1/resumes", timeout=max(self.timeout_seconds, 60.0))

    def set_active_resume(self, *, external_id: str | None) -> tuple[int, Any]:
        return self._request(
            "PUT",
            "/api/v1/resumes/active",
            json={"external_id": external_id},
            timeout=max(self.timeout_seconds, 60.0),
        )

    def sync_resume_content(self, *, external_id: str | None = None) -> tuple[int, Any]:
        """Manual HH→Core resume content sync (R2.1.3 / R2.1.5 Web CTA)."""
        payload: dict[str, Any] = {}
        if external_id is not None:
            payload["external_id"] = external_id
        return self._request(
            "POST",
            "/api/v1/resumes/sync",
            json=payload,
            timeout=max(self.timeout_seconds, 90.0),
        )

    def open_login(self) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/connection/open-login", json={})

    def confirm_login(self, *, confirmed: bool) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/connection/confirm", json={"confirmed": confirmed})

    def search_vacancies(self, payload: dict[str, Any]) -> tuple[int, Any]:
        """Run HH SearchRun orchestration (bounded; measured ~151s for max_pages=1)."""
        return self._request(
            "POST",
            "/api/v1/vacancies/search",
            json=payload,
            timeout=max(self.timeout_seconds, 180.0),
        )

    def search_suitable_vacancies(self, payload: dict[str, Any] | None = None) -> tuple[int, Any]:
        """Primary resume-suitable SearchRun (bounded browser acquire)."""
        return self._request(
            "POST",
            "/api/v1/vacancies/suitable",
            json=payload or {},
            timeout=max(self.timeout_seconds, 180.0),
        )

    def get_vacancy_source_status(self, external_id: str) -> tuple[int, Any]:
        """RO check whether one HH vacancy looks active or archived on the source."""
        return self._request(
            "GET",
            f"/api/v1/vacancies/{external_id}/source-status",
            timeout=max(self.timeout_seconds, 60.0),
        )
