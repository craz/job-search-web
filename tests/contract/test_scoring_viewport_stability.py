"""Contract: manual scoring must not replace the vacancy queue / steal viewport."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
STYLES = ROOT / "src" / "job_search_web" / "static" / "styles.css"
INDEX = ROOT / "src" / "job_search_web" / "static" / "index.html"


def _score_block(js: str) -> str:
    # Prefer the click-handler score path (mousedown guard also matches data-score).
    marker = 'grid.addEventListener("click", async (event) => {'
    click = js.split(marker, 1)[1]
    return click.split("const scoreButton = event.target.closest")[1].split(
        "const decisionButton = event.target.closest"
    )[0]


def test_score_path_uses_in_place_scoring_controls() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "function patchVacancyScoringControls(" in js
    assert "async function refreshVacancyScoringInPlace(" in js
    assert "function vacancyCardEl(" in js
    score_block = _score_block(js)
    assert "refreshVacancyScoringInPlace" in score_block
    assert "await loadVacancies()" not in score_block
    assert "loadVacancies(" not in score_block
    assert "renderLoadingState(grid" not in score_block
    assert "grid.innerHTML" not in score_block
    assert "window.scrollTo(" not in score_block
    assert ".scrollIntoView" not in score_block


def test_score_watcher_does_not_reload_queue() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    watch = js.split("async function watchPendingScoreJob", 1)[1].split(
        "function resumePendingScoreWatchers", 1
    )[0]
    assert "refreshVacancyScoringInPlace" in watch
    assert "loadVacancies(" not in watch
    assert "renderLoadingState" not in watch


def test_in_place_refresh_does_not_assign_grid_inner_html() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    helper = js.split("async function refreshVacancyScoringInPlace", 1)[1].split(
        "function vacancySourceSignalsHtml", 1
    )[0]
    assert "grid.innerHTML" not in helper
    assert "renderVacancyList(" not in helper
    assert "renderLoadingState(" not in helper
    assert "patchVacancyScoringControls(" in helper


def test_newest_sort_not_rewritten_on_score_path() -> None:
    """Scoring must not reorder via full list replace when sort=newest."""
    js = APP_JS.read_text(encoding="utf-8")
    score_block = _score_block(js)
    assert "compareVacanciesByFirstSeen" not in score_block
    assert "renderVacancyList(" not in score_block


def test_score_mousedown_prevents_focus_scroll() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "mousedown" in js
    assert 'addEventListener(\n  "mousedown"' in js or 'addEventListener("mousedown"' in js
    assert "Mouse-down on «Оценить» must not scroll" in js
    score_block = _score_block(js)
    assert "preventScroll: true" in score_block


def test_notice_overlay_does_not_push_layout() -> None:
    css = STYLES.read_text(encoding="utf-8")
    notice_block = css.split(".notice:not([hidden])", 1)[1].split(".notice__", 1)[0]
    assert "position: fixed" in notice_block
    assert "overflow-anchor: none" in css
    index = INDEX.read_text(encoding="utf-8")
    assert "styles.css?v=" in index
    assert "score-viewport" in index
