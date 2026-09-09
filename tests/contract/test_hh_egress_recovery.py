"""Contract checks for HH egress recovery mapping in Web UI."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"


def test_web_maps_local_egress_recovery_message() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert 'kind === "local_egress_unavailable"' in js
    assert 'code === "browser_proxy_unavailable"' in js
    assert "Сетевой выход HeadHunter сейчас недоступен" in js
    # Owner-facing copy must not instruct manual stack repair commands.
    assert "Восстановите стек" not in js
    assert "restart the workspace with make up" not in js
