"""Contract checks for Vacancy row UI (R2.2.5 temporal + hierarchy)."""

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
