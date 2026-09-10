"""Contract: Web bootstrap must parse and isolate subsystem failures."""

from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
HTML = ROOT / "src" / "job_search_web" / "static" / "index.html"


def test_app_js_has_valid_syntax() -> None:
    """SyntaxError in app.js blanks the entire shell (Core/HH stuck on «Проверяем»)."""
    node = shutil.which("node")
    assert node, "node is required to gate static app.js syntax"
    completed = subprocess.run(
        [node, "--check", str(APP_JS)],
        check=False,
        capture_output=True,
        text=True,
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout


def test_bootstrap_uses_allsettled_and_isolates_hh() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    # Top-level init must not use a single sequential await chain that aborts
    # vacancies/Core when an earlier subsystem rejects.
    assert "Promise.allSettled" in js
    assert "loadHhConnection().catch" in js or "void loadHhConnection().catch" in js
    assert "bootstrap" in js
    # Vacancies remain an independent settled task.
    assert '["vacancies", () => loadVacancies()]' in js or '["vacancies", () => loadVacancies()]' in js.replace(
        " ", ""
    )
    # Cache-bust must move when app.js changes (broken cached parse kills owner UI).
    assert re.search(r'app\.js\?v=\d{8}-r\d+', HTML.read_text(encoding="utf-8"))


def test_show_suitable_captcha_panel_safe_on_null_challenge() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    marker = "function showSuitableCaptchaPanel"
    assert marker in js
    body = js.split(marker, 1)[1].split("\nasync function ", 1)[0]
    assert "challenge && typeof challenge === \"object\"" in body or "challengeInfo" in body
    assert "confirmBtn" in body
    # Guard against the live regression: `if confirmBtn)` without '(' .
    assert "if (confirmBtn)" in body
    assert "if confirmBtn)" not in body
