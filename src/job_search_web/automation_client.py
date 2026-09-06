"""HTTP adapter for the vacancy automation control plane (PB-AUTO-00)."""

from __future__ import annotations

from typing import Any, Protocol

import httpx


class AutomationUnavailableError(Exception):
    """Signal that Web cannot reach the automation service."""


class AutomationGateway(Protocol):
    def get_status(self) -> tuple[int, Any]: ...

    def set_enabled(self, enabled: bool) -> tuple[int, Any]: ...

    def run_now(self) -> tuple[int, Any]: ...


class AutomationClient:
    def __init__(self, base_url: str, timeout_seconds: float = 650.0) -> None:
        self.base_url = base_url.rstrip("/")
        # Run now may wait for HH suitable acquisition (minutes).
        self.timeout_seconds = timeout_seconds

    def _request(self, method: str, path: str, **kwargs: Any) -> tuple[int, Any]:
        try:
            response = httpx.request(
                method,
                f"{self.base_url}{path}",
                timeout=self.timeout_seconds,
                **kwargs,
            )
            return response.status_code, response.json()
        except (httpx.RequestError, ValueError) as error:
            raise AutomationUnavailableError from error

    def get_status(self) -> tuple[int, Any]:
        return self._request("GET", "/api/v1/automation/status")

    def set_enabled(self, enabled: bool) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/automation/enable", json={"enabled": enabled})

    def run_now(self) -> tuple[int, Any]:
        return self._request("POST", "/api/v1/automation/run-now")
