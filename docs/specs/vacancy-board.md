# Vacancy board MVP

## User Story

Как пользователь системы, я хочу видеть вакансии, добавлять новые и менять их
статус в браузере, чтобы управлять поиском без ручных CLI-команд.

Как владелец поиска, я хочу вручную запустить оценку вакансии кнопкой «Оценить»,
чтобы получить semantic_v1 Assessment без массового batch и без оценки архивных
объявлений.

## Contract

Web serves one responsive board and a same-origin `/api/v1` facade. The facade
delegates list, create and status update operations to the configured Core URL.
It has no database credentials and no imported Core package.

Manual score (R2.4.1b):

- `POST /api/v1/vacancies/{vacancy_id}/score` — Core source_status gate, optional
  HH→Core refresh when status is unknown, then Scoring
  `POST /api/v1/score/semantic-v1`. Archived → `409 vacancy_archived`. Still
  unknown after refresh → `409 source_status_unknown` (`retryable: true`).
- `POST /api/v1/vacancies/{vacancy_id}/source-status/refresh` — HH→Core only.
- `GET /api/v1/score/jobs/{job_id}` — light job polling for the queue UI.
- Vacancy list continues to expose Core fields including `source_status`,
  `source_status_checked_at`, `archived_at`.

## Observable states

- loading while the initial Core request is in flight;
- empty when Core returns zero vacancies;
- success after create or status update;
- error when Core rejects a request or cannot be reached;
- «Оценить» enabled for never-scored active/unknown (unknown triggers refresh);
- «В архиве» instead of the score button when `source_status=archived`;
- existing Assessment summary hides a duplicate start button;
- in-flight «Оценивается…» / accepted «В очереди» with light job poll.
