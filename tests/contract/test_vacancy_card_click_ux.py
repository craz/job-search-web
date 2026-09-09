"""Contract: vacancy card click opens detail without owner-decision false positive."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"


def test_owner_decision_click_targets_button_only() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    # Article also carries data-owner-decision for filtering; handlers must not match it.
    assert 'closest("button[data-owner-decision]")' in js
    assert 'closest("button[data-action-channel]")' in js
    assert 'closest("[data-owner-decision]")' not in js
    assert 'closest("[data-action-channel]")' not in js


def test_vacancy_card_click_toggles_existing_detail() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "list-row-group--vacancy" in js
    assert "details.row-detail" in js
    assert "details.open = !details.open" in js
    assert "snapshotOpenVacancyDetails" in js
    assert "restoreOpenVacancyDetails" in js
    assert "window.scrollTo(0, scrollY)" in js
    # Nested controls must not toggle the card.
    assert "a, button, select, input, textarea, label, summary" in js
