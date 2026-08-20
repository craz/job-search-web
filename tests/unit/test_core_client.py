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


def test_application_create_forwards_contract_and_idempotency(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Application creation uses only the public Core path and retry header."""
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(201, json={"id": "application-44"})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, _ = CoreClient("http://core.test").create_application(
        {"vacancy_id": "vacancy-42", "source": "manual"}, "application-key"
    )

    assert status == 201
    assert captured["method"] == "POST"
    assert captured["url"] == "http://core.test/api/v1/applications"
    assert captured["kwargs"] == {
        "timeout": 5.0,
        "json": {"vacancy_id": "vacancy-42", "source": "manual"},
        "headers": {"Idempotency-Key": "application-key"},
    }


def test_metric_update_forwards_dated_contract_and_idempotency(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Metric writes use Core's dated PUT contract and explicit retry header."""
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(201, json={"metric_date": "2026-08-20"})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, _ = CoreClient("http://core.test").update_metric(
        "2026-08-20", {"applications": 2}, "metric-key"
    )

    assert status == 201
    assert captured["method"] == "PUT"
    assert captured["url"] == "http://core.test/api/v1/metrics/2026-08-20"
    assert captured["kwargs"] == {
        "timeout": 5.0,
        "json": {"applications": 2},
        "headers": {"Idempotency-Key": "metric-key"},
    }


def test_person_create_and_status_forward_public_contract(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Person writes use only versioned Core paths and explicit retry metadata."""
    captured: list[tuple[str, str, dict[str, object]]] = []

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.append((method, url, kwargs))
        return httpx.Response(201 if method == "POST" else 200, json={"status": "contacted"})

    monkeypatch.setattr(httpx, "request", fake_request)
    client = CoreClient("http://core.test")
    client.create_person({"full_name": "Alex Example"}, "person-key")
    client.update_person_status("person-45", "contacted")

    assert captured == [
        (
            "POST",
            "http://core.test/api/v1/people",
            {
                "timeout": 5.0,
                "json": {"full_name": "Alex Example"},
                "headers": {"Idempotency-Key": "person-key"},
            },
        ),
        (
            "PATCH",
            "http://core.test/api/v1/people/person-45",
            {"timeout": 5.0, "json": {"status": "contacted"}},
        ),
    ]
