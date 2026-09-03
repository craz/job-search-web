"""Contract checks for Vacancy row UI (R2.2.5 temporal + hierarchy + R2.4.1b score)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STATIC = ROOT / "src" / "job_search_web" / "static"


def test_format_first_seen_includes_full_year() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "function formatFirstSeen" in js
    assert "getFullYear()" in js
    assert (
        "сегодня"
        not in js[js.index("function formatFirstSeen") : js.index("function formatJournalDate")]
    )


def test_vacancy_workflow_badge_tokens() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    css = (STATIC / "styles.css").read_text(encoding="utf-8")
    assert 'new: "accent"' in js
    assert 'reviewing: "info"' in js
    assert 'shortlisted: "success"' in js
    assert 'rejected: "danger"' in js
    assert ".badge--accent" in css


def test_osint_section_requires_company_website_url() -> None:
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "item.company.website_url" in js
    assert 'detailParts.push("OSINT и зеркала")' in js
    assert "if (item.company.website_url || evidenceCount)" in js


def test_vacancy_list_hierarchy_styles_present() -> None:
    css = (STATIC / "styles.css").read_text(encoding="utf-8")
    assert ".vacancy-list .list-row__title" in css
    assert ".vacancy-list .list-row__meta" in css
    assert ".list-row-group--vacancy" in css


def test_score_action_mapping_strings_present() -> None:
    """R2.4.1b/R2.4.3a: Оценить / Повторить оценку mapping and in-flight labels."""
    js = (STATIC / "app.js").read_text(encoding="utf-8")
    assert "function vacancyScoreActionHtml" in js
    assert 'data-score type="button">Оценить</button>' in js
    assert 'data-score-retry="1" type="button">Повторить оценку</button>' in js
    assert 'data-score-state="archived">В архиве</span>' in js
    assert "Оценивается…" in js
    assert "В очереди" in js
    assert "/api/v1/vacancies/${vacancyId}/score" in js
    assert "/api/v1/semantic-failures" in js
    assert "vacancy_archived" in js
    assert "source_status_unknown" in js
    assert "function vacancySourceSignalsHtml" in js
    assert 'active: "На источнике"' in js
    assert 'archived: "В архиве"' in js
    assert 'unknown: "Статус неизвестен"' in js
    assert "старше 14 дн." in js
    # Score CTA sits next to application recording in list-row__actions.
    score_idx = js.index("vacancyScoreActionHtml(item, assessment, failure)")
    apply_idx = js.index('data-apply type="button">Записать отклик</button>')
    assert score_idx < apply_idx
