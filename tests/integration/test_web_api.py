"""ASGI integration coverage for the browser facade."""

from tests.support import StubCore, WebClient


def test_index_and_vacancy_flow_use_core_gateway() -> None:
    """The board can list, create and update through the injected HTTP boundary."""
    core = StubCore()
    client = WebClient(core)

    page = client.request("GET", "/")
    listing = client.request("GET", "/api/v1/vacancies")
    created = client.request(
        "POST",
        "/api/v1/vacancies",
        headers={"Idempotency-Key": "web-fixture-create"},
        json={
            "company_name": "Example Labs",
            "company_external_id": "company-42",
            "source": "fixture",
            "external_id": "vacancy-43",
            "title": "Platform Engineer",
            "url": "https://example.com/vacancies/43",
            "description": "Synthetic request.",
        },
    )
    updated = client.request(
        "PATCH",
        "/api/v1/vacancies/00000000-0000-0000-0000-000000000042",
        json={"status": "shortlisted"},
    )

    assert page.status_code == 200
    assert "Работа — это воронка" in page.text
    assert "/assets/app.js?v=20260820-metrics" in page.text
    assert "/assets/styles.css?v=20260820-metrics" in page.text
    assert listing.json()["total"] == 1
    assert created.status_code == 201
    assert updated.json()["status"] == "shortlisted"
    assert [call[0] for call in core.calls] == ["list", "create", "update"]


def test_core_transport_failure_has_stable_response() -> None:
    """A stopped Core yields an actionable Web response without a traceback."""
    response = WebClient(StubCore(unavailable=True)).request("GET", "/api/v1/vacancies")

    assert response.status_code == 503
    assert response.json() == {
        "code": "core_unavailable",
        "message": "Core API is unavailable",
    }


def test_application_flow_records_only_through_core_gateway() -> None:
    """Web creates and lists a local Application linked to an existing Vacancy."""
    core = StubCore()
    client = WebClient(core)
    created = client.request(
        "POST",
        "/api/v1/applications",
        headers={"Idempotency-Key": "web-application-create"},
        json={
            "vacancy_id": "00000000-0000-0000-0000-000000000042",
            "source": "manual",
            "external_id": "application-44",
            "resume_version": "backend-v3",
            "next_action": "Check for a reply",
        },
    )
    listing = client.request("GET", "/api/v1/applications")

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["vacancy"]["title"] == "Backend Engineer"
    assert [call[0] for call in core.calls] == ["application-create", "application-list"]


def test_live_reload_revision_disables_asset_cache_in_dev_mode() -> None:
    """The explicit Compose dev mode gives an open browser a changing revision."""
    client = WebClient(StubCore(), live_reload=True)

    revision = client.request("GET", "/dev/revision")
    asset = client.request("GET", "/assets/app.js")

    assert revision.status_code == 200
    assert revision.json()["enabled"] is True
    assert revision.json()["revision"].isdigit()
    assert asset.headers["cache-control"] == "no-store"


def test_metric_flow_lists_and_updates_only_through_core_gateway() -> None:
    """The dashboard persists a validated partial snapshot through Core HTTP."""
    core = StubCore()
    client = WebClient(core)
    created = client.request(
        "PUT",
        "/api/v1/metrics/2026-08-20",
        headers={"Idempotency-Key": "web-metric-key"},
        json={
            "metric_date": "2026-08-20",
            "applications": 3,
            "views_new": 7,
            "notes": "Synthetic dashboard request.",
        },
    )
    listing = client.request("GET", "/api/v1/metrics")

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["applications"] == 3
    assert [call[0] for call in core.calls] == ["metric-update", "metric-list"]


def test_metric_path_and_body_dates_must_match() -> None:
    """Web rejects ambiguous dated writes before contacting Core."""
    core = StubCore()
    response = WebClient(core).request(
        "PUT",
        "/api/v1/metrics/2026-08-20",
        headers={"Idempotency-Key": "mismatch"},
        json={"metric_date": "2026-08-19", "applications": 1},
    )

    assert response.status_code == 400
    assert response.json()["code"] == "metric_date_mismatch"
    assert core.calls == []
