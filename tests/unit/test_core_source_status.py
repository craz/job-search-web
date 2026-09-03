"""Unit coverage for Core vacancy source-status adapter (R2.4.1b)."""

from __future__ import annotations

import httpx
import pytest

from job_search_web.core_client import CoreClient


def test_get_vacancy_and_source_status(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[tuple[str, str, object]] = []

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        calls.append((method, url, kwargs.get("json")))
        return httpx.Response(200, json={"id": "vac-1", "source_status": "active"})

    monkeypatch.setattr(httpx, "request", fake_request)
    client = CoreClient("http://core.test/")
    client.get_vacancy("vac-1")
    client.post_vacancy_source_status(
        "vac-1", {"status": "archived", "checked_at": "2026-09-03T12:00:00Z"}
    )

    assert calls[0][:2] == ("GET", "http://core.test/api/v1/vacancies/vac-1")
    assert calls[1][:2] == (
        "POST",
        "http://core.test/api/v1/vacancies/vac-1/source-status",
    )
    assert calls[1][2] == {"status": "archived", "checked_at": "2026-09-03T12:00:00Z"}
