"""Web proxy coverage for automation control plane."""

from __future__ import annotations

from typing import Any

from tests.support import StubCore, WebClient

from job_search_web.automation_client import AutomationUnavailableError


class FakeAutomation:
    def __init__(self) -> None:
        self.enabled = False
        self.runs = 0

    def get_status(self) -> tuple[int, Any]:
        return 200, {
            "enabled": self.enabled,
            "running": False,
            "last_status": "never_run",
            "last_error": None,
            "next_run_at": None,
            "last_cycle": {},
        }

    def set_enabled(self, enabled: bool) -> tuple[int, Any]:
        self.enabled = enabled
        return 200, {
            "enabled": enabled,
            "running": False,
            "last_status": "never_run",
            "next_run_at": "2099-01-01T00:00:00Z" if enabled else None,
            "last_cycle": {},
        }

    def run_now(self) -> tuple[int, Any]:
        self.runs += 1
        return 200, {
            "ok": True,
            "status": "ok",
            "cycle": {
                "created": 1,
                "updated": 0,
                "unchanged": 2,
                "scoring_enqueued": 1,
            },
            "state": {"enabled": self.enabled, "last_status": "ok"},
        }


class DownAutomation:
    def get_status(self) -> tuple[int, Any]:
        raise AutomationUnavailableError

    def set_enabled(self, enabled: bool) -> tuple[int, Any]:
        raise AutomationUnavailableError

    def run_now(self) -> tuple[int, Any]:
        raise AutomationUnavailableError


def test_automation_status_and_enable_proxy() -> None:
    fake = FakeAutomation()
    client = WebClient(StubCore(), automation=fake)
    status = client.request("GET", "/api/v1/automation/status")
    assert status.status_code == 200
    assert status.json()["enabled"] is False
    enabled = client.request("POST", "/api/v1/automation/enable", json={"enabled": True})
    assert enabled.status_code == 200
    assert enabled.json()["enabled"] is True
    assert fake.enabled is True


def test_automation_run_now_proxy() -> None:
    fake = FakeAutomation()
    client = WebClient(StubCore(), automation=fake)
    response = client.request("POST", "/api/v1/automation/run-now")
    assert response.status_code == 200
    assert response.json()["cycle"]["scoring_enqueued"] == 1
    assert fake.runs == 1


def test_automation_unavailable() -> None:
    client = WebClient(StubCore(), automation=DownAutomation())
    response = client.request("GET", "/api/v1/automation/status")
    assert response.status_code == 503
    assert response.json()["code"] == "automation_unavailable"
