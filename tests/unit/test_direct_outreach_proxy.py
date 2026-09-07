"""Web proxy coverage for direct outreach journal (R3.2)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_direct_outreach_proxy_does_not_create_application() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    item["action_channel"] = "direct"
    core.items = [item]
    client = WebClient(core=core)

    response = client.request(
        "POST",
        "/api/v1/direct-outreaches",
        json={
            "vacancy_id": item["id"],
            "person_id": "00000000-0000-0000-0000-000000000045",
            "method": "linkedin",
            "note": "R3.2 acceptance fixture",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["method"] == "linkedin"
    assert body["person"]["id"] == "00000000-0000-0000-0000-000000000045"
    assert any(call[0] == "outreach-create" for call in core.calls)
    assert not any(call[0] == "application-create" for call in core.calls)
    apps = client.request("GET", "/api/v1/applications")
    assert apps.json()["total"] == 0
    listing = client.request("GET", f"/api/v1/direct-outreaches?vacancy_id={item['id']}")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
