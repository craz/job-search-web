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
