"""Contract checks for HH egress recovery mapping in Web UI."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"


def test_web_maps_local_egress_recovery_message() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    assert 'kind === "local_egress_unavailable"' in js
    assert 'code === "browser_proxy_unavailable"' in js
    assert "Не работает локальный сетевой выход HeadHunter" in js
    assert "make boot" in js
    assert "make up" in js
