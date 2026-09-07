"""Web proxy coverage for employer response journal (R3.3)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_employer_response_proxy_does_not_create_application() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    item["action_channel"] = "both"
    core.items = [item]
    client = WebClient(core=core)
    before_apps = len(core.application_items)
    before_outreaches = len(core.outreach_items)

    response = client.request(
        "POST",
        "/api/v1/employer-responses",
        json={
            "vacancy_id": item["id"],
            "source": "hh",
            "response_type": "question",
            "note": "Asked about stack",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["source"] == "hh"
    assert body["response_type"] == "question"
    assert any(call[0] == "response-create" for call in core.calls)
    assert not any(call[0] == "application-create" for call in core.calls)
    assert len(core.application_items) == before_apps
    assert len(core.outreach_items) == before_outreaches
    listing = client.request("GET", f"/api/v1/employer-responses?vacancy_id={item['id']}")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
