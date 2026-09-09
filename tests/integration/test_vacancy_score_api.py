"""Integration coverage for Web manual vacancy score orchestration (R2.4.1b)."""

from __future__ import annotations

from tests.support import StubCore, StubHh, StubScoring, WebClient, vacancy

VACANCY_ID = "00000000-0000-0000-0000-000000000042"


def test_score_blocks_archived_without_scoring_call() -> None:
    """Archived vacancies return 409 and never reach Scoring."""
    core = StubCore()
    core.items[0]["source_status"] = "archived"
    scoring = StubScoring()
    client = WebClient(core, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 409
    assert response.json()["code"] == "vacancy_archived"
    assert "score_semantic_v1" not in [call[0] for call in scoring.calls]


def test_score_unknown_refresh_to_archived_blocks() -> None:
    """Unknown → HH archived → Core write → 409 without Scoring."""
    core = StubCore()
    assert core.items[0]["source_status"] == "unknown"
    hh = StubHh()
    hh.source_status = "archived"
    scoring = StubScoring()
    client = WebClient(core, hh=hh, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 409
    assert response.json()["code"] == "vacancy_archived"
    assert ("vacancy-source-status", "vacancy-42") in hh.calls
    assert any(call[0] == "source-status" for call in core.calls)
    assert core.items[0]["source_status"] == "archived"
    assert "score_semantic_v1" not in [call[0] for call in scoring.calls]


def test_score_unknown_refresh_to_active_calls_scoring() -> None:
    """Unknown → HH active → Core write → Scoring semantic-v1 enqueue."""
    core = StubCore()
    hh = StubHh()
    hh.source_status = "active"
    scoring = StubScoring()
    client = WebClient(core, hh=hh, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 202
    body = response.json()
    assert body["status"] == "queued"
    assert body["job_id"]
    assert ("score_semantic_v1", VACANCY_ID) in scoring.calls
    assert core.items[0]["source_status"] == "active"


def test_score_active_calls_scoring_even_when_stale() -> None:
    """Active source_status still enqueues Scoring (freshness is UI-only)."""
    core = StubCore()
    item = vacancy()
    item["source_status"] = "active"
    item["source_published_at"] = "2025-01-01T00:00:00Z"
    item["first_seen_at"] = "2025-01-01T00:00:00Z"
    core.items = [item]
    scoring = StubScoring()
    hh = StubHh()
    client = WebClient(core, hh=hh, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 202
    assert ("score_semantic_v1", VACANCY_ID) in scoring.calls
    assert not any(call[0] == "vacancy-source-status" for call in hh.calls)


def test_score_unknown_still_unknown_is_retryable() -> None:
    """Unknown → HH unknown → 409 source_status_unknown without Scoring."""
    core = StubCore()
    hh = StubHh()
    hh.source_status = "unknown"
    scoring = StubScoring()
    client = WebClient(core, hh=hh, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "source_status_unknown"
    assert body["retryable"] is True
    assert "score_semantic_v1" not in [call[0] for call in scoring.calls]


def test_source_status_refresh_only_updates_core() -> None:
    """Optional refresh route updates Core without enqueueing Scoring."""
    core = StubCore()
    hh = StubHh()
    hh.source_status = "active"
    scoring = StubScoring()
    client = WebClient(core, hh=hh, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/source-status/refresh")

    assert response.status_code == 200
    assert response.json()["source_status"] == "active"
    assert "score_semantic_v1" not in [call[0] for call in scoring.calls]


def test_get_score_job_proxies_scoring() -> None:
    """UI can poll Scoring job status through the Web facade."""
    scoring = StubScoring()
    scoring.score_semantic_v1(VACANCY_ID)
    job_id = scoring.calls[-1][0] and list(scoring.jobs)[0]
    client = WebClient(StubCore(), scoring=scoring)

    response = client.request("GET", f"/api/v1/score/jobs/{job_id}")

    assert response.status_code == 200
    assert response.json()["status"] == "queued"


def test_score_already_queued_flattens_detail_for_browser() -> None:
    """Duplicate enqueue must surface flat code/message (not only FastAPI detail)."""
    core = StubCore()
    core.items[0]["source_status"] = "active"
    scoring = StubScoring()
    scoring.score_conflict = {
        "detail": {"code": "already_queued", "message": "active_queue_duplicate"},
    }
    client = WebClient(core, scoring=scoring)

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/score")

    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "already_queued"
    assert body["message"] == "active_queue_duplicate"
    assert "detail" not in body
    assert ("score_semantic_v1", VACANCY_ID) in scoring.calls


def test_browser_facing_error_payload_helper() -> None:
    from job_search_web.app import browser_facing_error_payload

    assert browser_facing_error_payload({"code": "x", "message": "y"}) == {
        "code": "x",
        "message": "y",
    }
    assert browser_facing_error_payload(
        {"detail": {"code": "already_queued", "message": "active_queue_duplicate"}}
    ) == {"code": "already_queued", "message": "active_queue_duplicate"}
    assert browser_facing_error_payload({"detail": "boom"}) == {
        "code": "error",
        "message": "boom",
    }
