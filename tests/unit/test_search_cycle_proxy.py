"""Web proxy coverage for SearchCycle close (R5.2)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy
from tests.unit.test_automation_proxy import FakeAutomation


def test_search_cycle_close_disables_automation_and_blocks_run_now() -> None:
    core = StubCore()
    automation = FakeAutomation()
    automation.enabled = True
    item = vacancy()
    item["owner_decision"] = "interested"
    core.items = [item]
    client = WebClient(core=core, automation=automation)

    process = client.request(
        "POST",
        "/api/v1/hiring-processes",
        json={"vacancy_id": item["id"]},
    ).json()
    offer = client.request(
        "POST",
        "/api/v1/offers",
        json={
            "hiring_process_id": process["id"],
            "compensation_amount": 300000,
            "compensation_currency": "RUB",
            "compensation_basis": "net",
            "proposed_start_date": "2026-10-01",
        },
    ).json()
    accepted = client.request(
        "PATCH",
        f"/api/v1/offers/{offer['id']}/decision",
        json={"status": "accepted", "decision_note": "win"},
    )
    assert accepted.status_code == 200
    active = client.request("GET", "/api/v1/search-cycle")
    assert active.status_code == 200
    assert active.json()["status"] == "active"
    assert automation.enabled is True

    closed = client.request(
        "POST",
        "/api/v1/search-cycle/close",
        json={"accepted_offer_id": offer["id"], "close_note": "done"},
    )
    assert closed.status_code == 200
    body = closed.json()
    assert body["status"] == "closed"
    assert body["accepted_offer_id"] == offer["id"]
    assert body["outcome"] == "offer_accepted"
    assert automation.enabled is False
    assert any(call[0] == "search-cycle-close" for call in core.calls)

    blocked_enable = client.request("POST", "/api/v1/automation/enable", json={"enabled": True})
    assert blocked_enable.status_code == 409
    blocked_run = client.request("POST", "/api/v1/automation/run-now")
    assert blocked_run.status_code == 409
    assert automation.runs == 0
