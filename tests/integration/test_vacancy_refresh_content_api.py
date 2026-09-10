"""Integration coverage for owner «Проверить обновления» content refresh."""

from __future__ import annotations

from tests.support import StubCore, StubHh, StubScoring, WebClient

VACANCY_ID = "00000000-0000-0000-0000-000000000042"


def test_refresh_content_proxies_hh_and_returns_russian_ux() -> None:
    core = StubCore()
    core.items[0]["source"] = "hh"
    core.items[0]["external_id"] = "vacancy-42"
    hh = StubHh()
    hh.refresh_ux_status = "unchanged"
    hh.refresh_outcome = "unchanged"
    client = WebClient(core, hh=hh, scoring=StubScoring())

    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/refresh-content")

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["ux_status"] == "unchanged"
    assert body["ux_message"] == "Изменений нет"
    assert body["outcome"] == "unchanged"
    assert ("vacancy-refresh-content", "vacancy-42") in hh.calls
    assert "score_semantic_v1" not in [call[0] for call in StubScoring().calls]


def test_refresh_content_requires_hh_source() -> None:
    core = StubCore()
    core.items[0]["source"] = "manual"
    client = WebClient(core, hh=StubHh(), scoring=StubScoring())
    response = client.request("POST", f"/api/v1/vacancies/{VACANCY_ID}/refresh-content")
    assert response.status_code == 409
    assert response.json()["ux_message"] == "Не удалось проверить"
