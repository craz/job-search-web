"""ASGI integration coverage for the browser facade."""

import re

from tests.support import StubCore, StubHh, WebClient


def test_index_and_vacancy_flow_use_core_gateway() -> None:
    """The board can list, create and update through the injected HTTP boundary."""
    core = StubCore()
    client = WebClient(core)

    page = client.request("GET", "/")
    listing = client.request("GET", "/api/v1/vacancies")
    created = client.request(
        "POST",
        "/api/v1/vacancies",
        headers={"Idempotency-Key": "web-fixture-create"},
        json={
            "company_name": "Example Labs",
            "company_external_id": "company-42",
            "source": "fixture",
            "external_id": "vacancy-43",
            "title": "Platform Engineer",
            "url": "https://example.com/vacancies/43",
            "description": "Synthetic request.",
        },
    )
    updated = client.request(
        "PATCH",
        "/api/v1/vacancies/00000000-0000-0000-0000-000000000042",
        json={"status": "shortlisted"},
    )

    assert page.status_code == 200
    assert 'class="app"' in page.text
    assert 'class="app-header"' in page.text
    assert 'class="app-nav"' in page.text
    assert 'id="main-content"' in page.text
    assert 'class="signal app-header__status"' in page.text
    assert "Job Search" in page.text
    assert "Работа — это воронка" not in page.text
    assert 'id="hh-connection"' in page.text
    assert 'id="hh-connection-label"' in page.text
    assert 'id="hh-account-label"' in page.text
    assert 'id="hh-resumes"' in page.text
    assert 'id="hh-resumes-open"' in page.text
    assert 'id="hh-resumes-confirm"' in page.text
    assert "Войти в HeadHunter" in page.text
    assert "Я вошёл — показать резюме" in page.text
    assert "HeadHunter" in page.text
    assert "/assets/app.js?v=20260826-r13c" in page.text
    assert "/assets/styles.css?v=20260826-r13c" in page.text
    assert 'class="btn btn--primary"' in page.text
    assert 'class="dialog"' in page.text
    assert 'class="dialog__header"' in page.text
    assert listing.json()["total"] == 1
    assert created.status_code == 201
    assert updated.json()["status"] == "shortlisted"
    assert [call[0] for call in core.calls] == ["list", "create", "update"]


def test_styles_expose_ui_primitives() -> None:
    """R0 primitives are present in the browser stylesheet."""
    css = WebClient(StubCore()).request("GET", "/assets/styles.css")

    assert css.status_code == 200
    for selector in (
        ".btn--primary",
        ".btn--secondary",
        ".btn--ghost",
        ".btn--destructive",
        ".badge--success",
        ".list-row",
        ".dialog__header",
        ".field__label",
        ".control",
        ".surface--panel",
    ):
        assert selector in css.text


def test_styles_use_dark_scheme_tokens() -> None:
    """R0 primary scheme is dark; legacy light palette hex values must not remain."""
    css = WebClient(StubCore()).request("GET", "/assets/styles.css").text

    assert "color-scheme: dark" in css
    assert "--color-bg: #0f1115" in css
    assert "#f4f5f7" not in css
    assert "#ffffff" not in css
    assert "#dbeafe" not in css


def test_styles_expose_system_state_primitives() -> None:
    """T-UX-00.7 unified system-state classes are present in CSS and initial HTML."""
    client = WebClient(StubCore())
    css = client.request("GET", "/assets/styles.css").text
    page = client.request("GET", "/")

    for selector in (
        ".state--loading",
        ".state--empty",
        ".state--error",
        ".notice--success",
        ".notice--error",
        ".notice--info",
        ".notice--warning",
        ".inline-state--empty",
        ".inline-state--error",
    ):
        assert selector in css

    assert "state-card" not in css
    assert 'class="state state--loading"' in page.text
    assert 'id="notice" class="notice"' in page.text
    assert 'id="notice" class="notice" role="status" aria-live="polite" hidden' in page.text


