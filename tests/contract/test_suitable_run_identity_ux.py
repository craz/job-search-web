"""Contract: live suitable UI binds to exactly one run_id (no CAPTCHA mixing)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"


def _js() -> str:
    return APP_JS.read_text(encoding="utf-8")


def test_suitable_ui_tracks_run_id_and_generation() -> None:
    js = _js()
    assert "let suitableLiveRunId = null" in js
    assert "let suitableUiGeneration = 0" in js
    assert "function bumpSuitableUiGeneration()" in js
    assert "expectGeneration" in js
    start = js.split("function startSuitableLiveWatch")[1].split("async function loadVacancies")[0]
    assert "bumpSuitableUiGeneration()" in start
    assert "hideSuitableCaptchaPanel()" in start
    assert "suitableLiveRunId = runId !== undefined ? runId : suitableLiveRunId" in start


def test_active_challenge_blocks_new_suitable_start() -> None:
    js = _js()
    body = js.split("async function runSuitableSearch")[1].split(
        "async function initVacancyListFilter"
    )[0]
    # Gate before POST.
    assert "loadHhChallengePayload()" in body.split("suitableActivePost = true")[0]
    assert "if (challengeGate.active)" in body
    assert "Сначала завершите текущую CAPTCHA HeadHunter" in body
    assert (
        "liveRecovery: true"
        in body.split("if (challengeGate.active)")[1].split("const continuation")[0]
    )


def test_inactive_challenge_new_run_clears_recovery() -> None:
    js = _js()
    body = js.split("async function runSuitableSearch")[1].split("function initVacancySearchTabs")[
        0
    ]
    # After gate passes, clear tracked id + ownership bump + hide previous CAPTCHA.
    assert "suitableLiveRunId = null" in body
    after_arm = body.split("suitableActivePost = true", 1)[1].split("startSuitableLiveWatch", 1)[0]
    assert "bumpSuitableUiGeneration()" in after_arm
    assert "hideSuitableCaptchaPanel()" in after_arm


def test_stale_generation_ignored_on_captcha_paint() -> None:
    js = _js()
    assert "if (expectGeneration != null && expectGeneration !== suitableUiGeneration) return" in js
    live = js.split("function renderSuitableLiveFromRun")[1].split(
        "function renderSuitableFinalSummary"
    )[0]
    assert "if (gen !== suitableUiGeneration) return" in live
    final = js.split("function renderSuitableFinalSummary")[1].split(
        "function renderSuitableProgress"
    )[0]
    assert "if (gen !== suitableUiGeneration) return" in final
    post = js.split("async function runSuitableSearch")[1].split("function initVacancySearchTabs")[
        0
    ]
    assert "if (gen !== suitableUiGeneration) return" in post


def test_tracked_run_not_stolen_by_orphan_running() -> None:
    js = _js()
    poll = js.split("async function pollSuitableRunningProgress()")[1].split(
        "function startSuitableLiveWatch"
    )[0]
    assert "Strict run identity" in poll or "tracked run_id never yields" in poll
    assert "if (suitableLiveRunId && running.id && suitableLiveRunId !== running.id)" in poll
    load = js.split("async function loadLatestSuitableRun()")[1].split(
        "function refreshSuitableHistoryPresentation"
    )[0]
    assert "Never let a generic" in load or "suitableLiveRunId" in load
    assert "startedFloor" in load
    apply = js.split("async function applySuitableRunPresentation")[1].split(
        "async function loadSuitableRunById"
    )[0]
    assert "Refuse to overwrite a newer live suitable ownership" in apply
    assert "if (suitableLiveRunId && run.id && suitableLiveRunId !== run.id)" in apply


def test_historical_captcha_live_recovery_false_when_inactive() -> None:
    js = _js()
    panel = js.split("function showSuitableCaptchaPanel")[1].split(
        "async function loadHhChallengePayload"
    )[0]
    assert "liveRecovery = true" in panel
    assert "confirmBtn.hidden = !liveRecovery" in panel
    assert "Предыдущая проверка остановилась на CAPTCHA (история)" in panel
    assert "canOpenChallenge = Boolean(liveRecovery) && hasUrl" in panel
    final = js.split("function renderSuitableFinalSummary")[1].split(
        "function renderSuitableProgress"
    )[0]
    assert "liveRecovery: false" in final
    assert "liveRecovery: true" in final
