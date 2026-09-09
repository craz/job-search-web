"""Contract checks for vacancy search UI + proxy surface (R2.2.5)."""

from __future__ import annotations

from pathlib import Path

from tests.support import StubCore, StubHh, StubOsint

from job_search_web.app import create_app

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"


def test_openapi_publishes_suitable_and_manual_search_routes() -> None:
    paths = create_app(StubCore(), StubOsint(), StubHh()).openapi()["paths"]
    assert "get" in paths["/api/v1/search-profiles"]
    assert "get" in paths["/api/v1/search-runs"]
    assert "post" in paths["/api/v1/hh/vacancies/suitable"]
    assert "post" in paths["/api/v1/hh/vacancies/search"]


def test_vacancies_page_exposes_primary_suitable_controls() -> None:
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    assert "Подходящие вакансии" in html
    assert "Проверить подходящие" in html
    assert 'id="suitable-run"' in html
    assert "Рабочее резюме" in html
    assert "HH предлагает" in html
    assert "Свой поиск" in html
    assert "Фильтры очереди" in html
    assert 'id="vacancy-filter-text"' in html
    assert 'id="vacancy-filter-verdict"' in html
    assert "Только с зарплатой" not in html
    assert 'id="vacancy-search-form"' not in html
    assert 'id="search-text"' not in html
    assert "page_size" not in html
    assert "criteria_snapshot" not in html
    assert "execution_snapshot" not in html
    assert "Не запускает импорт" in html or "не запускает импорт" in html


def test_app_js_uses_suitable_proxy_and_local_filter() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    assert "/api/v1/hh/vacancies/suitable" in js
    assert "Проверяем подходящие вакансии" in js
    assert "Проверено:" in js
    assert "Новых:" in js
    assert "Уже в базе:" in js
    assert "HH предлагает" in js
    assert "buildVacancyListQuery" in js
    assert "formatFirstSeen" in js
    assert "getFullYear()" in js
    assert "Опубликована:" in js
    assert "buildVacancyListQuery" in js
    assert "vacancy-filter-verdict" in html
    assert "vacancy-pagination" in html
    assert "Опубликовано" not in js
    assert "resume_search_page_mismatch" in js
    assert "Нужно войти в HeadHunter" in js
    assert "HeadHunter требует действие в браузере" in js
    assert "acquire_vacancies" not in js
    assert "BrowserHhVacancyProvider" not in js
    assert "Только с зарплатой" not in js


def test_hh_client_suitable_uses_long_timeout() -> None:
    text = (ROOT / "src" / "job_search_web" / "hh_client.py").read_text(encoding="utf-8")
    assert "vacancies/suitable" in text
    assert "180.0" in text
