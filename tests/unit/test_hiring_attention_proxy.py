"""Web proxy coverage for next_action deadline and hiring attention (R4.2)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_action_plan_deadline_and_hiring_complete_leave_active() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    core.items = [item]
    client = WebClient(core=core)

    created = client.request(
        "POST",
        "/api/v1/hiring-processes",
        json={"vacancy_id": item["id"], "initial_stage": "interview"},
    )
    assert created.status_code == 201
    process_id = created.json()["id"]

    planned = client.request(
        "PATCH",
        f"/api/v1/vacancies/{item['id']}/action-plan",
        json={
            "next_action": "Отправить тестовое",
            "next_action_at": "2026-09-14T18:00:00+00:00",
        },
    )
    assert planned.status_code == 200
    assert planned.json()["next_action"] == "Отправить тестовое"
    assert planned.json()["next_action_at"].startswith("2026-09-14T18:00:00")
    assert any(call[0] == "action-plan" for call in core.calls)

    cleared = client.request(
        "PATCH",
        f"/api/v1/vacancies/{item['id']}/action-plan",
        json={"clear_next_action_at": True},
    )
    assert cleared.status_code == 200
    assert cleared.json()["next_action"] == "Отправить тестовое"
    assert cleared.json()["next_action_at"] is None

    restored = client.request(
        "PATCH",
        f"/api/v1/vacancies/{item['id']}/action-plan",
        json={
            "next_action": "Отправить тестовое",
            "next_action_at": "2026-09-14T18:00:00+00:00",
        },
    )
    assert restored.status_code == 200

    # Keep StubCore hiring vacancy snapshot in sync for list embedding.
    for hiring in core.hiring_items:
        if hiring["id"] == process_id:
            hiring["vacancy"]["next_action"] = restored.json()["next_action"]
            hiring["vacancy"]["next_action_at"] = restored.json()["next_action_at"]

    listing = client.request("GET", "/api/v1/hiring-processes?status=active")
    assert listing.status_code == 200
    match = next(row for row in listing.json()["items"] if row["id"] == process_id)
    assert match["vacancy"]["next_action_at"].startswith("2026-09-14T18:00:00")

    completed = client.request(
        "PATCH",
        f"/api/v1/hiring-processes/{process_id}",
        json={"status": "completed"},
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "completed"
    active = client.request("GET", "/api/v1/hiring-processes?status=active")
    assert all(row["id"] != process_id for row in active.json()["items"])
    history = client.request("GET", f"/api/v1/hiring-processes?vacancy_id={item['id']}")
    assert history.json()["items"][0]["status"] == "completed"
