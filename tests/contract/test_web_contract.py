"""Published Web boundary and repository-isolation checks."""

from pathlib import Path

from tests.support import StubCore, StubHh, StubOsint

from job_search_web.app import create_app


def test_openapi_publishes_vacancy_facade() -> None:
    """Browser operations remain discoverable as one versioned facade."""
    paths = create_app(StubCore(), StubOsint(), StubHh()).openapi()["paths"]

    assert {"get", "post"} <= paths["/api/v1/vacancies"].keys()
    assert "patch" in paths["/api/v1/vacancies/{vacancy_id}"]
    assert {"get", "post"} <= paths["/api/v1/applications"].keys()
    assert "get" in paths["/api/v1/metrics"]
    assert "put" in paths["/api/v1/metrics/{metric_date}"]
    assert {"get", "post"} <= paths["/api/v1/people"].keys()
    assert "patch" in paths["/api/v1/people/{person_id}"]
    assert {"get", "post"} <= paths["/api/v1/hypotheses"].keys()
    assert "post" in paths["/api/v1/hypotheses/{hypothesis_id}/close"]
    assert {"get", "post"} <= paths["/api/v1/assessments"].keys()
    assert "get" in paths["/api/v1/osint/people-proposals"]
    assert "post" in paths["/api/v1/osint/people-research"]
    assert "post" in paths["/api/v1/osint/people-confirm"]
    assert "get" in paths["/api/v1/osint/vacancy-mirrors"]
    assert "post" in paths["/api/v1/osint/vacancy-mirrors"]
    assert "get" in paths["/api/v1/hh/connection"]
    assert "get" in paths["/api/v1/hh/account"]
    assert "get" in paths["/api/v1/hh/resumes"]
    assert "put" in paths["/api/v1/hh/resumes/active"]
    assert "get" in paths["/api/v1/candidate-context"]
    assert "post" in paths["/api/v1/hh/connection/open-login"]
    assert "post" in paths["/api/v1/hh/connection/confirm"]


def test_web_source_does_not_import_core_or_database_drivers() -> None:
    """Repository boundaries remain mechanically visible in source imports."""
    source_root = Path(__file__).parents[2] / "src"
    source = "\n".join(path.read_text() for path in source_root.rglob("*.py"))

    assert "job_search_core" not in source
    assert "sqlalchemy" not in source
    assert "psycopg" not in source
