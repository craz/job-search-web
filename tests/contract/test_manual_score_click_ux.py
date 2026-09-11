"""Contract: manual «Оценить» must enqueue with visible queued/error feedback."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
APP_PY = ROOT / "src" / "job_search_web" / "app.py"


def test_score_click_not_stolen_by_article_owner_decision() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    # Article carries data-owner-decision; handlers must target buttons only so
    # «Оценить» reaches the score path instead of a silent owner-decision PATCH.
    assert 'closest("button[data-owner-decision]")' in js
    assert 'closest("[data-owner-decision]")' not in js
    assert 'closest("[data-score]")' in js
    # Score must be handled before owner-decision so a future broad closest
    # cannot silently swallow «Оценить».
    click_region = js.split('grid.addEventListener("click"', 1)[1]
    score_idx = click_region.index('closest("[data-score]")')
    decision_idx = click_region.index('closest("button[data-owner-decision]")')
    assert score_idx < decision_idx


def test_manual_score_enqueue_and_pending_ux_strings() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "pendingScoreByVacancyId" in js
    assert "watchPendingScoreJob" in js
    assert "resumePendingScoreWatchers" in js
    assert "apiErrorInfo" in js
    assert 'data-score-pending="1"' in js
    assert "already_queued" in js
    assert "active_queue_duplicate" in js
    assert "ollama_unavailable" in js
    assert "Оценка уже в очереди" in js
    assert "Ollama недоступна (сервис не отвечает). Повторите позже." in js
    assert "Оценка поставлена в очередь" in js
    assert "Ставим в очередь…" in js
    assert "Оценка запущена…" in js
    assert "jobPayload.error_code" in js
    marker = 'grid.addEventListener("click", async (event) => {'
    click = js.split(marker, 1)[1]
    score_block = click.split("const scoreButton = event.target.closest")[1].split(
        "const decisionButton = event.target.closest"
    )[0]
    assert "resetOffset: true" not in score_block
    assert "await loadVacancies()" not in score_block
    assert "loadVacancies(" not in score_block
    assert "window.scrollTo(0, scrollY)" not in score_block
    assert "refreshVacancyScoringInPlace" in score_block
    assert "patchVacancyScoringControls" in js
    assert "pendingScoreByVacancyId.set(vacancyId" in score_block
    assert "Ставим в очередь…" in score_block
    assert "Оценка запущена…" in score_block
    assert (
        "fetch(`/api/v1/vacancies/${vacancyId}/score`" in score_block
        or "fetch(`/api/v1/vacancies/${vacancyId}/score`" in js
    )


def test_web_flattens_scoring_detail_errors() -> None:
    py = APP_PY.read_text(encoding="utf-8")
    assert "def browser_facing_error_payload" in py
    assert "browser_facing_error_payload(payload)" in py
