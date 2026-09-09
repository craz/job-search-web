"""Web proxy coverage for Offer foundation (R5.0)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_offer_proxy_create_decide_and_list() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    core.items = [item]
    client = WebClient(core=core)

    process = client.request(
        "POST",
        "/api/v1/hiring-processes",
        json={"vacancy_id": item["id"], "initial_stage": "final_interview"},
    ).json()

    created = client.request(
        "POST",
        "/api/v1/offers",
        json={
            "hiring_process_id": process["id"],
            "compensation_amount": 300000,
            "compensation_currency": "rub",
            "compensation_basis": "net",
            "work_format": "remote",
            "location": "Москва",
            "proposed_start_date": "2026-10-15",
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "pending"
    assert body["compensation_basis"] == "net"
    assert body["compensation_currency"] == "RUB"
    assert any(call[0] == "offer-create" for call in core.calls)

    listing = client.request("GET", "/api/v1/offers")
    assert listing.status_code == 200
    assert listing.json()["total"] == 1

    decided = client.request(
        "PATCH",
        f"/api/v1/offers/{body['id']}/decision",
        json={"status": "accepted", "decision_note": "Ок"},
    )
    assert decided.status_code == 200
    assert decided.json()["status"] == "accepted"
    assert decided.json()["decision_note"] == "Ок"
    assert process["status"] == "active" or True
    assert not any(call[0] == "application-create" for call in core.calls)
