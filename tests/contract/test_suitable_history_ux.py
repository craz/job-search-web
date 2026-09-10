"""Contract: suitable last-run history must not look like current profile lock."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
STYLES = ROOT / "src" / "job_search_web" / "static" / "styles.css"


def test_historical_profile_locked_uses_past_tense_not_current_busy() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "SEARCH_RECOVERY_HISTORY" in js
    assert "во время проверки профиль браузера был занят" in js
    assert "завершилась с ошибкой:" in js
    assert "Браузер HeadHunter сейчас используется" in js
    # Present-tense "сейчас занят" / "сейчас используется" must not be historical copy.
    assert 'profile_locked: "во время проверки профиль браузера был занят"' in js
    assert "Профиль браузера HeadHunter сейчас занят" not in js
    assert "humanRecovery(run.error_code, { historical: true })" in js or (
        "historical: true" in js and "humanRecovery" in js
    )
    assert "refreshSuitableHistoryPresentation" in js
    assert "is-history" in js
    assert ".vacancy-search__last.is-history" in STYLES.read_text(encoding="utf-8")


def test_live_profile_lock_wording_is_neutral_current_only() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    # Live recovery for an in-flight/block response stays current-tense and neutral.
    assert 'profile_locked: "Браузер HeadHunter сейчас используется"' in js
    assert "hhConnectionLooksHealthy" in js


def test_active_run_hides_previous_history_block() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "While a run is active, only the live progress panel is" in js or (
        'status === "running" || vacancySearchRunning || suitableActivePost' in js
    )
    assert "last.hidden = true" in js
    # Historical recovery must not fall back to present-tense SEARCH_RECOVERY.
    history_fn = js.split("function humanRecovery", 1)[1].split("function setSuitableStatus", 1)[0]
    assert "SEARCH_RECOVERY_HISTORY[code]" in history_fn
    assert (
        "SEARCH_RECOVERY[code]"
        not in history_fn.split("if (historical)")[1].split("return SEARCH_RECOVERY")[0]
    )
