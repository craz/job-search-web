"""Contract checks for truthful HH retry / interactive login UX (hotfix v1.0.1)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
INDEX_HTML = ROOT / "src" / "job_search_web" / "static" / "index.html"


def test_retry_does_not_treat_start_as_success() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert 'showNotice("Проверяем HeadHunter…", "info")' in js
    assert "hhRetryOutcomeNotice" in js
    assert 'showNotice("HeadHunter доступен")' in js
    assert 'showNotice("Требуется повторный вход в HeadHunter", "warning")' in js
    # Former false-success path must stay gone.
    assert 'showNotice("Повторная проверка HeadHunter…")' not in js


def test_open_login_waits_for_ready_and_maps_infra_failure() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    html = INDEX_HTML.read_text(encoding="utf-8")
    assert 'id="hh-resumes-open"' in html
    assert "<a" not in html.split('id="hh-resumes-open"', 1)[1].split("Войти в HeadHunter", 1)[0]
    assert "hhLoginFailureMessage" in js
    assert "Не удалось запустить окно входа HeadHunter" in js
    assert "payload.browser_started === false" in js
    assert 'showNotice("Запускаем окно входа HeadHunter…", "info")' in js
    assert "loadHhConnection()" in js
    # Must not open dead noVNC via raw href before open-login succeeds.
    assert 'href="http://127.0.0.1:6080/vnc.html' not in html


def test_automation_distinguishes_live_egress_from_last_cycle_error() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert "/api/v1/hh/health" in js
    assert "Последняя ошибка цикла:" in js
    assert "Сейчас: локальный сетевой выход HeadHunter недоступен" in js
    assert "liveEgressBroken" in js
