"""Web proxy coverage for hiring activities (R4.1)."""

from __future__ import annotations

from tests.support import StubCore, WebClient, vacancy


def test_hiring_activity_proxy_create_complete_without_stage_change() -> None:
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
    stage_count = len(created.json()["stage_events"])

    activity = client.request(
        "POST",
        f"/api/v1/hiring-processes/{process_id}/activities",
        json={
            "activity_type": "interview",
            "title": "Интервью с руководителем",
            "scheduled_at": "2026-09-12T12:00:00+00:00",
            "participant": "CTO",
            "note": "Подготовка",
        },
    )
    assert activity.status_code == 201
    body = activity.json()
    assert body["current_stage"] == "interview"
    assert len(body["stage_events"]) == stage_count
    assert len(body["activities"]) == 1
    activity_id = body["activities"][0]["id"]
    assert any(call[0] == "hiring-activity-create" for call in core.calls)

    completed = client.request(
        "PATCH",
        f"/api/v1/hiring-activities/{activity_id}",
        json={"status": "completed", "result": "Прошло хорошо"},
    )
    assert completed.status_code == 200
    done = completed.json()
    assert done["activities"][0]["status"] == "completed"
    assert done["activities"][0]["result"] == "Прошло хорошо"
    assert done["current_stage"] == "interview"
    assert len(done["stage_events"]) == stage_count

    task = client.request(
        "POST",
        f"/api/v1/hiring-processes/{process_id}/activities",
        json={
            "activity_type": "test_task",
            "title": "Тестовое",
            "due_at": "2026-09-14T18:00:00+00:00",
            "url": "https://example.com/task",
        },
    )
    assert task.status_code == 201
    assert len(task.json()["activities"]) == 2
    assert task.json()["current_stage"] == "interview"
