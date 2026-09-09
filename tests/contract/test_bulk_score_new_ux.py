"""Contract: bulk «Оценить новые» button and API wiring."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"
APP_PY = ROOT / "src" / "job_search_web" / "app.py"


def test_bulk_score_new_ui_and_api_present() -> None:
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    py = APP_PY.read_text(encoding="utf-8")
    assert 'id="bulk-score-new"' in html
    assert "Оценить новые" in html
    assert "Нет новых для оценки" in js
    assert "function refreshBulkScoreNewButton" in js
    assert "function runBulkScoreNew" in js
    assert "formatBulkScoreNotice" in js
    assert "/api/v1/vacancies/bulk-score-new" in js
    assert 'let vacancyListSort = "newest"' in js
    assert 'value="newest" selected' in html
    assert "/api/v1/vacancies/bulk-score-new" in py
    assert "collect_eligible_new_vacancy_ids" in py
    assert "BULK_SCORE_NEW_CAP" in py
