"""Published Web boundary and repository-isolation checks."""

from pathlib import Path

from tests.support import StubCore

from job_search_web.app import create_app


def test_openapi_publishes_vacancy_facade() -> None:
    """Browser operations remain discoverable as one versioned facade."""
    paths = create_app(StubCore()).openapi()["paths"]

    assert {"get", "post"} <= paths["/api/v1/vacancies"].keys()
    assert "patch" in paths["/api/v1/vacancies/{vacancy_id}"]


def test_web_source_does_not_import_core_or_database_drivers() -> None:
    """Repository boundaries remain mechanically visible in source imports."""
    source_root = Path(__file__).parents[2] / "src"
    source = "\n".join(path.read_text() for path in source_root.rglob("*.py"))

    assert "job_search_core" not in source
    assert "sqlalchemy" not in source
    assert "psycopg" not in source
