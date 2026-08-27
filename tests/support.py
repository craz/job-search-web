"""Synthetic Core gateway and ASGI helper shared by Web tests."""

from __future__ import annotations

from typing import Any

import anyio
import httpx

from job_search_web.app import create_app
from job_search_web.core_client import CoreUnavailableError


def vacancy(status: str = "new") -> dict[str, Any]:
    """Return one normalized public vacancy without personal data."""
    return {
        "id": "00000000-0000-0000-0000-000000000042",
        "source": "fixture",
        "external_id": "vacancy-42",
        "title": "Backend Engineer",
        "url": "https://example.com/vacancies/42",
        "description": "Synthetic Web fixture.",
        "status": status,
        "created_at": "2026-08-18T10:00:00Z",
        "updated_at": "2026-08-18T10:00:00Z",
        "company": {
            "id": "00000000-0000-0000-0000-000000000043",
            "name": "Example Labs",
            "source": "fixture",
            "external_id": "company-42",
            "website_url": "https://example.test/",
        },
    }


def application() -> dict[str, Any]:
    """Return one normalized public Application linked to the fixture vacancy."""
    return {
        "id": "00000000-0000-0000-0000-000000000044",
        "source": "manual",
        "external_id": "application-44",
        "applied_at": "2026-08-20T10:00:00Z",
        "resume_version": "backend-v3",
        "cover_letter_version": None,
        "cover_letter_text": "Synthetic application fixture.",
        "result": None,
        "next_action": "Check for a reply",
        "next_action_at": "2026-08-27T10:00:00Z",
        "created_at": "2026-08-20T10:00:00Z",
        "updated_at": "2026-08-20T10:00:00Z",
        "vacancy": {
            "id": "00000000-0000-0000-0000-000000000042",
            "title": "Backend Engineer",
            "status": "new",
        },
    }


def daily_metric() -> dict[str, Any]:
    """Return one normalized public Daily Metric snapshot."""
    return {
        "metric_date": "2026-08-20",
        "views_total": 12,
        "views_new": 3,
        "applications": 2,
        "replies": 1,
        "invitations": 1,
        "rejections": 0,
        "notes": "Synthetic dashboard fixture.",
        "created_at": "2026-08-20T10:00:00Z",
        "updated_at": "2026-08-20T10:00:00Z",
    }


def person() -> dict[str, Any]:
    """Return one confirmed synthetic Person linked to fixture identities."""
    item = vacancy()
    return {
        "id": "00000000-0000-0000-0000-000000000045",
        "source": "manual",
        "external_id": "person-45",
        "full_name": "Alex Example",
        "role": "referral",
        "title": "Senior Engineer",
        "url": "https://example.com/people/alex-example",
        "confidence": 0.9,
        "status": "new",
        "notes": "Synthetic confirmed contact.",
        "created_at": "2026-08-20T10:00:00Z",
        "updated_at": "2026-08-20T10:00:00Z",
        "company": item["company"],
        "vacancy": {"id": item["id"], "title": item["title"], "status": item["status"]},
    }


def hypothesis() -> dict[str, Any]:
    """Return one synthetic measurable search experiment."""
    return {
        "id": "00000000-0000-0000-0000-000000000046",
        "source": "manual",
        "external_id": "hypothesis-46",
        "title": "Focused applications improve replies",
        "description": "Synthetic Web experiment.",
        "test_size": 10,
        "metric": "reply_rate",
        "status": "active",
        "result": None,
        "created_at": "2026-08-20T10:00:00Z",
        "updated_at": "2026-08-20T10:00:00Z",
    }


def assessment() -> dict[str, Any]:
    """Return one normalized synthetic scoring result."""
    item = vacancy()
    return {
        "id": "00000000-0000-0000-0000-000000000047",
        "source": "manual",
        "external_id": "assessment-47",
        "relevance_score": 82,
        "verdict": "apply",
        "reason": "Strong synthetic match",
        "risk": "Limited domain context",
        "action": "Prepare a tailored application",
        "model": "fixture-model",
        "prompt_version": "fixture-v1",
        "assessed_at": "2026-08-20T12:00:00Z",
        "created_at": "2026-08-20T12:00:00Z",
        "vacancy": {"id": item["id"], "title": item["title"], "status": item["status"]},
    }


