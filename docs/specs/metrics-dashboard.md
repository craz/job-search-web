# Daily Metrics dashboard

## User Story

Как пользователь системы поиска работы, я хочу видеть и обновлять дневные
показатели на Web-даше, чтобы оценивать темп поиска без Swagger или CLI.

## Contract

Web exposes a same-origin `GET /api/v1/metrics` facade and
`PUT /api/v1/metrics/{date}` with mandatory `Idempotency-Key`. It forwards only
validated non-negative counters and notes to Core. Web does not query PostgreSQL,
derive provider facts or mutate Applications.

## Observable states

- summary cards for the newest dated snapshot;
- bounded history ordered by Core;
- empty state before the first snapshot;
- disabled form while a write is in flight;
- stable Core validation/transport errors;
- automatic refresh after a successful write.

## Out of scope

- conversion analytics or inferred counters;
- provider synchronization;
- editing historical request provenance;
- charting libraries or a Web-owned metrics database.
