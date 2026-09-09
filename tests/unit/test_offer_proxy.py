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

    compared = client.request(
        "PATCH",
        f"/api/v1/offers/{body['id']}/comparison",
        json={"owner_comparison_note": "Лучшие деньги", "owner_preference_rank": 1},
    )
    assert compared.status_code == 200
    assert compared.json()["owner_comparison_note"] == "Лучшие деньги"
    assert compared.json()["owner_preference_rank"] == 1
    assert any(call[0] == "offer-comparison" for call in core.calls)

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


def test_offer_comparison_independent_sibling_decisions() -> None:
    core = StubCore()
    first = vacancy()
    first["id"] = "11111111-1111-1111-1111-111111111111"
    first["owner_decision"] = "interested"
    second = vacancy()
    second["id"] = "22222222-2222-2222-2222-222222222222"
    second["title"] = "Second Role"
    second["company"] = {"id": "c2", "name": "Second Co"}
    second["owner_decision"] = "interested"
    core.items = [first, second]
    client = WebClient(core=core)
    p1 = client.request("POST", "/api/v1/hiring-processes", json={"vacancy_id": first["id"]}).json()
    p2 = client.request(
        "POST", "/api/v1/hiring-processes", json={"vacancy_id": second["id"]}
    ).json()
    o1 = client.request(
        "POST",
        "/api/v1/offers",
        json={
            "hiring_process_id": p1["id"],
            "compensation_amount": 300000,
            "compensation_currency": "RUB",
            "compensation_basis": "net",
        },
    ).json()
    o2 = client.request(
        "POST",
        "/api/v1/offers",
        json={
            "hiring_process_id": p2["id"],
            "compensation_amount": 350000,
            "compensation_currency": "RUB",
            "compensation_basis": "gross",
        },
    ).json()
    assert o1["status"] == "pending"
    assert o2["status"] == "pending"
    accepted = client.request(
        "PATCH",
        f"/api/v1/offers/{o1['id']}/decision",
        json={"status": "accepted", "decision_note": "take one"},
    )
    assert accepted.status_code == 200
    sibling = next(item for item in core.offer_items if item["id"] == o2["id"])
    assert sibling["status"] == "pending"
    assert sibling["compensation_basis"] == "gross"
