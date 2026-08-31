"""Owner calibration labeling facade tests (R2.3.6.1 UX)."""

from __future__ import annotations

from tests.support import StubCore, StubScoring, WebClient


def test_calibration_page_is_served() -> None:
    client = WebClient(StubCore())
    response = client.request("GET", "/calibration")
    assert response.status_code == 200
    body = response.text
    assert "Owner calibration labeling" in body
    assert "apply" in body
    assert "maybe" in body
    assert "skip" in body
    assert "relevance_score" not in body
    assert "Assessment" not in body or "Assessment не показываются" in body


def test_calibration_proxy_reads_and_saves_labels() -> None:
    scoring = StubScoring()
    client = WebClient(StubCore(), scoring=scoring)

    overview = client.request("GET", f"/api/v1/calibration/suites/{scoring.suite_id}")
    assert overview.status_code == 200
    assert overview.json()["expected_verdicts"] == ["apply", "maybe", "skip"]
    assert overview.json()["labeled_cases"] == 0

    case_id = scoring.case_ids[0]
    case = client.request(
        "GET",
        f"/api/v1/calibration/suites/{scoring.suite_id}/cases/{case_id}",
    )
    assert case.status_code == 200
    payload = case.json()
    assert payload["case"]["title"] == "Synthetic Backend Engineer"
    assert "relevance_score" not in str(payload).lower()
    assert '"verdict"' not in str(payload["case"]).lower()

    saved = client.request(
        "PUT",
        f"/api/v1/calibration/suites/{scoring.suite_id}/labels/{case_id}",
        json={"expected_verdict": "apply", "reason": "Fit"},
    )
    assert saved.status_code == 200
    assert saved.json()["label"]["expected_verdict"] == "apply"
    assert scoring.labels[case_id]["expected_verdict"] == "apply"

    changed = client.request(
        "PUT",
        f"/api/v1/calibration/suites/{scoring.suite_id}/labels/{case_id}",
        json={"expected_verdict": "skip"},
    )
    assert changed.status_code == 200
    assert changed.json()["label"]["expected_verdict"] == "skip"

    session = client.request(
        "PUT",
        f"/api/v1/calibration/suites/{scoring.suite_id}/session",
        json={"index": 1},
    )
    assert session.status_code == 200
    assert scoring.session_index == 1


def test_calibration_proxy_reports_scoring_unavailable() -> None:
    scoring = StubScoring()
    scoring.unavailable = True
    client = WebClient(StubCore(), scoring=scoring)
    response = client.request("GET", f"/api/v1/calibration/suites/{scoring.suite_id}")
    assert response.status_code == 503
    assert response.json()["code"] == "scoring_unavailable"


def test_calibration_assets_are_public_static_files() -> None:
    client = WebClient(StubCore())
    js = client.request("GET", "/assets/calibration.js")
    css = client.request("GET", "/assets/calibration.css")
    assert js.status_code == 200
    assert css.status_code == 200
    assert "expected_verdict" in js.text
    assert "relevance_score" not in js.text
    assert "calibration-description" in css.text