def test_index_exposes_global_navigation() -> None:
    """R0 navigation: five sections, default Vacancies, one visible view."""
    page = WebClient(StubCore()).request("GET", "/")
    text = page.text

    assert page.status_code == 200
    for section_id, hash_target, label in (
        ("vacancies", "#vacancies", "Вакансии"),
        ("journal", "#journal", "Журнал"),
        ("metrics", "#metrics", "Метрики"),
        ("people", "#people", "Люди"),
        ("hypotheses", "#hypotheses", "Гипотезы"),
    ):
        assert f'data-nav="{section_id}"' in text
        assert f'href="{hash_target}"' in text
        assert label in text

    assert 'data-nav="assessments"' not in text
    assert 'href="#assessments"' not in text
    assert 'data-section="assessments"' not in text

    assert 'data-section="vacancies"' in text
    assert 'id="section-vacancies" data-section="vacancies" role="region"' in text
    assert 'id="section-vacancies" data-section="vacancies" role="region" hidden' not in text
    for hidden_section in ("journal", "metrics", "people", "hypotheses"):
        assert re.search(
            rf'data-section="{hidden_section}"[^>]*\bhidden\b',
            text,
        )

    assert 'aria-current="page"' in text
    assert 'data-nav="vacancies" aria-current="page"' in text
    assert 'href="#applications"' not in text
    assert 'id="applications"' in text
    assert 'id="vacancy-dialog"' in text
    assert 'id="open-form"' in text


def test_app_js_navigation_contract() -> None:
    """Navigation logic stays centralized and hash-driven."""
    js = WebClient(StubCore()).request("GET", "/assets/app.js")

    assert js.status_code == 200
    for fragment in (
        "NAV_SECTIONS",
        "resolveSectionFromHash",
        "activateSection",
        'addEventListener("hashchange"',
        "NAV_DEFAULT_SECTION",
        "NAV_LEGACY_HASH_ALIASES",
        "initNavigation",
        'assessments: "vacancies"',
    ):
        assert fragment in js.text


def test_app_js_embeds_assessments_in_vacancy_context() -> None:
    """Assessments load with vacancies and render in row context, not as a section."""
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text

    for fragment in (
        "assessmentsByVacancyId",
        'fetch("/api/v1/assessments")',
        "vacancy-assessment-summary",
        "renderVacancyAssessmentSummary",
        "renderVacancyAssessmentDetail",
    ):
        assert fragment in js
    assert "loadAssessments" not in js
    assert '  "assessments",' not in js


def test_app_js_notice_contract() -> None:
    """Notice stays hidden until a non-empty message is shown."""
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text

    for fragment in (
        "function clearNotice",
        "function showNotice",
        "notice.hidden = true",
        'notice.innerHTML = ""',
        "if (!text)",
        "clearNotice();",
    ):
        assert fragment in js


def test_styles_expose_navigation_active_state() -> None:
    """Active nav uses more than color alone."""
    css = WebClient(StubCore()).request("GET", "/assets/styles.css")

    assert css.status_code == 200
    assert '.app-nav__link[aria-current="page"]' in css.text
    assert ".section-view[hidden]" in css.text


def test_index_exposes_migrated_screen_shell() -> None:
    """T-UX-00.6: collections are list-first and dialogs use foundation markup."""
    page = WebClient(StubCore()).request("GET", "/")
    text = page.text

    assert 'id="vacancies" class="list-rows vacancy-list"' in text
    assert 'id="people" class="list-rows people-list"' in text
    assert 'id="hypotheses" class="list-rows hypothesis-list"' in text
    assert 'id="assessments"' not in text
    assert "vacancy-grid" not in text
    assert "person-card" not in text
    assert "hypothesis-card" not in text
    assert "assessment-card" not in text
    assert 'id="application-form" class="dialog__form"' in text
    assert 'id="metric-form" class="dialog__form"' in text
    assert 'id="person-form" class="dialog__form"' in text
    assert 'id="hypothesis-form" class="dialog__form"' in text
    assert 'id="assessment-form"' not in text
    assert text.count('class="dialog__body"') >= 5
    assert text.count('class="dialog__actions"') >= 5


def test_app_js_uses_list_first_renderers() -> None:
    """Generated markup targets list-row primitives, not legacy cards."""
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text

    for fragment in (
        "function vacancyRow",
        "function personRow",
        "function hypothesisRow",
        "function applicationRow",
        "renderVacancyAssessmentSummary",
        "list-row-group",
        "row-detail",
        "metric-cell",
    ):
        assert fragment in js
    for legacy in (
        "vacancy-card",
        "person-card",
        "hypothesis-card",
        "assessment-card",
        "function assessmentRow",
    ):
        assert legacy not in js


