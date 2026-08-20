"""HTTP-only adapter for the public Core vacancy contract."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class CoreUnavailableError(Exception):
    """Signal that Web cannot reach the configured Core API."""


class CoreGateway(Protocol):
    """Minimal Core operations required by the vacancy and Application views."""

    def list_vacancies(self) -> tuple[int, Any]:
        """Return the Core status and decoded vacancy collection."""
        ...

    def create_vacancy(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Create or replay one vacancy through Core."""
        ...

    def update_status(self, vacancy_id: str, status: str) -> tuple[int, Any]:
        """Update one vacancy status through Core."""
        ...

    def list_applications(self) -> tuple[int, Any]:
        """Return normalized Applications from Core."""
        ...

    def create_application(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Create or replay one local Application record through Core."""
        ...

    def list_metrics(self) -> tuple[int, Any]:
        """Return bounded Daily Metric history from Core."""
        ...

    def update_metric(self, metric_date: str, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Apply one replay-safe partial Daily Metric snapshot through Core."""
        ...


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

    def list_vacancies(self) -> tuple[int, Any]:
        """Fetch normalized vacancies from Core."""
        return self._request("GET", "/api/v1/vacancies")

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
