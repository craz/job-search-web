# Changelog

## Unreleased

- Suitable freshness-first default: «Проверить подходящие» uses `max_pages=1`
  (~50 newest SERP, create-only details). «Загрузить ещё» continues from the
  next HH page (not page 0). Live create-only counters:
  «Проверено SERP N · Уже в базе X · Новых Y · Карточек HH загружено Z из Y».

- Manual «Оценить»: handle `[data-score]` before owner-decision; set pending +
  «Ставим в очередь…» / notice «Оценка запущена…» immediately (survive list
  re-renders); re-bind live button by vacancy id; DOM regression that
  article `[data-owner-decision]` must not intercept the score button.

- Vacancy freshness UX: label «Опубликована» only when `source_published_at` is present; otherwise «Найдена» (`first_seen_at`). Never present first_seen as HH publication time.
- Suitable pagination wording: «Проверено N из M · можно загрузить ещё» when continuation remains; «дальше по HH не осталось» only when HH has no further page (not page-budget stop).

- Fix: render «Проверить обновления» (`data-refresh-content`) in expanded HH
  «Материал вакансии» detail (handler existed since r56; markup was missing).
  Align contract string with shipped Ollama unavailable UX.
  Asset cache-bust r61.

- Expanded HH vacancy detail: button «Проверить обновления» →
  `POST /api/v1/vacancies/{id}/refresh-content` (HH detail → Core ingest);
  UX: Проверяем… / Изменений нет / Вакансия обновлена /
  Вакансия недоступна на HH / Не удалось проверить.
- Suitable batch acquisition counters remain Новых / Обновлено / Уже в базе
  with create-only semantics (Обновлено normally 0).

- Suitable CAPTCHA confirm: button «Я решил CAPTCHA — проверить»; while
  challenge browser open show «Решите CAPTCHA в открытом окне HeadHunter»;
  immediate «Проверяем HeadHunter…» (no silent failures).
- Web initial load: fix `app.js` SyntaxError (`if confirmBtn)`) that aborted
  the entire bootstrap (shell stuck on «Проверяем» / «—»); bump asset cache;
  isolate HH/CAPTCHA failures via Promise.allSettled so Core/vacancies still load;
  hide live CAPTCHA operator panel for historical SearchRun when challenge is
  no longer active.
- Web self-validation: `make js-syntax` + `make js-smoke` are part of `make test`;
  intentional malformed JS fixture must fail the syntax gate; historical CAPTCHA
  copy without live recovery CTAs; CSS `[hidden]` wins over `display:grid`.
- Suitable CAPTCHA «Проверить снова»: immediate «Проверяем HeadHunter…»,
  explicit still-open / still-challenged / success messages in the captcha
  panel (no silent failures), refresh connection after clear.
- Suitable CAPTCHA recovery: enable noVNC when ``challenge_url`` is present
  (do not require a separate recovery flag); show screenshot capture error
  reason when shot failed; hide open button only for true case-C.
- Suitable CAPTCHA recovery: hide «Открыть challenge в noVNC» when
  ``challenge_url``/recovery missing; open noVNC only after
  ``browser_started`` + ``interactive_ready`` (no black empty VNC); show
  scraper screenshot label and case-C copy when capture failed.
- Suitable live progress: in-place timer/progress text updates with reserved
  elapsed width — no vacancy-queue rebuild and no layout jump on 1s/2s ticks.
- Suitable CAPTCHA handoff: «HeadHunter остановил загрузку и требует подтверждение»
  with scraper screenshot, challenge-noVNC open (not login), and «Проверить снова».
- Suitable CAPTCHA: live panel switches from «загрузка деталей» to
  «HeadHunter требует подтверждение CAPTCHA» with noVNC open + «Я вошёл —
  проверить»; historical line «остановлено: требуется CAPTCHA» (not proxy hang).
- Suitable history: failed/partial last-run wording stays past-tense when HH is
  healthy; hide previous-run error block while a live suitable run is active.
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
