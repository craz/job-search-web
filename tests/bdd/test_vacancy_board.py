"""pytest-bdd bindings for the browser vacancy-board story."""

import httpx
from pytest_bdd import given, scenarios, then, when
from tests.support import StubCore, WebClient

scenarios("../features/vacancy_board.feature")


@given("Core содержит синтетическую вакансию", target_fixture="available_core")
def core_has_vacancy() -> StubCore:
    """Provide one public synthetic vacancy through the contract double."""
    return StubCore()


@when(
    "Web запрашивает список и меняет статус вакансии",
    target_fixture="vacancy_flow",
)
def list_and_update(available_core: StubCore) -> tuple[httpx.Response, httpx.Response, StubCore]:
    """Exercise both browser operations through Web HTTP."""
    client = WebClient(available_core)
    listing = client.request("GET", "/api/v1/vacancies")
    updated = client.request(
        "PATCH",
        "/api/v1/vacancies/00000000-0000-0000-0000-000000000042",
        json={"status": "reviewing"},
    )
    return listing, updated, available_core


@then("Web возвращает данные Core без доступа к базе")
def response_comes_from_core(vacancy_flow: tuple[httpx.Response, httpx.Response, StubCore]) -> None:
    """Require successful list/update and observable gateway calls."""
    listing, updated, core = vacancy_flow
    assert listing.json()["items"][0]["company"]["name"] == "Example Labs"
    assert updated.json()["status"] == "reviewing"
    assert [call[0] for call in core.calls] == ["list", "update"]


@given("Core недоступен", target_fixture="unavailable_core")
def core_is_unavailable() -> StubCore:
    """Provide a deterministic transport failure."""
    return StubCore(unavailable=True)


@when("Web запрашивает список вакансий", target_fixture="unavailable_response")
def list_while_unavailable(unavailable_core: StubCore) -> httpx.Response:
    """Request the collection while the gateway is stopped."""
    return WebClient(unavailable_core).request("GET", "/api/v1/vacancies")


@then("Web возвращает стабильную ошибку 503")
def stable_unavailable_error(unavailable_response: httpx.Response) -> None:
    """Expose an actionable stable code to the browser."""
    assert unavailable_response.status_code == 503
    assert unavailable_response.json()["code"] == "core_unavailable"
