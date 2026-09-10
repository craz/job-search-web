"""Contract: live suitable progress updates must not thrash layout/DOM roots."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
HTML = ROOT / "src" / "job_search_web" / "static" / "index.html"
STYLES = ROOT / "src" / "job_search_web" / "static" / "styles.css"


def test_live_progress_uses_inplace_field_updates() -> None:
    js = APP_JS.read_text(encoding="utf-8")
    html = HTML.read_text(encoding="utf-8")
    css = STYLES.read_text(encoding="utf-8")

    assert "function updateSuitableLiveElapsed()" in js
    assert "function setTextIfChanged(" in js
    assert 'id="suitable-live-elapsed"' in html
    assert 'id="suitable-live-started"' in html
    assert "vacancy-search__live-elapsed" in css
    assert "min-width: 10ch" in css
    assert "min-height: 2.9em" in css

    # Timer must not rewrite the whole timing paragraph.
    timer_body = js.split("suitableElapsedTimer = setInterval")[1].split("suitablePollTimer")[0]
    assert "updateSuitableLiveElapsed()" in timer_body
    assert "timing.textContent" not in timer_body

    # Poll must not reload the vacancy queue / mutate location.
    poll = js.split("async function pollSuitableRunningProgress()")[1].split(
        "function startSuitableLiveWatch"
    )[0]
    assert "loadVacancies(" not in poll
    assert "grid.innerHTML" not in poll
    assert "location.hash" not in poll
    assert "location.href" not in poll
    assert "renderSuitableLiveFromRun" in poll
    assert "never reload vacancy queue" in poll or "In-place progress fields only" in poll

    # Fingerprint skip avoids redundant DOM writes; terminal does one final refresh.
    assert "suitableLiveProgressFingerprint" in js
    assert "await loadLatestSuitableRun()" in poll


def test_live_panel_no_longer_aria_live_on_whole_block() -> None:
    """Whole-panel aria-live re-announced every timer tick and amplified perceived jump."""
    html = HTML.read_text(encoding="utf-8")
    live_open = html.split('id="suitable-live"', 1)[1].split(">", 1)[0]
    assert "aria-live" not in live_open
    assert 'id="suitable-live-progress" aria-live="polite"' in html
