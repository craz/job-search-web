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
    assert 'browser_captcha_or_action_required: "остановлено: требуется CAPTCHA"' in js
    assert "showSuitableCaptchaPanel" in js
    assert "isSuitableCaptchaCode" in js
    assert 'id="suitable-live-captcha"' in html
    assert 'id="suitable-captcha-open"' in html
    assert "Открыть challenge в noVNC" in html
    assert "Войти в HeadHunter" not in html.split('id="suitable-live-captcha"')[1].split(
        "vacancy-search__actions"
    )[0]
    assert 'id="suitable-captcha-confirm"' in html
    assert "Проверить снова" in html
    assert "open-challenge" in js
    assert "confirm-challenge" in js
    assert "загрузка деталей" in js
    assert 'phase === "captcha_required"' in js
    assert "browser_proxy_unavailable" in js
    captcha_branch = js.split("isSuitableCaptchaCode(code)")[1].split("else if (status ===")[0]
    assert "browser_proxy_unavailable" not in captcha_branch
    assert "open_login" not in captcha_branch
