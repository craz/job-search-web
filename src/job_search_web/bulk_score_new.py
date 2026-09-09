"""Bulk enqueue of fresh never-scored vacancies through existing semantic_v1 path.

Product «новые» for the queue button is intentionally NOT funnel status ``new``
(that flag survives Assessment). It means: active on source, no current
Assessment, within AUTO_SCORE_MAX_AGE_DAYS freshness, not a known terminal
semantic failure — same freshness boundary automation uses so we never enqueue
the whole historical unscored backlog.
"""

from __future__ import annotations

import os
from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import Any

# Same env knobs as automation (docs/runbooks/local-stack.md).
BULK_SCORE_NEW_CAP = max(1, int(os.getenv("AUTO_SCORING_MAX_PER_CYCLE", "20")))
BULK_SCORE_NEW_MAX_AGE_DAYS = max(0, int(os.getenv("AUTO_SCORE_MAX_AGE_DAYS", "14")))
_PAGE_SIZE = 100


def publication_anchor(vacancy: dict[str, Any]) -> datetime | None:
    """Prefer source_published_at, else first_seen_at (automation freshness)."""
    for key in ("source_published_at", "first_seen_at"):
        raw = vacancy.get(key)
        if raw is None:
            continue
        if isinstance(raw, datetime):
            parsed = raw
        else:
            text = str(raw).strip()
            if not text:
                continue
            if text.endswith("Z"):
                text = text[:-1] + "+00:00"
            try:
                parsed = datetime.fromisoformat(text)
            except ValueError:
                continue
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=UTC)
        return parsed.astimezone(UTC)
    return None


def is_fresh_for_bulk(
    vacancy: dict[str, Any],
    *,
    now: datetime | None = None,
    max_age_days: int = BULK_SCORE_NEW_MAX_AGE_DAYS,
) -> bool:
    """True when vacancy is within the auto-score freshness window."""
    anchor = publication_anchor(vacancy)
    if anchor is None:
        return False
    current = now or datetime.now(UTC)
    return anchor >= current - timedelta(days=max_age_days)


def collect_eligible_new_vacancy_ids(
    *,
    list_vacancies: Callable[[list[tuple[str, str]]], tuple[int, Any]],
    failed_ids: set[str] | None = None,
    max_age_days: int = BULK_SCORE_NEW_MAX_AGE_DAYS,
    now: datetime | None = None,
) -> list[str]:
    """Server-side walk of Core unscored+active pages; ignore UI filters/page."""
    excluded = failed_ids or set()
    eligible: list[str] = []
    offset = 0
    while True:
        status, payload = list_vacancies(
            [
                ("scoring_state", "unscored"),
                ("source_status", "active"),
                ("sort", "newest"),
                ("include_current_assessment", "true"),
                ("limit", str(_PAGE_SIZE)),
                ("offset", str(offset)),
            ]
        )
        if status != 200 or not isinstance(payload, dict):
            break
        items = payload.get("items") or []
        if not isinstance(items, list) or not items:
            break
        for item in items:
            if not isinstance(item, dict):
                continue
            vacancy_id = str(item.get("id") or "").strip()
            if not vacancy_id or vacancy_id in excluded:
                continue
            if item.get("current_assessment"):
                continue
            if str(item.get("source_status") or "").lower() != "active":
                continue
            if not is_fresh_for_bulk(item, now=now, max_age_days=max_age_days):
                continue
            eligible.append(vacancy_id)
        total = payload.get("total")
        offset += len(items)
        if total is not None and offset >= int(total):
            break
        if len(items) < _PAGE_SIZE:
            break
    return eligible


def classify_score_response(status_code: int, payload: Any) -> str:
    """Map one existing score response into bulk aggregate buckets."""
    body = payload if isinstance(payload, dict) else {}
    code = str(body.get("code") or "")
    message = str(body.get("message") or "")
    if status_code in {200, 202}:
        if body.get("reused_existing") or body.get("status") == "done":
            return "already_scored"
        if body.get("job_id") or body.get("status") in {"queued", "processing"}:
            return "enqueued"
        return "enqueued"
    if code in {"already_queued", "active_queue_duplicate"} or message in {
        "already_queued",
        "active_queue_duplicate",
    }:
        return "already_queued"
    if code in {"semantic_identity_current"} or body.get("reused_existing"):
        return "already_scored"
    return "failed"


def run_bulk_score_new(
    *,
    vacancy_ids: list[str],
    score_one: Callable[[str], tuple[int, Any]],
    cap: int = BULK_SCORE_NEW_CAP,
) -> dict[str, Any]:
    """Enqueue up to ``cap`` ids through the existing single-score path."""
    limit = max(1, int(cap))
    requested = list(vacancy_ids)
    slice_ids = requested[:limit]
    counts = {
        "requested": len(requested),
        "attempted": len(slice_ids),
        "enqueued": 0,
        "already_queued": 0,
        "already_scored": 0,
        "failed": 0,
        "remaining": max(0, len(requested) - len(slice_ids)),
        "cap": limit,
    }
    job_ids: list[str] = []
    enqueued_items: list[dict[str, str]] = []
    failures: list[dict[str, str]] = []
    for vacancy_id in slice_ids:
        try:
            status_code, payload = score_one(vacancy_id)
        except Exception as error:  # noqa: BLE001 - one failure must not abort batch
            counts["failed"] += 1
            failures.append(
                {"vacancy_id": vacancy_id, "code": "score_exception", "message": str(error)}
            )
            continue
        bucket = classify_score_response(status_code, payload)
        counts[bucket] = int(counts[bucket]) + 1
        body = payload if isinstance(payload, dict) else {}
        job_id = str(body.get("job_id") or "")
        if bucket == "enqueued":
            item = {"vacancy_id": vacancy_id}
            if job_id:
                item["job_id"] = job_id
                job_ids.append(job_id)
            enqueued_items.append(item)
        if bucket == "failed":
            failures.append(
                {
                    "vacancy_id": vacancy_id,
                    "code": str(body.get("code") or f"http_{status_code}"),
                    "message": str(body.get("message") or "score_failed"),
                }
            )
    return {
        **counts,
        "job_ids": job_ids,
        "enqueued_items": enqueued_items,
        "enqueued_vacancy_ids": [item["vacancy_id"] for item in enqueued_items],
        "failures": failures,
    }
