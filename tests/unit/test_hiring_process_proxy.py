"""Web proxy coverage for hiring process foundation (R4.0)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_hiring_process_proxy_start_and_transition() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    item["next_action"] = "Подготовиться к скринингу"
    core.items = [item]
    client = WebClient(core=core)

    created = client.request(
        "POST",
        "/api/v1/hiring-processes",
        json={"vacancy_id": item["id"], "initial_stage": "screening"},
    )
    assert created.status_code == 201
    body = created.json()
    assert body["current_stage"] == "screening"
    assert body["status"] == "active"
    assert any(call[0] == "hiring-create" for call in core.calls)

    transitioned = client.request(
        "POST",
        f"/api/v1/hiring-processes/{body['id']}/stages",
        json={"stage": "interview"},
    )
    assert transitioned.status_code == 200
    assert transitioned.json()["current_stage"] == "interview"
    assert len(transitioned.json()["stage_events"]) == 2

    listing = client.request("GET", "/api/v1/hiring-processes?status=active")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1
    assert not any(call[0] == "application-create" for call in core.calls)
    assert not any(call[0] == "response-create" for call in core.calls)
