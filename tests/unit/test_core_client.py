"""Unit coverage for the HTTP-only Core adapter."""

import httpx
import pytest

from job_search_web.core_client import CoreClient, CoreUnavailableError


def test_client_normalizes_url_and_forwards_status(monkeypatch: pytest.MonkeyPatch) -> None:
    """Core response status and JSON remain intact across the adapter."""
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(200, json={"items": [], "total": 0})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, payload = CoreClient("http://core.test/").list_vacancies()

    assert (status, payload) == (200, {"items": [], "total": 0})
    assert captured["url"] == "http://core.test/api/v1/vacancies"


def test_transport_failure_becomes_core_unavailable(monkeypatch: pytest.MonkeyPatch) -> None:
    """Callers receive one stable exception instead of HTTPX implementation details."""

    def fail_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        request = httpx.Request(method, url)
        raise httpx.ConnectError("fixture connection refused", request=request)

    monkeypatch.setattr(httpx, "request", fail_request)
    with pytest.raises(CoreUnavailableError):
        CoreClient("http://core.test").list_vacancies()