def test_styles_drop_legacy_collection_selectors() -> None:
    """Legacy card/grid selectors are removed after screen migration."""
    css = WebClient(StubCore()).request("GET", "/assets/styles.css").text

    assert ".list-row-group" in css
    assert ".metric-cell" in css
    assert ".row-detail" in css
    for legacy in (
        ".vacancy-card",
        ".person-card",
        ".hypothesis-card",
        ".assessment-card",
        ".primary-button:not(.btn)",
        ".dialog-head",
        ".dialog-actions",
    ):
        assert legacy not in css


def test_core_transport_failure_has_stable_response() -> None:
    """A stopped Core yields an actionable Web response without a traceback."""
    response = WebClient(StubCore(unavailable=True)).request("GET", "/api/v1/vacancies")

    assert response.status_code == 503
    assert response.json() == {
        "code": "core_unavailable",
        "message": "Core API is unavailable",
    }


def test_application_flow_records_only_through_core_gateway() -> None:
    """Web creates and lists a local Application linked to an existing Vacancy."""
    core = StubCore()
    client = WebClient(core)
    created = client.request(
        "POST",
        "/api/v1/applications",
        headers={"Idempotency-Key": "web-application-create"},
        json={
            "vacancy_id": "00000000-0000-0000-0000-000000000042",
            "source": "manual",
            "external_id": "application-44",
            "resume_version": "backend-v3",
            "next_action": "Check for a reply",
        },
    )
    listing = client.request("GET", "/api/v1/applications")

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["vacancy"]["title"] == "Backend Engineer"
    assert [call[0] for call in core.calls] == ["application-create", "application-list"]


def test_live_reload_revision_disables_asset_cache_in_dev_mode() -> None:
    """The explicit Compose dev mode gives an open browser a changing revision."""
    client = WebClient(StubCore(), live_reload=True)

    revision = client.request("GET", "/dev/revision")
    asset = client.request("GET", "/assets/app.js")

    assert revision.status_code == 200
    assert revision.json()["enabled"] is True
    assert revision.json()["revision"].isdigit()
    assert asset.headers["cache-control"] == "no-store"


def test_metric_flow_lists_and_updates_only_through_core_gateway() -> None:
    """The dashboard persists a validated partial snapshot through Core HTTP."""
    core = StubCore()
    client = WebClient(core)
    created = client.request(
        "PUT",
        "/api/v1/metrics/2026-08-20",
        headers={"Idempotency-Key": "web-metric-key"},
        json={
            "metric_date": "2026-08-20",
            "applications": 3,
            "views_new": 7,
            "notes": "Synthetic dashboard request.",
        },
    )
    listing = client.request("GET", "/api/v1/metrics")

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert listing.json()["items"][0]["applications"] == 3
    assert [call[0] for call in core.calls] == ["metric-update", "metric-list"]


def test_metric_path_and_body_dates_must_match() -> None:
    """Web rejects ambiguous dated writes before contacting Core."""
    core = StubCore()
    response = WebClient(core).request(
        "PUT",
        "/api/v1/metrics/2026-08-20",
        headers={"Idempotency-Key": "mismatch"},
        json={"metric_date": "2026-08-19", "applications": 1},
    )

    assert response.status_code == 400
    assert response.json()["code"] == "metric_date_mismatch"
    assert core.calls == []


def test_people_flow_creates_lists_and_updates_only_through_core() -> None:
    """Web manages confirmed contacts without storage or external writes."""
    core = StubCore()
    client = WebClient(core)
    payload = {
        "company_id": "00000000-0000-0000-0000-000000000043",
        "vacancy_id": "00000000-0000-0000-0000-000000000042",
        "source": "manual",
        "external_id": "person-45",
        "full_name": "Alex Example",
        "role": "referral",
    }
    created = client.request(
        "POST", "/api/v1/people", json=payload, headers={"Idempotency-Key": "person-key"}
    )
    listing = client.request("GET", "/api/v1/people")
    updated = client.request(
        "PATCH", f"/api/v1/people/{created.json()['id']}", json={"status": "contacted"}
    )

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert updated.json()["status"] == "contacted"
    assert [call[0] for call in core.calls] == ["person-create", "person-list", "person-status"]