class StubCore:
    """In-memory contract double recording every Web-to-Core operation."""

    def __init__(self, *, unavailable: bool = False) -> None:
        """Start with one vacancy or force all operations to fail."""
        self.unavailable = unavailable
        self.items = [vacancy()]
        self.application_items: list[dict[str, Any]] = []
        self.metric_items: list[dict[str, Any]] = []
        self.person_items: list[dict[str, Any]] = []
        self.hypothesis_items: list[dict[str, Any]] = []
        self.assessment_items: list[dict[str, Any]] = []
        self.candidate_profile: dict[str, Any] | None = None
        self.profile_version: dict[str, Any] | None = None
        self.hh_resume_link: dict[str, Any] | None = None
        self.resume_content: dict[str, Any] | None = None
        self.calls: list[tuple[str, Any]] = []

    def _guard(self) -> None:
        """Raise the same transport signal as the real Core adapter."""
        if self.unavailable:
            raise CoreUnavailableError

    def list_vacancies(self) -> tuple[int, Any]:
        """Return the current synthetic collection."""
        self._guard()
        self.calls.append(("list", None))
        return 200, {"items": self.items, "total": len(self.items)}

    def create_vacancy(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record idempotency metadata and return a created vacancy."""
        self._guard()
        self.calls.append(("create", (payload, key)))
        created = vacancy()
        created["title"] = payload["title"]
        self.items.insert(0, created)
        return 201, created

    def update_status(self, vacancy_id: str, status: str) -> tuple[int, Any]:
        """Record and apply one synthetic status change."""
        self._guard()
        self.calls.append(("update", (vacancy_id, status)))
        updated = {**self.items[0], "status": status}
        self.items[0] = updated
        return 200, updated

    def list_applications(self) -> tuple[int, Any]:
        """Return the current synthetic Application collection."""
        self._guard()
        self.calls.append(("application-list", None))
        return 200, {"items": self.application_items, "total": len(self.application_items)}

    def create_application(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record a local Application and its idempotency metadata."""
        self._guard()
        self.calls.append(("application-create", (payload, key)))
        created = application()
        created["source"] = payload["source"]
        created["external_id"] = payload["external_id"]
        self.application_items.insert(0, created)
        return 201, created

    def list_metrics(self) -> tuple[int, Any]:
        """Return the current synthetic Daily Metric history."""
        self._guard()
        self.calls.append(("metric-list", None))
        return 200, {"items": self.metric_items, "total": len(self.metric_items)}

    def update_metric(self, metric_date: str, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record one partial dated snapshot and retry metadata."""
        self._guard()
        self.calls.append(("metric-update", (metric_date, payload, key)))
        created = daily_metric()
        created.update(payload)
        created["metric_date"] = metric_date
        self.metric_items = [created]
        return 201, created

    def list_people(self) -> tuple[int, Any]:
        """Return confirmed synthetic contacts."""
        self._guard()
        self.calls.append(("person-list", None))
        return 200, {"items": self.person_items, "total": len(self.person_items)}

    def create_person(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record one confirmed contact and retry metadata."""
        self._guard()
        self.calls.append(("person-create", (payload, key)))
        created = person()
        created.update(
            {
                name: value
                for name, value in payload.items()
                if name not in {"company_id", "vacancy_id"}
            }
        )
        self.person_items.insert(0, created)
        return 201, created

    def update_person_status(self, person_id: str, status: str) -> tuple[int, Any]:
        """Apply one synthetic local contact status."""
        self._guard()
        self.calls.append(("person-status", (person_id, status)))
        updated = {**self.person_items[0], "status": status}
        self.person_items[0] = updated
        return 200, updated

    def list_hypotheses(self) -> tuple[int, Any]:
        """Return synthetic search experiments."""
        self._guard()
        self.calls.append(("hypothesis-list", None))
        return 200, {"items": self.hypothesis_items, "total": len(self.hypothesis_items)}

    def create_hypothesis(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record one synthetic experiment and retry metadata."""
        self._guard()
        self.calls.append(("hypothesis-create", (payload, key)))
        created = hypothesis()
        created.update(payload)
        self.hypothesis_items.insert(0, created)
        return 201, created

    def close_hypothesis(self, hypothesis_id: str, result: str) -> tuple[int, Any]:
        """Close one synthetic experiment with an observed result."""
        self._guard()
        self.calls.append(("hypothesis-close", (hypothesis_id, result)))
        updated = {**self.hypothesis_items[0], "status": "done", "result": result}
        self.hypothesis_items[0] = updated
        return 200, updated

    def list_assessments(self) -> tuple[int, Any]:
        """Return normalized synthetic scoring results."""
        self._guard()
        self.calls.append(("assessment-list", None))
        return 200, {"items": self.assessment_items, "total": len(self.assessment_items)}

    def create_assessment(self, payload: dict[str, Any], key: str) -> tuple[int, Any]:
        """Record one normalized result and retry metadata."""
        self._guard()
        self.calls.append(("assessment-create", (payload, key)))
        created = assessment()
        created.update({k: v for k, v in payload.items() if k != "vacancy_id"})
        self.assessment_items.insert(0, created)
        return 201, created

    def get_candidate_context(self) -> tuple[int, Any]:
        """Return synthetic CandidateProfile linkage for Web tests."""
        self._guard()
        self.calls.append(("candidate-context", None))
        return 200, {
            "candidate_profile": self.candidate_profile,
            "profile_version": self.profile_version,
            "hh_resume_link": self.hh_resume_link,
            "resume_content": self.resume_content,
        }


class StubOsint:
    """In-memory normalized research gateway without provider or storage access."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, Any]] = []
        self.items = [
            {
                "report_id": "report-1",
                "company_id": "00000000-0000-0000-0000-000000000043",
                "vacancy_id": "00000000-0000-0000-0000-000000000042",
                "company_name": "Example Labs",
                "website_url": "https://example.test/",
                "observed_at": "2026-08-20T12:00:00Z",
                "people": [
                    {
                        "id": "00000000-0000-0000-0000-000000000044",
                        "full_name": "Alex Example",
                        "title": "CTO",
                        "source_url": "https://example.test/team/alex",
                        "source": "company-site",
                        "confidence": 0.75,
                        "evidence_excerpt": "Alex Example, CTO at Example Labs.",
                        "observed_at": "2026-08-20T12:00:00Z",
                        "status": "proposed",
                    }
                ],
            }
        ]
        self.mirrors = [
            {
                "report_id": "mirror-1",
                "company_id": "00000000-0000-0000-0000-000000000043",
                "vacancy_id": "00000000-0000-0000-0000-000000000042",
                "company_name": "Example Labs",
                "website_url": "https://example.test/",
                "vacancy_title": "Synthetic Integration Engineer",
                "observed_at": "2026-08-20T12:05:00Z",
                "mirrors": [
                    {
                        "url": "https://example.test/vacancies/synthetic-integration-engineer",
                        "title": "Synthetic Integration Engineer",
                        "score": 48.0,
                        "reasons": ["title_tokens=2/2"],
                        "source": "company-site",
                        "source_url": "https://example.test/vacancies/synthetic-integration-engineer",
                        "confidence": 0.48,
                        "observed_at": "2026-08-20T12:05:00Z",
                        "status": "proposed",
                    }
                ],
            }
        ]

    def list_people_proposals(self) -> tuple[int, Any]:
        self.calls.append(("list", None))
        return 200, {"items": self.items, "total": len(self.items)}

    def research_people(self, payload: dict[str, Any]) -> tuple[int, Any]:
        self.calls.append(("research", payload))
        return 200, self.items[0]

    def confirm_person(self, payload: dict[str, Any]) -> tuple[int, Any]:
        self.calls.append(("confirm", payload))
        person = self.items[0]["people"][0]
        confirmed = {
            **person,
            "status": "confirmed",
            "confirmed_at": "2026-08-20T12:30:00Z",
        }
        self.items[0]["people"][0] = confirmed
        return 200, {
            "person": confirmed,
            "core_person": {
                "id": "00000000-0000-0000-0000-000000000045",
                "source": "osint",
                "external_id": person["id"],
                "full_name": person["full_name"],
                "role": "hiring_manager",
                "title": person["title"],
                "status": "new",
            },
        }

    def list_vacancy_mirrors(self) -> tuple[int, Any]:
        self.calls.append(("mirror-list", None))
        return 200, {"items": self.mirrors, "total": len(self.mirrors)}

    def discover_vacancy_mirrors(self, payload: dict[str, Any]) -> tuple[int, Any]:
        self.calls.append(("mirror-discover", payload))
        return 200, self.mirrors[0]


class StubHh:
    """In-memory HH connection/account gateway for Web tests."""

    def __init__(
        self,
        *,
        status: str = "connected",
        unavailable: bool = False,
        profile_status: str = "available",
    ) -> None:
        self.unavailable = unavailable
        self.status = status
        self.profile_status = profile_status
        self.active_external_id: str | None = None
        self.calls: list[tuple[str, Any]] = []

    def _payload(self) -> dict[str, Any]:
        actions = {
            "connected": {"code": "none"},
            "not_authorized": {"code": "open_login", "novnc_url": "http://127.0.0.1:6080/"},
            "expired": {"code": "reconnect", "novnc_url": "http://127.0.0.1:6080/"},
            "action_required": {"code": "confirm_login", "novnc_url": "http://127.0.0.1:6080/"},
            "unavailable": {"code": "none"},
        }
        return {
            "status": self.status,
            "authenticated": self.status == "connected",
            "login_ready": self.status in {"connected", "action_required", "expired"},
            "expired": self.status == "expired",
            "expires_at": None,
            "action": actions.get(self.status, {"code": "none"}),
            "code": self.status,
            "checked_at": "2026-08-25T12:00:00Z",
        }

    def _account_payload(self) -> dict[str, Any]:
        if self.profile_status != "available":
            return {
                "status": self.profile_status,
                "account": None,
                "connection_status": self.status,
                "code": self.profile_status,
                "checked_at": "2026-08-25T12:00:00Z",
            }
        return {
            "status": "available",
            "account": {
                "external_id": "hh-fixture-42",
                "display_name": "Pat Tester",
                "email": "pat@example.test",
            },
            "connection_status": self.status,
            "code": "ready",
            "checked_at": "2026-08-25T12:00:00Z",
        }

    def connection_status(self) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("connection", None))
        return 200, self._payload()

    def account_status(self) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("account", None))
        return 200, self._account_payload()

    def resumes_list(self) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("resumes", None))
        if self.profile_status != "available" and self.status != "connected":
            return 200, {
                "status": "not_authorized",
                "items": [],
                "code": "browser_login_required",
                "transport": "browser_readonly",
                "checked_at": "2026-08-25T12:00:00Z",
                "selection": {
                    "status": "unavailable",
                    "external_id": self.active_external_id,
                    "available": False,
                },
                "active_resume": None,
            }
        return 200, {
            "status": "available",
            "items": [
                {
                    "external_id": "resume-fixture-1",
                    "title": "Fixture Product Manager",
                    "active": self.active_external_id == "resume-fixture-1",
                },
                {
                    "external_id": "resume-fixture-2",
                    "title": "Fixture Engineer",
                    "active": self.active_external_id == "resume-fixture-2",
                },
            ],
            "code": "ready",
            "transport": "browser_readonly",
            "checked_at": "2026-08-25T12:00:00Z",
            "selection": self._selection_payload(),
            "active_resume": self._active_resume_payload(),
        }

    def _selection_payload(self) -> dict[str, Any]:
        if self.active_external_id is None:
            return {"status": "none", "external_id": None, "available": True}
        if self.active_external_id in {"resume-fixture-1", "resume-fixture-2"}:
            return {
                "status": "active",
                "external_id": self.active_external_id,
                "available": True,
            }
        return {
            "status": "stale",
            "external_id": self.active_external_id,
            "available": True,
            "action": {"code": "reselect"},
        }

    def _active_resume_payload(self) -> dict[str, str] | None:
        titles = {
            "resume-fixture-1": "Fixture Product Manager",
            "resume-fixture-2": "Fixture Engineer",
        }
        if self.active_external_id not in titles:
            return None
        return {
            "external_id": self.active_external_id,
            "title": titles[self.active_external_id],
        }

    def set_active_resume(self, *, external_id: str | None) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("resumes-active", external_id))
        if external_id is not None and external_id not in {
            "resume-fixture-1",
            "resume-fixture-2",
        }:
            return 409, {
                "ok": False,
                "code": "invalid_resume_id",
                "message": "external_id is not in the current resume list",
                "resumes": self.resumes_list()[1],
            }
        self.active_external_id = external_id
        payload = self.resumes_list()[1]
        title = (
            "Fixture Engineer"
            if external_id == "resume-fixture-2"
            else ("Fixture Product Manager" if external_id else None)
        )
        if external_id is None:
            resume_content = {
                "content_state": "none",
                "resume_version_id": None,
                "external_resume_id": None,
                "captured_at": None,
            }
        elif external_id == "resume-fixture-1":
            resume_content = {
                "content_state": "synced",
                "resume_version_id": "00000000-0000-0000-0000-000000000097",
                "external_resume_id": external_id,
                "captured_at": "2026-08-27T12:00:00Z",
                "source": "hh",
                "schema_version": 1,
            }
        else:
            resume_content = {
                "content_state": "not_synced",
                "resume_version_id": None,
                "external_resume_id": external_id,
                "captured_at": None,
                "source": "hh",
            }
        payload["core_linkage"] = {
            "ok": True,
            "code": "synced",
            "candidate_context": {
                "candidate_profile": {"id": "00000000-0000-0000-0000-000000000099"},
                "profile_version": {
                    "id": "00000000-0000-0000-0000-000000000098",
                    "label": "r1-default",
                },
                "hh_resume_link": {
                    "source": "hh",
                    "external_resume_id": external_id,
                    "status": "active" if external_id else "cleared",
                    "title": title,
                },
                "resume_content": resume_content,
            },
        }
        return 200, payload

    def sync_resume_content(self, *, external_id: str | None = None) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        target = external_id or self.active_external_id
        self.calls.append(("resumes-sync", target))
        if not target:
            return 409, {
                "ok": False,
                "status": "unavailable",
                "code": "no_active_resume",
                "ingest": None,
                "candidate_context": None,
            }
        if self.status != "connected":
            return 409, {
                "ok": False,
                "status": "not_authorized",
                "code": "browser_login_required",
                "ingest": None,
                "candidate_context": None,
                "action": {"code": "open_login", "novnc_url": "http://127.0.0.1:6080/"},
            }
        created = target == "resume-fixture-2"
        version_id = (
            "00000000-0000-0000-0000-000000000096"
            if created
            else "00000000-0000-0000-0000-000000000097"
        )
        title = "Fixture Engineer" if target == "resume-fixture-2" else "Fixture Product Manager"
        context = {
            "candidate_profile": {"id": "00000000-0000-0000-0000-000000000099"},
            "profile_version": {
                "id": "00000000-0000-0000-0000-000000000098",
                "label": "r1-default",
            },
            "hh_resume_link": {
                "source": "hh",
                "external_resume_id": target,
                "status": "active",
                "title": title,
            },
            "resume_content": {
                "content_state": "synced",
                "resume_version_id": version_id,
                "external_resume_id": target,
                "captured_at": "2026-08-27T12:30:00Z",
                "source": "hh",
                "schema_version": 1,
            },
        }
        return 200, {
            "ok": True,
            "status": "available",
            "code": "synced" if created else "unchanged",
            "external_resume_id": target,
            "ingest": {
                "ok": True,
                "created": created,
                "resume_version_id": version_id,
                "content_hash": "fixturehash",
            },
            "candidate_context": context,
        }

    def open_login(self) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("open-login", None))
        self.status = "action_required"
        return 200, {
            "browser_started": True,
            "novnc_url": "http://127.0.0.1:6080/",
            "connection": self._payload(),
        }

    def confirm_login(self, *, confirmed: bool) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("confirm", confirmed))
        self.status = "connected" if confirmed else self.status
        return 200, {"auth_session": "present", "connection": self._payload()}


class WebClient:
    """Synchronous facade around HTTPX's maintained ASGI transport."""

    def __init__(
        self,
        core: StubCore,
        *,
        osint: StubOsint | None = None,
        hh: StubHh | None = None,
        live_reload: bool = False,
    ) -> None:
        """Bind requests to one Web app and synthetic Core gateway."""
        self.app = create_app(core, osint or StubOsint(), hh or StubHh(), live_reload=live_reload)

    def request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        """Send one request without opening a network socket."""

        async def send() -> httpx.Response:
            transport = httpx.ASGITransport(app=self.app)
            async with httpx.AsyncClient(transport=transport, base_url="http://web.test") as client:
                return await client.request(method, path, **kwargs)

        return anyio.run(send)
