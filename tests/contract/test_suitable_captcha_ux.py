"""Contract: suitable CAPTCHA UX is explicit and actionable (no generic hang)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
HTML = ROOT / "src" / "job_search_web" / "static" / "index.html"


def test_suitable_captcha_copy_and_actions() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    html = HTML.read_text(encoding="utf-8")
    assert "HeadHunter остановил загрузку и требует подтверждение" in js
    assert "HeadHunter остановил загрузку и требует подтверждение" in html
    assert 'browser_captcha_or_action_required: "остановлено: требуется CAPTCHA"' not in js
    assert 'browser_captcha_or_action_required: "HeadHunter потребовал CAPTCHA"' in js
    assert "Последняя проверка остановлена: HeadHunter потребовал CAPTCHA" in js
    assert "showSuitableCaptchaPanel" in js
    assert "isSuitableCaptchaCode" in js
    assert "hideSuitableCaptchaPanel" in js
    assert 'id="suitable-live-captcha"' in html
    assert 'id="suitable-captcha-open"' in html
    assert "Открыть challenge в noVNC" in html
    assert (
        "Войти в HeadHunter"
        not in html.split('id="suitable-live-captcha"')[1].split("vacancy-search__actions")[0]
    )
    assert 'id="suitable-captcha-confirm"' in html
    assert "Я решил CAPTCHA — проверить" in html
    assert "open-challenge" in js
    assert "confirm-challenge" in js
    assert "Решите CAPTCHA в открытом окне HeadHunter" in js
    assert "загрузка деталей" in js
    assert 'phase === "captcha_required"' in js
    assert "browser_proxy_unavailable" in js
    captcha_branch = js.split("isSuitableCaptchaCode(code)")[1].split("else if (status ===")[0]
    assert "browser_proxy_unavailable" not in captcha_branch
    assert "open_login" not in captcha_branch


def test_missing_challenge_url_hides_open_button() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "canOpenChallenge" in js
    assert "openBtn.hidden = !canOpenChallenge" in js
    assert "CAPTCHA обнаружена, но открыть её не удалось" in js
    assert "Скриншот CAPTCHA" in js
    assert "hasUrl && !explicitNoRecovery" in js


def test_confirm_button_shows_checking_and_open_browser_message() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "setCaptchaOperatorFeedback" in js
    assert "Проверяем HeadHunter…" in js
    assert "Решите CAPTCHA в открытом окне HeadHunter" in js
    assert "CAPTCHA подтверждена, HeadHunter доступен" in js
    assert "challenge_browser_open" in js
    assert "Я решил CAPTCHA — проверить" in js
    marker = 'document.querySelector("#suitable-captcha-confirm")?.addEventListener'
    assert marker in js
    confirm_handler = js.split(marker)[1].split("const continuation = readSuitableContinuation")[0]
    assert "confirm-challenge" in confirm_handler
    assert "Проверяем HeadHunter…" in confirm_handler
    checking_idx = confirm_handler.index("Проверяем HeadHunter…")
    fetch_idx = confirm_handler.index("confirm-challenge")
    assert checking_idx < fetch_idx
    assert "Окно CAPTCHA ещё открыто" in js or "Решите CAPTCHA" in confirm_handler


def test_historical_captcha_run_does_not_force_live_panel_without_challenge() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    marker = "function renderSuitableFinalSummary"
    assert marker in js
    body = js.split(marker, 1)[1].split("\nfunction ", 1)[0]
    assert "loadHhChallengePayload" in body
    assert "liveRecovery: false" in body
    assert "if (!payload.active)" in body
    assert "остановлено: требуется CAPTCHA" not in body


def test_historical_captcha_copy_is_not_live_recovery() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    css = (ROOT / "src" / "job_search_web" / "static" / "styles.css").read_text(encoding="utf-8")
    assert "Последняя проверка остановлена: HeadHunter потребовал CAPTCHA" in js
    assert "hideSuitableCaptchaPanel" in js
    # CSS display:grid must not defeat HTML hidden on the CAPTCHA operator panel.
    assert ".vacancy-search__live-captcha[hidden]" in css
    assert "display: none !important" in css
    # Active recovery copy still present for live handoff.
    assert "Я решил CAPTCHA — проверить" in js
    assert "Решите CAPTCHA в открытом окне HeadHunter" in js


def test_open_challenge_requires_interactive_ready_before_novnc() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    marker = 'document.querySelector("#suitable-captcha-open")?.addEventListener'
    assert marker in js
    open_handler = js.split(marker)[1].split('document.querySelector("#suitable-captcha-confirm")')[
        0
    ]
    assert "interactive_ready" in open_handler
    assert "browser_started" in open_handler
    ready_idx = open_handler.index("interactive_ready")
    open_idx = open_handler.index("window.open")
    assert ready_idx < open_idx
