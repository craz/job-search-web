# Changelog

## Unreleased

- Suitable live progress: started/elapsed timer, HH page + checked counts from
  SearchRun.progress polling, stuck warning, reload restore, final duration summary.
- Localize vacancy scoring decision card labels/enums/actions to Russian; raw
  codes and model stay under muted «Технические детали».
- Vacancy Разбор shows structured Assessment decision card; non-authoritative relevance_score is muted and no longer treated as the verdict explanation.

- Bulk «Оценить новые»: enqueue budget is new jobs only — already-queued ids are
  skipped so a second click advances the remainder («Поставлено N из M»).
- Suitable vacancy check paginates up to 5 HH pages (~250) per run with explicit
  «Загрузить ещё» continuation (`start_page`), progress «Загружено X из Y», and
  scaled HH proxy timeout. No silent first-page-only behavior.
- R2.4.1b: vacancy list «Оценить» action with Web orchestration
  `POST /api/v1/vacancies/{id}/score` (source_status gate + HH refresh + Scoring
  semantic-v1 enqueue), optional source-status refresh, and light job polling.
  No real LLM calls in Web tests.
- R2.3.6.1: add blind owner calibration labeling page `/calibration` that proxies
  Scoring calibration HTTP and persists labels into the canonical private suite
  store (`apply` / `maybe` / `skip`).
- R2.2.5 corrected: primary «Подходящие вакансии» via
  `POST /api/v1/hh/vacancies/suitable`; «Получена» from `first_seen_at`;
  default sort newest-first; deferred «Свой поиск»; local list filter.
- Add a Core-backed normalized Assessments dashboard and manual contract form.
- Add a Core-backed Hypotheses dashboard with experiment creation and result capture.
- Add a Core-backed confirmed People dashboard with local contact statuses and no
  automated OSINT or messaging behavior.
- Add a Core-backed Daily Metrics summary, bounded history and dated update form.
- Add opt-in dev asset revision polling and no-store responses so an open browser
  refreshes after local Web changes.
- Add a Core-backed Application journal and browser flow for recording local
  application facts without external submission.
- Add the first browser vacancy board backed exclusively by Core `/api/v1`.
