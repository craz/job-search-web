"""HTTP-only adapter for normalized, unconfirmed OSINT research proposals."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class OsintUnavailableError(Exception):
    """Signal that Web cannot reach the OSINT research API."""


class OsintGateway(Protocol):
    def list_people_proposals(self) -> tuple[int, Any]: ...

    def research_people(self, payload: dict[str, Any]) -> tuple[int, Any]: ...

    def confirm_person(self, payload: dict[str, Any]) -> tuple[int, Any]: ...

    def list_vacancy_mirrors(self) -> tuple[int, Any]: ...

    def discover_vacancy_mirrors(self, payload: dict[str, Any]) -> tuple[int, Any]: ...


class OsintClient:
    """Bounded HTTP client without access to OSINT storage or providers."""

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
            raise OsintUnavailableError from error

    def list_people_proposals(self) -> tuple[int, Any]:
        return self._request("GET", "/api/v1/people-proposals")

    def research_people(self, payload: dict[str, Any]) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/people-research", json=payload)

    def confirm_person(self, payload: dict[str, Any]) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/people-confirm", json=payload)

    def list_vacancy_mirrors(self) -> tuple[int, Any]:
        return self._request("GET", "/api/v1/vacancy-mirrors")

    def discover_vacancy_mirrors(self, payload: dict[str, Any]) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/vacancy-mirrors", json=payload)
