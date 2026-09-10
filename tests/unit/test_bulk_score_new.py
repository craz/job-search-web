"""Unit coverage for bulk «Оценить новые» selection and aggregation."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from job_search_web.bulk_score_new import (
    classify_score_response,
    collect_eligible_new_vacancy_ids,
    is_fresh_for_bulk,
    run_bulk_score_new,
)


def test_freshness_window_excludes_stale() -> None:
    now = datetime(2026, 9, 9, tzinfo=UTC)
    fresh = {
        "source_published_at": (now - timedelta(days=3)).isoformat(),
    }
    stale = {
        "first_seen_at": (now - timedelta(days=30)).isoformat(),
    }
    assert is_fresh_for_bulk(fresh, now=now, max_age_days=14) is True
    assert is_fresh_for_bulk(stale, now=now, max_age_days=14) is False


def test_collect_eligible_ignores_scored_failed_and_stale() -> None:
    now = datetime(2026, 9, 9, tzinfo=UTC)

    def list_vacancies(params: list[tuple[str, str]]):
        assert ("scoring_state", "unscored") in params
        assert ("source_status", "active") in params
        assert ("sort", "newest") in params
        return 200, {
            "items": [
                {
                    "id": "fresh-1",
                    "source_status": "active",
                    "source_published_at": (now - timedelta(days=1)).isoformat(),
                },
                {
                    "id": "failed-1",
                    "source_status": "active",
                    "source_published_at": (now - timedelta(days=1)).isoformat(),
                },
                {
                    "id": "stale-1",
                    "source_status": "active",
                    "first_seen_at": (now - timedelta(days=40)).isoformat(),
                },
                {
                    "id": "scored-1",
                    "source_status": "active",
                    "source_published_at": (now - timedelta(days=1)).isoformat(),
                    "current_assessment": {"id": "a1"},
                },
            ],
            "total": 4,
            "limit": 100,
            "offset": 0,
        }

    ids = collect_eligible_new_vacancy_ids(
        list_vacancies=list_vacancies,
        failed_ids={"failed-1"},
        now=now,
        max_age_days=14,
    )
    assert ids == ["fresh-1"]


def test_run_bulk_partial_failure_and_cap() -> None:
    calls: list[str] = []

    def score_one(vacancy_id: str):
        calls.append(vacancy_id)
        if vacancy_id == "b":
            return 409, {"code": "already_queued", "message": "active_queue_duplicate"}
        if vacancy_id == "c":
            return 503, {"code": "ollama_unavailable", "message": "ollama_unavailable"}
        if vacancy_id == "d":
            return 202, {"job_id": "j-d", "status": "done", "reused_existing": True}
        return 202, {"job_id": f"j-{vacancy_id}", "status": "queued"}

    result = run_bulk_score_new(
        vacancy_ids=["a", "b", "c", "d", "e", "f"],
        score_one=score_one,
        cap=2,
    )
    # Cap counts new enqueues only: a(enqueued), b(queued), c(fail), d(scored), e(enqueued) → stop.
    assert calls == ["a", "b", "c", "d", "e"]
    assert result["requested"] == 6
    assert result["attempted"] == 5
    assert result["enqueued"] == 2
    assert result["already_queued"] == 1
    assert result["failed"] == 1
    assert result["already_scored"] == 1
    assert result["remaining"] == 2  # c failed + f not attempted
    assert result["enqueued_vacancy_ids"] == ["a", "e"]
    assert result["job_ids"] == ["j-a", "j-e"]


def test_run_bulk_second_pass_skips_already_queued_to_fill_cap() -> None:
    calls: list[str] = []

    def score_one(vacancy_id: str):
        calls.append(vacancy_id)
        if vacancy_id in {"q1", "q2"}:
            return 409, {"code": "already_queued", "message": "active_queue_duplicate"}
        return 202, {"job_id": f"j-{vacancy_id}", "status": "queued"}

    result = run_bulk_score_new(
        vacancy_ids=["q1", "q2", "n1", "n2", "n3"],
        score_one=score_one,
        cap=2,
    )
    assert calls == ["q1", "q2", "n1", "n2"]
    assert result["enqueued"] == 2
    assert result["already_queued"] == 2
    assert result["enqueued_vacancy_ids"] == ["n1", "n2"]
    assert result["remaining"] == 1


def test_classify_score_response_buckets() -> None:
    assert classify_score_response(202, {"status": "queued", "job_id": "1"}) == "enqueued"
    assert classify_score_response(409, {"code": "already_queued"}) == "already_queued"
    assert classify_score_response(202, {"status": "done", "reused_existing": True}) == (
        "already_scored"
    )
    assert classify_score_response(503, {"code": "ollama_unavailable"}) == "failed"
