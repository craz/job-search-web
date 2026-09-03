"""Unit coverage for Scoring semantic score adapter methods (R2.4.1b)."""

from __future__ import annotations

import httpx
import pytest

from job_search_web.hh_client import HhClient
from job_search_web.scoring_client import ScoringClient, ScoringUnavailableError


def test_score_semantic_v1_posts_vacancy_id(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(202, json={"job_id": "job-1", "status": "queued"})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, payload = ScoringClient("http://scoring.test/").score_semantic_v1("vac-1")

    assert status == 202
    assert payload["job_id"] == "job-1"
    assert captured["method"] == "POST"
    assert captured["url"] == "http://scoring.test/api/v1/score/semantic-v1"
    assert captured["kwargs"]["json"] == {"vacancy_id": "vac-1"}


def test_get_job_and_scoring_state_paths(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[tuple[str, str]] = []

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        calls.append((method, url))
        return httpx.Response(200, json={"ok": True})

    monkeypatch.setattr(httpx, "request", fake_request)
    client = ScoringClient("http://scoring.test")
    client.get_job("job-9")
    client.get_scoring_state("vac-2", scoring_mode="semantic_v1")

    assert calls == [
        ("GET", "http://scoring.test/api/v1/jobs/job-9"),
        ("GET", "http://scoring.test/api/v1/vacancies/vac-2/scoring-state"),
    ]


def test_scoring_transport_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    def fail(method: str, url: str, **kwargs: object) -> httpx.Response:
        raise httpx.ConnectError("refused", request=httpx.Request(method, url))

    monkeypatch.setattr(httpx, "request", fail)
    with pytest.raises(ScoringUnavailableError):
        ScoringClient("http://scoring.test").score_semantic_v1("vac-1")


def test_hh_source_status_path(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(200, json={"status": "active"})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, payload = HhClient("http://hh.test/").get_vacancy_source_status("12345")

    assert status == 200
    assert payload["status"] == "active"
    assert captured["url"] == "http://hh.test/api/v1/vacancies/12345/source-status"
