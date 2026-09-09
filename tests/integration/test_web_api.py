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
    # Open-login is a button (no pre-baked noVNC href before browser_started).
    assert 'href="http://127.0.0.1:6080/vnc.html?autoconnect=1&resize=scale"' not in page.text
    assert "Войти в HeadHunter" in page.text
    assert "Я вошёл — проверить" in page.text
    assert "HeadHunter" in page.text
    assert "/assets/app.js?v=20260909-r52" in page.text
    assert "/assets/styles.css?v=20260909-r52" in page.text
    assert 'id="vacancy-filter-verdict"' in page.text
    assert 'id="vacancy-filter-scoring"' in page.text
    assert 'id="vacancy-filter-owner"' in page.text
    assert 'id="vacancy-pagination"' in page.text
    assert "К разбору" in page.text
    assert 'class="btn btn--primary"' in page.text
    assert 'class="dialog"' in page.text
    assert 'class="dialog__header"' in page.text
    assert listing.json()["total"] == 1
    assert created.status_code == 201
    assert updated.json()["status"] == "shortlisted"
    owner = client.request(
        "PATCH",
        "/api/v1/vacancies/00000000-0000-0000-0000-000000000042/owner-decision",
        json={"owner_decision": "interested"},
    )
    assert owner.status_code == 200
    assert owner.json()["owner_decision"] == "interested"
    plan = client.request(
        "PATCH",
        "/api/v1/vacancies/00000000-0000-0000-0000-000000000042/action-plan",
        json={"action_channel": "hh", "next_action": "Откликнуться на HH"},
    )
    assert plan.status_code == 200
    assert plan.json()["action_channel"] == "hh"
    assert plan.json()["next_action"] == "Откликнуться на HH"
    assert plan.json()["owner_decision"] == "interested"
    assert [call[0] for call in core.calls] == [
        "list",
        "create",
        "update",
        "owner-decision",
        "action-plan",
    ]


def test_vacancy_list_forwards_pagination_query() -> None:
    """R2.5.1: Web forwards review pagination query params to Core."""
    core = StubCore()
    client = WebClient(core)
    listing = client.request(
        "GET",
        "/api/v1/vacancies?limit=50&offset=0&review_order=true&verdict=apply",
    )
    assert listing.status_code == 200
    body = listing.json()
    assert body["limit"] == 50
    assert body["offset"] == 0
    assert body["total"] == 1
    assert len(body["items"]) == 1
    assert core.calls[0][0] == "list"
    forwarded = core.calls[0][1]
    assert ("limit", "50") in forwarded
    assert ("offset", "0") in forwarded
    assert ("review_order", "true") in forwarded
    assert ("verdict", "apply") in forwarded


