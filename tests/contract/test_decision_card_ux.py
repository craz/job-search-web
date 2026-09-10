"""Contract: vacancy assessment UI exposes localized decision card."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"


def test_decision_card_helpers_in_app_js() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "renderAssessmentDecisionCard" in js
    assert "decision_card" in js
    assert "Профессиональное соответствие" in js
    assert "Реализуемость" in js
    assert "Личный интерес" in js
    assert "Критические ограничения" in js
    assert "Рекомендация" in js
    assert "Технические детали" in js
    assert "localizeRuleCodeRu" in js
    assert "localizeActionRu" in js
    assert "Другое ограничение" in js
    assert "Hard blockers" not in js
    assert "Role fit" not in js
    assert "Feasibility" not in js
    assert "relevance_score_authoritative" in js
    assert "Служебная метка вердикта" in js


def test_decision_card_owner_maps_cover_known_codes() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "DESIRABILITY.international_relocation.skip" in js
    assert "Обязательная работа или релокация за рубеж" in js
    assert "COMPENSATION_UNCERTAINTY" in js
    assert "Компенсация не указана или не подтверждена" in js
    assert "do not pursue this vacancy" in js
    assert "Пропустить вакансию" in js
    assert 'pass: "подходит"' in js
    assert 'uncertain: "неопределённо"' in js
    assert 'fail: "не подходит"' in js
    assert "Другое ограничение" in js


def test_decision_card_styles_present() -> None:
    css = (STATIC / "styles.css").read_text(encoding="utf-8")
    assert ".decision-card" in css
    assert ".decision-card__key" in css
    assert ".decision-card__tech" in css
