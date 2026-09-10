"""Contract: vacancy assessment UI exposes structured decision card."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"


def test_decision_card_helpers_in_app_js() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "renderAssessmentDecisionCard" in js
    assert "decision_card" in js
    assert "Hard blockers" in js
    assert "relevance_score_authoritative" in js
    assert "Служебная метка вердикта" in js


def test_decision_card_styles_present() -> None:
    css = (STATIC / "styles.css").read_text(encoding="utf-8")
    assert ".decision-card" in css
    assert ".decision-card__key" in css