def test_vacancy_list_forwards_sort_query() -> None:
    core = StubCore()
    client = WebClient(core)
    listing = client.request(
        "GET",
        "/api/v1/vacancies?limit=25&offset=0&sort=newest&owner_decision=interested",
    )
    assert listing.status_code == 200
    forwarded = core.calls[0][1]
    assert ("sort", "newest") in forwarded
    assert ("limit", "25") in forwarded
    assert ("owner_decision", "interested") in forwarded


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
    """Assessments come from vacancy current_assessment and render in row context."""
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text

    for fragment in (
        "assessmentsByVacancyId",
        "include_current_assessment",
        "indexAssessmentsFromVacancies",
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


def test_hh_health_ready_is_proxied() -> None:
    hh = StubHh(status="connected")
    hh.health_result = (
        503,
        {
            "status": "degraded",
            "code": "browser_proxy_unavailable",
            "api": "ok",
            "browser_egress": "unavailable",
            "auth_session": "present",
            "egress": {"proxy_connect_ok": False, "proxy_reachable": True},
        },
    )
    client = WebClient(StubCore(), hh=hh)
    response = client.request("GET", "/api/v1/hh/health")
    assert response.status_code == 503
    body = response.json()
    assert body["browser_egress"] == "unavailable"
    assert body["code"] == "browser_proxy_unavailable"
    assert hh.calls == [("health", None)]


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
    assert payload["selection"]["status"] == "none"
    assert payload["active_resume"] is None
    assert "access_token" not in response.text
    assert hh.calls == [("resumes", None)]


def test_hh_active_resume_can_be_selected_and_cleared() -> None:
    """Web proxies active resume selection without Core linkage or secrets."""
    hh = StubHh(status="connected")
    client = WebClient(StubCore(), hh=hh)

    selected = client.request(
        "PUT",
        "/api/v1/hh/resumes/active",
        json={"external_id": "resume-fixture-2"},
    )
    assert selected.status_code == 200
    body = selected.json()
    assert body["selection"]["status"] == "active"
    assert body["active_resume"]["external_id"] == "resume-fixture-2"
    assert body["items"][1]["active"] is True
    assert body["items"][0]["active"] is False

    cleared = client.request(
        "PUT",
        "/api/v1/hh/resumes/active",
        json={"external_id": None},
    )
    assert cleared.status_code == 200
    assert cleared.json()["selection"]["status"] == "none"
    assert cleared.json()["active_resume"] is None

    invalid = client.request(
        "PUT",
        "/api/v1/hh/resumes/active",
        json={"external_id": "not-a-real-resume"},
    )
    assert invalid.status_code == 409
    assert invalid.json()["code"] == "invalid_resume_id"
    assert "access_token" not in invalid.text


def test_hh_open_login_proxy_returns_failure_payload() -> None:
    """Accepted HTTP from HH does not imply domain success — Web forwards conflict."""
    hh = StubHh(status="action_required")
    hh.open_login_result = (
        409,
        {
            "code": "novnc_unavailable",
            "message": "novnc_unavailable",
            "browser_started": False,
            "connection": {
                "status": "action_required",
                "action": {"code": "confirm_login"},
            },
        },
    )
    client = WebClient(StubCore(), hh=hh)
    response = client.request("POST", "/api/v1/hh/connection/open-login")
    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "novnc_unavailable"
    assert body["browser_started"] is False
    assert hh.calls == [("open-login", None)]


def test_hh_resumes_markup_exposes_clear_and_sync_controls() -> None:
    client = WebClient(StubCore())
    page = client.request("GET", "/")
    assert 'id="hh-resumes-clear"' in page.text
    assert "Сбросить выбор" in page.text
    assert 'id="hh-resume-content"' in page.text
    assert 'id="hh-resume-sync"' in page.text
    assert "Синхронизировать" in page.text
    assert "Локальная связь" not in page.text


def test_app_js_resume_content_ux_contract() -> None:
    js = WebClient(StubCore()).request("GET", "/assets/app.js").text
    for fragment in (
        "renderHhResumeContent",
        "syncHhResumeContent",
        "Содержание синхронизировано",
        "Содержание ещё не синхронизировано",
        "Локальная копия сохранена",
        "Не удалось проверить HeadHunter",
        "/api/v1/hh/resumes/sync",
        "Обновить",
    ):
        assert fragment in js
    assert "Локальная связь" not in js
    assert "content_hash" not in js
    assert "ProfileVersion" not in js


def test_hh_resume_sync_is_proxied() -> None:
    hh = StubHh(status="connected")
    hh.active_external_id = "resume-fixture-1"
    client = WebClient(StubCore(), hh=hh)
    response = client.request("POST", "/api/v1/hh/resumes/sync", json={})
    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["code"] == "unchanged"
    assert body["candidate_context"]["resume_content"]["content_state"] == "synced"
    assert ("resumes-sync", "resume-fixture-1") in hh.calls


def test_candidate_context_is_proxied_from_core() -> None:
    core = StubCore()
    core.candidate_profile = {
        "id": "00000000-0000-0000-0000-000000000099",
        "created_at": "2026-08-26T12:00:00Z",
    }
    core.profile_version = {
        "id": "00000000-0000-0000-0000-000000000098",
        "label": "r1-default",
        "created_at": "2026-08-26T12:00:00Z",
    }
    core.hh_resume_link = {
        "source": "hh",
        "external_resume_id": "resume-fixture-1",
        "title": "Fixture Product Manager",
        "status": "active",
        "selected_at": "2026-08-26T12:00:00Z",
        "updated_at": "2026-08-26T12:00:00Z",
    }
    core.resume_content = {
        "content_state": "synced",
        "resume_version_id": "00000000-0000-0000-0000-000000000097",
        "external_resume_id": "resume-fixture-1",
        "captured_at": "2026-08-27T12:00:00Z",
        "source": "hh",
        "schema_version": 1,
    }
    client = WebClient(core)
    response = client.request("GET", "/api/v1/candidate-context")
    assert response.status_code == 200
    assert response.json()["hh_resume_link"]["status"] == "active"
    assert response.json()["resume_content"]["content_state"] == "synced"
    assert ("candidate-context", None) in core.calls
