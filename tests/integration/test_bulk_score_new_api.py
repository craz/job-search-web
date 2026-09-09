"""Integration: Web bulk-score-new orchestrates existing semantic enqueue."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from tests.support import StubCore, StubScoring, WebClient, vacancy


def _fresh_active(**overrides):
    item = vacancy()
    item["id"] = overrides.get("id", item["id"])
    item["source_status"] = "active"
    item["source_published_at"] = (datetime.now(UTC) - timedelta(days=1)).isoformat()
    item["first_seen_at"] = item["source_published_at"]
    item.pop("current_assessment", None)
    item.update(overrides)
    return item


def test_bulk_score_new_preview_and_enqueue() -> None:
    core = StubCore()
    scored = _fresh_active(id="scored-1")
    scored["current_assessment"] = {"id": "a1", "verdict": "skip"}
    core.items = [
        _fresh_active(id="new-1"),
        _fresh_active(id="new-2"),
        scored,
        _fresh_active(
            id="stale-1",
            source_published_at=(datetime.now(UTC) - timedelta(days=40)).isoformat(),
            first_seen_at=(datetime.now(UTC) - timedelta(days=40)).isoformat(),
        ),
    ]
    scoring = StubScoring()
    client = WebClient(core, scoring=scoring)

    preview = client.request("GET", "/api/v1/vacancies/bulk-score-new")
    assert preview.status_code == 200
    body = preview.json()
    assert body["eligible"] == 2
    assert body["cap"] >= 1
    assert body["definition"]["scoring_state"] == "unscored"

    response = client.request("POST", "/api/v1/vacancies/bulk-score-new")
    assert response.status_code == 200
    result = response.json()
    assert result["requested"] == 2
    assert result["enqueued"] == 2
    assert result["failed"] == 0
    assert set(result["enqueued_vacancy_ids"]) == {"new-1", "new-2"}
    assert ("score_semantic_v1", "new-1") in scoring.calls
    assert ("score_semantic_v1", "new-2") in scoring.calls
    assert ("score_semantic_v1", "scored-1") not in scoring.calls
    assert ("score_semantic_v1", "stale-1") not in scoring.calls


def test_bulk_score_new_no_duplicates_on_already_queued() -> None:
    core = StubCore()
    core.items = [_fresh_active(id="dup-1")]
    scoring = StubScoring()
    scoring.score_conflict = {
        "detail": {"code": "already_queued", "message": "active_queue_duplicate"}
    }
    client = WebClient(core, scoring=scoring)

    result = client.request("POST", "/api/v1/vacancies/bulk-score-new").json()
    assert result["enqueued"] == 0
    assert result["already_queued"] == 1
    assert result["failed"] == 0


def test_bulk_score_new_ui_contract_strings() -> None:
    page = WebClient(StubCore()).request("GET", "/")
    assert 'id="bulk-score-new"' in page.text
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text
    assert "Оценить новые" in js
    assert "/api/v1/vacancies/bulk-score-new" in js
    assert 'let vacancyListSort = "newest"' in js
