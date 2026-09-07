"""Web proxy coverage for vacancy action-plan (R3.0)."""

from __future__ import annotations

import httpx
import pytest
from tests.support import StubCore, WebClient, vacancy

from job_search_web.core_client import CoreClient


def test_action_plan_proxy_forwards_without_application() -> None:
    core = StubCore()
    item = vacancy()
    item["owner_decision"] = "interested"
    core.items = [item]
    client = WebClient(core=core)

    response = client.request(
        "PATCH",
        f"/api/v1/vacancies/{item['id']}/action-plan",
        json={"action_channel": "both", "next_action": "Найти контакт"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["action_channel"] == "both"
    assert body["next_action"] == "Найти контакт"
    assert body["owner_decision"] == "interested"
    assert any(call[0] == "action-plan" for call in core.calls)
    apps = client.request("GET", "/api/v1/applications")
    assert apps.status_code == 200
    assert apps.json()["total"] == 0


def test_action_plan_client_forwards_public_contract(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update(method=method, url=url, kwargs=kwargs)
        return httpx.Response(200, json={"action_channel": "hh", "owner_decision": "interested"})

    monkeypatch.setattr(httpx, "request", fake_request)
    status, payload = CoreClient("http://core.test").update_action_plan(
        "00000000-0000-0000-0000-000000000042",
        {"action_channel": "hh"},
    )
    assert status == 200
    assert payload["action_channel"] == "hh"
    assert captured["method"] == "PATCH"
    assert (
        captured["url"]
        == "http://core.test/api/v1/vacancies/00000000-0000-0000-0000-000000000042/action-plan"
    )
    assert captured["kwargs"] == {
        "timeout": 5.0,
        "json": {"action_channel": "hh"},
    }
