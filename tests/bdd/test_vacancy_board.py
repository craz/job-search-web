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


@when(
    "Web создаёт отклик и запрашивает журнал откликов",
    target_fixture="application_flow",
)
def create_and_list_application(
    available_core: StubCore,
) -> tuple[httpx.Response, httpx.Response, StubCore]:
    """Record one synthetic local Application through the Web facade."""
    client = WebClient(available_core)
    created = client.request(
        "POST",
        "/api/v1/applications",
        headers={"Idempotency-Key": "bdd-web-application"},
        json={
            "vacancy_id": "00000000-0000-0000-0000-000000000042",
            "source": "manual",
            "external_id": "bdd-application-44",
        },
    )
    return created, client.request("GET", "/api/v1/applications"), available_core


@then("Web возвращает отклик связанный с вакансией")
def application_is_linked(
    application_flow: tuple[httpx.Response, httpx.Response, StubCore],
) -> None:
    """Require a persisted record with stable Vacancy identity and gateway calls."""
    created, listing, core = application_flow
    assert created.status_code == 201
    assert listing.json()["items"][0]["vacancy"]["id"].endswith("42")
    assert [call[0] for call in core.calls] == ["application-create", "application-list"]


@when(
    "Web записывает дневной снимок и запрашивает историю",
    target_fixture="metric_flow",
)
def update_and_list_metric(
    available_core: StubCore,
) -> tuple[httpx.Response, httpx.Response, StubCore]:
    """Apply one synthetic snapshot through the Web facade and list it."""
    client = WebClient(available_core)
    updated = client.request(
        "PUT",
        "/api/v1/metrics/2026-08-20",
        headers={"Idempotency-Key": "bdd-web-metric"},
        json={"metric_date": "2026-08-20", "applications": 2, "replies": 1},
    )
    return updated, client.request("GET", "/api/v1/metrics"), available_core


@then("Web возвращает метрики только через Core")
def metric_comes_from_core(metric_flow: tuple[httpx.Response, httpx.Response, StubCore]) -> None:
    """Require a successful dated update and observable gateway-only reads."""
    updated, listing, core = metric_flow
    assert updated.status_code == 201
    assert listing.json()["items"][0]["replies"] == 1
    assert [call[0] for call in core.calls] == ["metric-update", "metric-list"]


@when(
    "Web добавляет человека и меняет статус контакта",
    target_fixture="person_flow",
)
def create_and_update_person(
    available_core: StubCore,
) -> tuple[httpx.Response, httpx.Response, httpx.Response, StubCore]:
    """Track a confirmed synthetic person without any external contact action."""
    client = WebClient(available_core)
    created = client.request(
        "POST",
        "/api/v1/people",
        headers={"Idempotency-Key": "bdd-web-person"},
        json={
            "company_id": "00000000-0000-0000-0000-000000000043",
            "vacancy_id": "00000000-0000-0000-0000-000000000042",
            "source": "manual",
            "external_id": "bdd-person-45",
            "full_name": "Alex Example",
            "role": "referral",
        },
    )
    listing = client.request("GET", "/api/v1/people")
    updated = client.request(
        "PATCH",
        f"/api/v1/people/{created.json()['id']}",
        json={"status": "contacted"},
    )
    return created, listing, updated, available_core


@then("Web возвращает человека только через Core")
def person_comes_from_core(
    person_flow: tuple[httpx.Response, httpx.Response, httpx.Response, StubCore],
) -> None:
    """Require the complete Web facade flow and its gateway-only call trace."""
    created, listing, updated, core = person_flow
    assert created.status_code == 201
    assert listing.json()["items"][0]["full_name"] == "Alex Example"
    assert updated.json()["status"] == "contacted"
    assert [call[0] for call in core.calls] == [
        "person-create",
        "person-list",
        "person-status",
    ]
