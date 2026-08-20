"""Synthetic Core gateway and ASGI helper shared by Web tests."""

from __future__ import annotations

from typing import Any

import anyio
import httpx

from job_search_web.app import create_app
from job_search_web.core_client import CoreUnavailableError


def vacancy(status: str = "new") -> dict[str, Any]:
    """Return one normalized public vacancy without personal data."""
    return {
        "id": "00000000-0000-0000-0000-000000000042",
        "source": "fixture",
        "external_id": "vacancy-42",
        "title": "Backend Engineer",
        "url": "https://example.com/vacancies/42",
        "description": "Synthetic Web fixture.",
        "status": status,
        "created_at": "2026-08-18T10:00:00Z",
        "updated_at": "2026-08-18T10:00:00Z",
        "company": {
            "id": "00000000-0000-0000-0000-000000000043",
            "name": "Example Labs",
            "source": "fixture",
            "external_id": "company-42",
        },
    }


def application() -> dict[str, Any]:
    """Return one normalized public Application linked to the fixture vacancy."""
    return {
        "id": "00000000-0000-0000-0000-000000000044",
        "source": "manual",
        "external_id": "application-44",
        "applied_at": "2026-08-20T10:00:00Z",
        "resume_version": "backend-v3",
        "cover_letter_version": None,
        "cover_letter_text": "Synthetic application fixture.",
        "result": None,
        "next_action": "Check for a reply",
        "next_action_at": "2026-08-27T10:00:00Z",
        "created_at": "2026-08-20T10:00:00Z",
        "updated_at": "2026-08-20T10:00:00Z",
        "vacancy": {
            "id": "00000000-0000-0000-0000-000000000042",
            "title": "Backend Engineer",
            "status": "new",
        },
    }


class StubCore:
    """In-memory contract double recording every Web-to-Core operation."""

    def __init__(self, *, unavailable: bool = False) -> None:
        """Start with one vacancy or force all operations to fail."""
        self.unavailable = unavailable
        self.items = [vacancy()]
        self.application_items: list[dict[str, Any]] = []
        self.calls: list[tuple[str, Any]] = []

    def _guard(self) -> None:
        """Raise the same transport signal as the real Core adapter."""
        if self.unavailable:
            raise CoreUnavailableError

    def list_vacancies(self) -> tuple[int, Any]:
        """Return the current synthetic collection."""
        self._guard()
        self.calls.append(("list", None))
        return 200, {"items": self.items, "total": len(self.items)}

    def create_vacancy(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record idempotency metadata and return a created vacancy."""
        self._guard()
        self.calls.append(("create", (payload, key)))
        created = vacancy()
        created["title"] = payload["title"]
        self.items.insert(0, created)
        return 201, created

    def update_status(self, vacancy_id: str, status: str) -> tuple[int, Any]:
        """Record and apply one synthetic status change."""
        self._guard()
        self.calls.append(("update", (vacancy_id, status)))
        updated = {**self.items[0], "status": status}
        self.items[0] = updated
        return 200, updated

    def list_applications(self) -> tuple[int, Any]:
        """Return the current synthetic Application collection."""
        self._guard()
        self.calls.append(("application-list", None))
        return 200, {"items": self.application_items, "total": len(self.application_items)}

    def create_application(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record a local Application and its idempotency metadata."""
        self._guard()
        self.calls.append(("application-create", (payload, key)))
        created = application()
        created["source"] = payload["source"]
        created["external_id"] = payload["external_id"]
        self.application_items.insert(0, created)
        return 201, created


class WebClient:
    """Synchronous facade around HTTPX's maintained ASGI transport."""

    def __init__(self, core: StubCore, *, live_reload: bool = False) -> None:
        """Bind requests to one Web app and synthetic Core gateway."""
        self.app = create_app(core, live_reload=live_reload)

    def request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        """Send one request without opening a network socket."""

        async def send() -> httpx.Response:
            transport = httpx.ASGITransport(app=self.app)
            async with httpx.AsyncClient(transport=transport, base_url="http://web.test") as client:
                return await client.request(method, path, **kwargs)

        return anyio.run(send)
