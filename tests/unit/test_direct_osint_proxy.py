"""Web coverage for vacancy-first DIRECT OSINT (R3.1)."""

from __future__ import annotations

from tests.support import StubCore, StubOsint, WebClient, vacancy


def test_people_research_forwards_vacancy_context() -> None:
    core = StubCore()
    osint = StubOsint()
    item = vacancy()
    item["owner_decision"] = "interested"
    item["action_channel"] = "direct"
    item["company"]["website_url"] = "https://example.test/"
    core.items = [item]
    client = WebClient(core=core, osint=osint)

    response = client.request(
        "POST",
        "/api/v1/osint/people-research",
        json={
            "company_id": item["company"]["id"],
            "vacancy_id": item["id"],
            "company_name": item["company"]["name"],
            "website_url": item["company"]["website_url"],
        },
    )
    assert response.status_code == 200
    assert any(call[0] == "research" for call in osint.calls)
    research = next(call for call in osint.calls if call[0] == "research")
    assert research[1]["vacancy_id"] == item["id"]
    assert research[1]["company_id"] == item["company"]["id"]
    apps = client.request("GET", "/api/v1/applications")
    assert apps.json()["total"] == 0
    assert item["owner_decision"] == "interested"


def test_people_confirm_marks_selected_without_application() -> None:
    core = StubCore()
    osint = StubOsint()
    client = WebClient(core=core, osint=osint)
    response = client.request(
        "POST",
        "/api/v1/osint/people-confirm",
        json={
            "report_id": "report-1",
            "person_id": "00000000-0000-0000-0000-000000000044",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["person"]["status"] == "confirmed"
    assert body["core_person"]["full_name"] == "Alex Example"
    assert any(call[0] == "confirm" for call in osint.calls)
    apps = client.request("GET", "/api/v1/applications")
    assert apps.json()["total"] == 0
