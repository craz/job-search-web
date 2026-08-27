"""Contract checks for vacancy search UI + proxy surface (R2.2.5)."""

from __future__ import annotations

from pathlib import Path

from tests.support import StubCore, StubHh, StubOsint

from job_search_web.app import create_app

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"


def test_openapi_publishes_search_and_hh_search_routes() -> None:
    paths = create_app(StubCore(), StubOsint(), StubHh()).openapi()["paths"]
    assert "get" in paths["/api/v1/search-profiles"]
    assert "post" in paths["/api/v1/search-profiles"]
    assert "patch" in paths["/api/v1/search-profiles/{profile_id}"]
    assert "get" in paths["/api/v1/search-runs"]
    assert "post" in paths["/api/v1/hh/vacancies/search"]


def test_vacancies_page_exposes_human_search_controls() -> None:
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    assert "Поиск вакансий" in html
    assert "Найти вакансии" in html
    assert 'id="vacancy-search-form"' in html
    assert 'id="search-text"' in html
    assert 'id="search-area"' in html
    assert 'id="search-salary-from"' in html
    assert 'id="search-only-salary"' in html
    assert "page_size" not in html
    assert "criteria_snapshot" not in html
    assert "execution_snapshot" not in html


def test_app_js_uses_hh_search_proxy_not_browser_provider() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "/api/v1/hh/vacancies/search" in js
    assert "Ищем вакансии" in js
    assert "Новых:" in js
    assert "Уже были:" in js
    assert "Поиск завершён не полностью" in js
    assert "Нужно войти в HeadHunter" in js
    assert "HeadHunter требует действие в браузере" in js
    assert "acquire_vacancies" not in js
    assert "BrowserHhVacancyProvider" not in js


def test_hh_client_search_uses_long_timeout() -> None:
    text = (ROOT / "src" / "job_search_web" / "hh_client.py").read_text(encoding="utf-8")
    assert "vacancies/search" in text
    assert "180.0" in text
