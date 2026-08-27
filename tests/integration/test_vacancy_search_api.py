"""Integration coverage for SearchProfile proxy and HH vacancy search (R2.2.5)."""

from __future__ import annotations

from tests.support import StubCore, StubHh, WebClient


def test_search_profile_crud_proxied_to_core() -> None:
    core = StubCore()
    client = WebClient(core)
    created = client.request(
        "POST",
        "/api/v1/search-profiles",
        json={"text": "python", "area_id": "1", "label": "Основной поиск"},
    )
    assert created.status_code == 201
    profile_id = created.json()["id"]
    listed = client.request("GET", "/api/v1/search-profiles")
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    patched = client.request(
        "PATCH",
        f"/api/v1/search-profiles/{profile_id}",
        json={"text": "golang", "only_with_salary": True},
    )
    assert patched.status_code == 200
    assert patched.json()["text"] == "golang"
    assert any(call[0] == "search-profile-update" for call in core.calls)


def test_hh_vacancies_search_proxied_with_profile_id() -> None:
    core = StubCore()
    hh = StubHh()
    client = WebClient(core, hh=hh)
    response = client.request(
        "POST",
        "/api/v1/hh/vacancies/search",
        json={
            "search_profile_id": "00000000-0000-0000-0000-000000000080",
            "execution": {"max_pages": 1, "order": "publication_time"},
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["search_run"]["created_count"] == 1
    assert body["search_run"]["unchanged_count"] == 1
    assert hh.calls[-1][0] == "vacancies-search"


def test_hh_vacancies_search_requires_profile_id() -> None:
    client = WebClient(StubCore())
    response = client.request("POST", "/api/v1/hh/vacancies/search", json={})
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_request"


def test_hh_vacancies_search_failed_recovery_payload() -> None:
    hh = StubHh()
    hh.search_result = (
        409,
        {
            "ok": False,
            "status": "failed",
            "code": "browser_captcha_or_action_required",
            "search_run": {
                "id": "00000000-0000-0000-0000-000000000082",
                "status": "failed",
                "found_count": 0,
                "created_count": 0,
                "updated_count": 0,
                "unchanged_count": 0,
                "error_count": 0,
                "error_code": "browser_captcha_or_action_required",
                "started_at": "2026-08-27T12:00:00Z",
                "finished_at": "2026-08-27T12:00:10Z",
            },
        },
    )
    response = WebClient(StubCore(), hh=hh).request(
        "POST",
        "/api/v1/hh/vacancies/search",
        json={"search_profile_id": "00000000-0000-0000-0000-000000000080"},
    )
    assert response.status_code == 409
    assert response.json()["code"] == "browser_captcha_or_action_required"


def test_hh_vacancies_suitable_proxied() -> None:
    hh = StubHh()
    response = WebClient(StubCore(), hh=hh).request(
        "POST",
        "/api/v1/hh/vacancies/suitable",
        json={"execution": {"max_pages": 1, "order": "publication_time"}},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["source_total"] == 2272
    assert body["search_run"]["acquisition_kind"] == "resume_suitable"
    assert body["search_run"]["search_profile_id"] is None
    assert body["search_run"]["found_count"] == 2
    assert hh.calls[-1][0] == "vacancies-suitable"


def test_hh_vacancies_suitable_failed_recovery_payload() -> None:
    hh = StubHh()
    hh.suitable_result = (
        409,
        {
            "ok": False,
            "status": "failed",
            "code": "resume_search_page_mismatch",
            "source_total": None,
            "search_run": {
                "id": "00000000-0000-0000-0000-000000000084",
                "search_profile_id": None,
                "acquisition_kind": "resume_suitable",
                "status": "failed",
                "found_count": 0,
                "created_count": 0,
                "updated_count": 0,
                "unchanged_count": 0,
                "error_count": 0,
                "error_code": "resume_search_page_mismatch",
                "source_total": None,
                "started_at": "2026-08-27T12:00:00Z",
                "finished_at": "2026-08-27T12:00:10Z",
            },
        },
    )
    response = WebClient(StubCore(), hh=hh).request(
        "POST", "/api/v1/hh/vacancies/suitable", json={}
    )
    assert response.status_code == 409
    assert response.json()["code"] == "resume_search_page_mismatch"


def test_search_runs_list_proxied() -> None:
    core = StubCore()
    core.search_runs = [
        {
            "id": "00000000-0000-0000-0000-000000000081",
            "search_profile_id": "00000000-0000-0000-0000-000000000080",
            "acquisition_kind": "profile_search",
            "status": "success",
            "found_count": 0,
            "created_count": 0,
            "updated_count": 0,
            "unchanged_count": 0,
            "error_count": 0,
            "source_total": None,
        }
    ]
    response = WebClient(core).request(
        "GET",
        "/api/v1/search-runs",
        params={"search_profile_id": "00000000-0000-0000-0000-000000000080"},
    )
    assert response.status_code == 200
    assert response.json()["total"] == 1