def test_hypothesis_flow_creates_lists_and_closes_only_through_core() -> None:
    """Web tracks one experiment without storage or external actions."""
    core = StubCore()
    client = WebClient(core)
    payload = {
        "source": "manual",
        "external_id": "hypothesis-46",
        "title": "Focused applications improve replies",
        "test_size": 10,
        "metric": "reply_rate",
    }
    created = client.request(
        "POST", "/api/v1/hypotheses", json=payload, headers={"Idempotency-Key": "hypothesis-key"}
    )
    listing = client.request("GET", "/api/v1/hypotheses")
    closed = client.request(
        "POST",
        f"/api/v1/hypotheses/{created.json()['id']}/close",
        json={"result": "Reply rate improved"},
    )

    assert created.status_code == 201
    assert listing.json()["total"] == 1
    assert closed.json()["status"] == "done"
    assert [call[0] for call in core.calls] == [
        "hypothesis-create",
        "hypothesis-list",
        "hypothesis-close",
    ]


def test_assessment_flow_creates_and_lists_only_through_core() -> None:
    """Web forwards normalized results without invoking any model provider."""
    core = StubCore()
    client = WebClient(core)
    payload = {
        "vacancy_id": "00000000-0000-0000-0000-000000000042",
        "source": "manual",
        "external_id": "assessment-47",
        "relevance_score": 82,
        "verdict": "apply",
        "reason": "Strong match",
        "risk": "Limited context",
        "action": "Prepare application",
        "model": "fixture-model",
        "prompt_version": "v1",
        "assessed_at": "2026-08-20T12:00:00Z",
    }
    created = client.request(
        "POST", "/api/v1/assessments", json=payload, headers={"Idempotency-Key": "assessment-key"}
    )
    listing = client.request("GET", "/api/v1/assessments")
    assert created.status_code == 201 and listing.json()["total"] == 1
    assert [call[0] for call in core.calls] == ["assessment-create", "assessment-list"]


def test_hh_connection_status_is_proxied() -> None:
    """Web exposes HH connection status without inventing resume or profile data."""
    hh = StubHh(status="not_authorized")
    client = WebClient(StubCore(), hh=hh)
    response = client.request("GET", "/api/v1/hh/connection")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "not_authorized"
    assert payload["action"]["code"] == "open_login"
    assert "access_token" not in response.text
    assert "0 resumes" not in response.text.lower()
    assert hh.calls == [("connection", None)]


def test_hh_unavailable_is_explicit() -> None:
    """HH transport failure is unavailable, not unauthorized."""
    client = WebClient(StubCore(), hh=StubHh(unavailable=True))
    response = client.request("GET", "/api/v1/hh/connection")
    assert response.status_code == 503
    payload = response.json()
    assert payload["code"] == "hh_unavailable"
    assert payload["status"] == "unavailable"


def test_hh_account_status_is_proxied() -> None:
    """Web exposes normalized HH account without resume claims or secrets."""
    hh = StubHh(status="connected")
    client = WebClient(StubCore(), hh=hh)
    response = client.request("GET", "/api/v1/hh/account")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "available"
    assert payload["account"]["external_id"] == "hh-fixture-42"
    assert payload["account"]["display_name"] == "Pat Tester"
    assert "access_token" not in response.text
    assert "0 resumes" not in response.text.lower()
    assert "resumes_count" not in response.text
    assert hh.calls == [("account", None)]


def test_hh_resumes_list_is_proxied() -> None:
    """Web exposes normalized resume summaries without secrets or empty-auth lies."""
    hh = StubHh(status="connected")
    client = WebClient(StubCore(), hh=hh)
    response = client.request("GET", "/api/v1/hh/resumes")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "available"
    assert payload["transport"] == "browser_readonly"
    assert len(payload["items"]) == 2
    assert payload["items"][0]["external_id"] == "resume-fixture-1"
    assert "access_token" not in response.text
    assert hh.calls == [("resumes", None)]
