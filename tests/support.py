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
        "archived": None,
        "source_status": "unknown",
        "source_status_checked_at": None,
        "archived_at": None,
        "source_status_reason": None,
        "first_seen_at": "2026-08-18T10:00:00Z",
        "last_seen_at": "2026-08-18T10:00:00Z",
        "source_published_at": None,
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
        self.search_profiles: list[dict[str, Any]] = []
        self.search_runs: list[dict[str, Any]] = []
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

    def get_vacancy(self, vacancy_id: str) -> tuple[int, Any]:
        """Return one synthetic vacancy by id."""
        self._guard()
        self.calls.append(("get", vacancy_id))
        for item in self.items:
            if item["id"] == vacancy_id:
                return 200, dict(item)
        return 404, {"code": "vacancy_not_found", "message": "Vacancy does not exist"}

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

    def post_vacancy_source_status(
        self, vacancy_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]:
        """Apply one synthetic source-status observation."""
        self._guard()
        self.calls.append(("source-status", (vacancy_id, payload)))
        for index, item in enumerate(self.items):
            if item["id"] != vacancy_id:
                continue
            status = payload.get("status", "unknown")
            updated = {
                **item,
                "source_status": status,
                "source_status_checked_at": payload.get("checked_at") or "2026-09-03T12:00:00Z",
                "source_status_reason": payload.get("reason"),
                "archived": True
                if status == "archived"
                else (False if status == "active" else None),
                "archived_at": (
                    payload.get("checked_at") or "2026-09-03T12:00:00Z"
                    if status == "archived"
                    else (None if status == "active" else item.get("archived_at"))
                ),
            }
            self.items[index] = updated
            return 200, dict(updated)
        return 404, {"code": "vacancy_not_found", "message": "Vacancy does not exist"}

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
            "resume_file": getattr(self, "resume_file", None),
        }

    def download_resume_artifact(self, artifact_id: str) -> tuple[int, bytes, dict[str, str]]:
        """Return synthetic resume file bytes for download proxy tests."""
        self._guard()
        self.calls.append(("resume-artifact-download", artifact_id))
        payload = getattr(self, "resume_artifact_bytes", b"%PDF-1.4 fixture")
        return (
            200,
            payload,
            {
                "content-type": "application/pdf",
                "content-disposition": 'attachment; filename="resume.pdf"',
            },
        )

    def list_search_profiles(self) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-profile-list", None))
        return 200, {
            "items": list(self.search_profiles),
            "total": len(self.search_profiles),
        }

    def create_search_profile(self, payload: dict[str, Any]) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-profile-create", payload))
        created = {
            "id": "00000000-0000-0000-0000-000000000080",
            "label": payload.get("label") or "Основной поиск",
            "text": payload["text"],
            "area_id": payload.get("area_id"),
            "salary": payload.get("salary"),
            "experience": payload.get("experience"),
            "employment": payload.get("employment"),
            "schedule": payload.get("schedule"),
            "search_field": payload.get("search_field"),
            "only_with_salary": payload.get("only_with_salary"),
            "created_at": "2026-08-27T12:00:00Z",
            "updated_at": "2026-08-27T12:00:00Z",
        }
        self.search_profiles.insert(0, created)
        return 201, created

    def get_search_profile(self, profile_id: str) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-profile-get", profile_id))
        for item in self.search_profiles:
            if item["id"] == profile_id:
                return 200, item
        return 404, {"code": "search_profile_not_found", "message": "SearchProfile not found"}

    def update_search_profile(self, profile_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-profile-update", (profile_id, payload)))
        for index, item in enumerate(self.search_profiles):
            if item["id"] == profile_id:
                updated = {**item, **payload, "updated_at": "2026-08-27T12:30:00Z"}
                self.search_profiles[index] = updated
                return 200, updated
        return 404, {"code": "search_profile_not_found", "message": "SearchProfile not found"}

    def list_search_runs(self, *, search_profile_id: str | None = None) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-run-list", search_profile_id))
        items = list(self.search_runs)
        if search_profile_id:
            items = [r for r in items if r.get("search_profile_id") == search_profile_id]
        return 200, {"items": items, "total": len(items)}

    def get_search_run(self, run_id: str) -> tuple[int, Any]:
        self._guard()
        self.calls.append(("search-run-get", run_id))
        for item in self.search_runs:
            if item["id"] == run_id:
                return 200, item
        return 404, {"code": "search_run_not_found", "message": "SearchRun not found"}


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
        self.search_result: tuple[int, Any] | None = None
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

    def search_vacancies(self, payload: dict[str, Any]) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("vacancies-search", payload))
        if getattr(self, "search_result", None) is not None:
            status_code, body = self.search_result
            return status_code, body
        run = {
            "id": "00000000-0000-0000-0000-000000000081",
            "search_profile_id": payload["search_profile_id"],
            "acquisition_kind": "profile_search",
            "status": "success",
            "found_count": 2,
            "created_count": 1,
            "updated_count": 0,
            "unchanged_count": 1,
            "error_count": 0,
            "error_code": None,
            "source_total": None,
            "started_at": "2026-08-27T12:00:00Z",
            "finished_at": "2026-08-27T12:02:00Z",
            "criteria_snapshot": {"text": "python", "area_id": "1"},
            "execution_snapshot": {
                "order": "publication_time",
                "max_pages": 1,
                "transport": "browser",
            },
        }
        return 200, {
            "ok": True,
            "status": "success",
            "code": "ready",
            "search_profile_id": payload["search_profile_id"],
            "search_run": run,
            "items": [],
            "hh_writes": False,
        }

    def search_suitable_vacancies(self, payload: dict[str, Any] | None = None) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        body = payload if isinstance(payload, dict) else {}
        self.calls.append(("vacancies-suitable", body))
        if getattr(self, "suitable_result", None) is not None:
            status_code, result = self.suitable_result
            return status_code, result
        run = {
            "id": "00000000-0000-0000-0000-000000000083",
            "search_profile_id": None,
            "acquisition_kind": "resume_suitable",
            "status": "success",
            "found_count": 2,
            "created_count": 1,
            "updated_count": 0,
            "unchanged_count": 1,
            "error_count": 0,
            "error_code": None,
            "source_total": 2272,
            "started_at": "2026-08-27T12:00:00Z",
            "finished_at": "2026-08-27T12:02:00Z",
            "criteria_snapshot": {},
            "candidate_context_snapshot": {
                "hh_resume_external_id": "resume-hash-1",
                "hh_resume_title": "Project Manager",
            },
            "execution_snapshot": {
                "order": "publication_time",
                "max_pages": 1,
                "transport": "browser",
                "acquisition_kind": "resume_suitable",
            },
        }
        return 200, {
            "ok": True,
            "status": "success",
            "code": "ready",
            "source_total": 2272,
            "candidate_context": run["candidate_context_snapshot"],
            "search_run": run,
            "items": [],
            "hh_writes": False,
        }

    def get_vacancy_source_status(self, external_id: str) -> tuple[int, Any]:
        if self.unavailable:
            from job_search_web.hh_client import HhUnavailableError

            raise HhUnavailableError
        self.calls.append(("vacancy-source-status", external_id))
        result = getattr(self, "source_status_result", None)
        if result is not None:
            status_code, body = result
            return status_code, body
        return 200, {
            "external_id": external_id,
            "status": getattr(self, "source_status", "active"),
            "checked_at": "2026-09-03T12:00:00Z",
            "evidence": None,
            "reason": None,
            "transport_status": "available",
            "code": "ready",
            "hh_writes": False,
            "core_writes": False,
        }


