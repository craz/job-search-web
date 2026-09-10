"""Contract: shipped Web JS must parse; intentional SyntaxError fails the gate."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"
CHECK_SCRIPT = ROOT / "scripts" / "check-static-js.mjs"
SMOKE_SCRIPT = ROOT / "scripts" / "bootstrap-smoke.mjs"
MALFORMED_FIXTURE = ROOT / "tests" / "contract" / "fixtures" / "malformed_confirmbtn.js"


def _node() -> str:
    node = shutil.which("node")
    assert node, "node is required for Web JS self-validation gates"
    return node


def test_current_app_js_passes_syntax_gate() -> None:
    completed = subprocess.run(
        [_node(), "--check", str(APP_JS)],
        check=False,
        capture_output=True,
        text=True,
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout


def test_malformed_confirmbtn_fixture_fails_syntax_gate() -> None:
    assert MALFORMED_FIXTURE.is_file()
    completed = subprocess.run(
        [_node(), "--check", str(MALFORMED_FIXTURE)],
        check=False,
        capture_output=True,
        text=True,
    )
    assert completed.returncode != 0
    combined = (completed.stderr or "") + (completed.stdout or "")
    assert "SyntaxError" in combined or "Unexpected" in combined


def test_temp_malformed_copy_of_app_pattern_fails() -> None:
    """Prove the exact live regression token fails node --check."""
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as handle:
        handle.write("function show() {\n  if confirmBtn) {\n    return;\n  }\n}\n")
        path = handle.name
    try:
        completed = subprocess.run(
            [_node(), "--check", path],
            check=False,
            capture_output=True,
            text=True,
        )
    finally:
        Path(path).unlink(missing_ok=True)
    assert completed.returncode != 0


def test_check_static_js_script_passes_on_shipped_assets() -> None:
    completed = subprocess.run(
        [_node(), str(CHECK_SCRIPT)],
        check=False,
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout
    assert "app.js" in (completed.stdout or "")


def test_bootstrap_smoke_survives_hh_degradation() -> None:
    completed = subprocess.run(
        [_node(), str(SMOKE_SCRIPT)],
        check=False,
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout
    assert "bootstrap-smoke: OK" in (completed.stdout or "")
