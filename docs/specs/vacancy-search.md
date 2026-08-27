# Vacancy search Web surface (R2.2.5)

## User Story

```text
Как пользователь workspace «Вакансии»,
Я хочу задать критерии поиска и вручную найти вакансии на HH,
Чтобы увидеть человеческий итог SearchRun и обновлённый список без CLI.
```

## UX

Compact search area above the existing Vacancy list (same workspace, no new top-level nav):

1. Human search criteria form (persisted SearchProfile)
2. Primary CTA «Найти вакансии»
3. Last-run human summary
4. Existing Vacancy list (refreshed after run)

## Contract

- Web → Core: `GET/POST/PATCH /api/v1/search-profiles`, `GET /api/v1/search-runs`
- Web → HH: `POST /api/v1/hh/vacancies/search` → HH `POST /api/v1/vacancies/search`
- Default execution: `max_pages=1` (no page_size)
- HH proxy timeout: **180s** (measured live R2.2.4 ~151s for max_pages=1)

## Non-scope

Scoring, auto-search, multi-profile manager, R2.2.A, R2.3, async job queue.
