"""Web integration coverage for resume artifact download proxy."""

from __future__ import annotations

from tests.support import StubCore, WebClient


def test_resume_artifact_download_proxy_returns_bytes() -> None:
    core = StubCore()
    core.resume_artifact_bytes = b"%PDF-1.4 web-fixture"
    client = WebClient(core)
    response = client.request("GET", "/api/v1/resume-artifacts/artifact-1/download")
    assert response.status_code == 200
    assert response.content == b"%PDF-1.4 web-fixture"
    assert response.headers["content-type"].startswith("application/pdf")
    assert core.calls[-1] == ("resume-artifact-download", "artifact-1")