class StubScoring:
    """In-memory Scoring calibration + semantic score gateway for Web facade tests."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, Any]] = []
        self.suite_id = "cal-synthetic-fixture"
        self.case_ids = ["case-001-synthetic", "case-002-synthetic"]
        self.labels: dict[str, dict[str, Any]] = {}
        self.session_index = 0
        self.unavailable = False
        self.jobs: dict[str, dict[str, Any]] = {}

    def _raise_if_unavailable(self) -> None:
        if self.unavailable:
            from job_search_web.scoring_client import ScoringUnavailableError

            raise ScoringUnavailableError

    def get_calibration_suite(self, suite_id: str) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("get_suite", suite_id))
        if suite_id != self.suite_id:
            return 404, {"detail": {"code": "suite_not_found", "message": "suite_not_found"}}
        return 200, {
            "suite_id": self.suite_id,
            "status": "awaiting_labels",
            "case_count": len(self.case_ids),
            "labeled_cases": len(self.labels),
            "labels_total": len(self.case_ids),
            "complete": len(self.labels) == len(self.case_ids),
            "missing_case_ids": [cid for cid in self.case_ids if cid not in self.labels],
            "distribution": {
                "apply": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "apply"
                ),
                "maybe": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "maybe"
                ),
                "skip": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "skip"
                ),
            },
            "expected_verdicts": ["apply", "maybe", "skip"],
            "selected_case_ids": list(self.case_ids),
            "session_index": self.session_index,
            "first_unlabeled_index": next(
                (index for index, cid in enumerate(self.case_ids) if cid not in self.labels),
                None,
            ),
            "profile_version_id": "00000000-0000-4000-8000-000000000001",
            "resume_version_id": "00000000-0000-4000-8000-000000000002",
            "candidate_context_hash": "a" * 64,
            "pool_kind": "real_hh_resume_suitable",
            "eligibility_rule_version": "real-hh-resume-suitable-v1",
            "selection_seed": 20260831,
        }

    def get_calibration_case(self, suite_id: str, case_id: str) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("get_case", suite_id, case_id))
        if suite_id != self.suite_id or case_id not in self.case_ids:
            return 404, {"detail": {"code": "case_not_found", "message": "case_not_found"}}
        index = self.case_ids.index(case_id)
        return 200, {
            "suite_id": suite_id,
            "index": index,
            "position": index + 1,
            "total": len(self.case_ids),
            "case": {
                "case_id": case_id,
                "vacancy_id": "00000000-0000-4000-8000-000000000010",
                "title": "Synthetic Backend Engineer",
                "company": "Synthetic Co",
                "description": "Synthetic vacancy description for calibration UI tests.",
                "conditions_summary": "remote · Moscow",
                "work_format": "remote",
                "salary": "250000 RUB",
                "location": "Moscow",
                "experience": "3+ years",
                "selection_stratum": "ic_it_role",
            },
            "label": self.labels.get(case_id),
            "expected_verdicts": ["apply", "maybe", "skip"],
            "labeled_cases": len(self.labels),
            "complete": len(self.labels) == len(self.case_ids),
        }

    def put_calibration_label(
        self, suite_id: str, case_id: str, payload: dict[str, Any]
    ) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("put_label", suite_id, case_id, payload))
        if suite_id != self.suite_id or case_id not in self.case_ids:
            return 404, {"detail": {"code": "case_not_found", "message": "case_not_found"}}
        verdict = str(payload.get("expected_verdict", ""))
        if verdict not in {"apply", "maybe", "skip"}:
            return 400, {"detail": {"code": "invalid_label", "message": "invalid_expected_verdict"}}
        label = {
            "case_id": case_id,
            "expected_verdict": verdict,
            "labeled_at": "2026-08-31T12:00:00+00:00",
            "label_schema_version": 1,
        }
        if payload.get("reason"):
            label["reason"] = str(payload["reason"])
        self.labels[case_id] = label
        self.session_index = min(self.case_ids.index(case_id) + 1, len(self.case_ids) - 1)
        return 200, {
            "suite_id": suite_id,
            "case_id": case_id,
            "label": label,
            "labeled_cases": len(self.labels),
            "labels_total": len(self.case_ids),
            "complete": len(self.labels) == len(self.case_ids),
            "distribution": {
                "apply": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "apply"
                ),
                "maybe": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "maybe"
                ),
                "skip": sum(
                    1 for item in self.labels.values() if item["expected_verdict"] == "skip"
                ),
            },
            "session_index": self.session_index,
            "first_unlabeled_index": next(
                (index for index, cid in enumerate(self.case_ids) if cid not in self.labels),
                None,
            ),
        }

    def put_calibration_session(self, suite_id: str, payload: dict[str, Any]) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("put_session", suite_id, payload))
        if suite_id != self.suite_id:
            return 404, {"detail": {"code": "suite_not_found", "message": "suite_not_found"}}
        index = int(payload.get("index", 0))
        if index < 0 or index >= len(self.case_ids):
            return 400, {
                "detail": {"code": "invalid_session_index", "message": "invalid_session_index"}
            }
        self.session_index = index
        return 200, {
            "suite_id": suite_id,
            "session_index": index,
            "case_id": self.case_ids[index],
        }

    def score_semantic_v1(self, vacancy_id: str) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("score_semantic_v1", vacancy_id))
        job_id = "00000000-0000-4000-8000-0000000000aa"
        self.jobs[job_id] = {
            "job_id": job_id,
            "vacancy_id": vacancy_id,
            "job_kind": "semantic_v1",
            "status": "queued",
            "assessment_id": None,
            "reused_existing": False,
            "error_code": None,
            "error_message": None,
            "diagnostic_id": None,
        }
        return 202, {
            "job_id": job_id,
            "status": "queued",
            "links": {
                "job": f"/api/v1/jobs/{job_id}",
                "result": f"/api/v1/jobs/{job_id}/result",
            },
        }

    def list_semantic_failures(self) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("list_semantic_failures",))
        return 200, {"count": 0, "items": []}

    def get_job(self, job_id: str) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("get_job", job_id))
        job = self.jobs.get(job_id)
        if job is None:
            return 404, {"detail": {"code": "job_not_found"}}
        return 200, dict(job)

    def get_scoring_state(
        self, vacancy_id: str, scoring_mode: str = "semantic_v1"
    ) -> tuple[int, Any]:
        self._raise_if_unavailable()
        self.calls.append(("get_scoring_state", vacancy_id, scoring_mode))
        return 200, {
            "vacancy_id": vacancy_id,
            "state": "never_scored",
            "scoring_mode": scoring_mode,
            "current_scoring_identity_hash": "a" * 64,
            "reusable_assessment_id": None,
            "latest_assessment_id": None,
            "stale_reason_codes": [],
        }


class WebClient:
    """Synchronous facade around HTTPX's maintained ASGI transport."""

    def __init__(
        self,
        core: StubCore,
        *,
        osint: StubOsint | None = None,
        hh: StubHh | None = None,
        scoring: StubScoring | None = None,
        live_reload: bool = False,
    ) -> None:
        """Bind requests to one Web app and synthetic Core gateway."""
        self.app = create_app(
            core,
            osint or StubOsint(),
            hh or StubHh(),
            scoring or StubScoring(),
            live_reload=live_reload,
        )

    def request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        """Send one request without opening a network socket."""

        async def send() -> httpx.Response:
            transport = httpx.ASGITransport(app=self.app)
            async with httpx.AsyncClient(transport=transport, base_url="http://web.test") as client:
                return await client.request(method, path, **kwargs)

        return anyio.run(send)
