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
    assert 'id="suitable-load-more"' in html
    assert 'id="suitable-live"' in html
    assert "suitable-live-timing" in html
    assert "Загрузить ещё" in html
    assert "1 страница HH" in html or "~50" in html
    assert "свежие сначала" in html or "новейших" in html
    assert "до 5 страниц" not in html
    assert "~250" not in html
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
    assert "startSuitableLiveWatch" in js
    assert "pollSuitableRunningProgress" in js
    assert "renderSuitableLiveFromRun" in js
    assert "renderSuitableFinalSummary" in js
    assert "Давно нет прогресса" in html
    assert "SUITABLE_POLL_MS" in js
    assert "Запущена:" in js
    assert "прошло" in html  # stable label beside #suitable-live-elapsed
    assert "updateSuitableLiveElapsed" in js
    assert "Проверено SERP" in js
    assert "Уже в базе" in js
    assert "Новых" in js
    assert "Карточек HH загружено" in js
    assert "Проверено:" in js  # terminal/history summary still uses colon form
    assert "HH предлагает" in js
    assert "SUITABLE_MAX_PAGES_PER_RUN" in js
    assert "start_page" in js
    assert "continueFromPrior" in js
    assert "Загрузить ещё" in js
    assert "можно загрузить ещё" in js
    assert "Проверено ${" in js or "Проверено " in js
    assert "дальше по HH не осталось (или достигнут конец выдачи)" not in js
    assert "SUITABLE_MAX_PAGES_PER_RUN = 1" in js
    assert "SUITABLE_MAX_PAGES_PER_RUN = 5" not in js
    assert "buildVacancyListQuery" in js
    assert "formatFirstSeen" in js
    assert "getFullYear()" in js
    assert "Опубликована" in js
    assert "Найдена" in js
    assert "vacancyFreshnessLabel" in js
    assert "source_published_at" in js
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
    assert "max_pages * 180.0" in text
    assert "180.0" in text
