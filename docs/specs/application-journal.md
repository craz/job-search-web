# Application journal

## User Story

Как пользователь системы поиска работы, я хочу зарегистрировать отклик из
карточки вакансии и увидеть его в журнале, чтобы вести воронку без Swagger или
CLI.

## Contract

Web publishes same-origin `GET /api/v1/applications` and
`POST /api/v1/applications` endpoints. Both delegate exclusively to the public
Core HTTP contract. Creation requires an `Idempotency-Key`; Web does not send an
external application or infer that HeadHunter accepted one.

The browser creates an Application for a selected existing Vacancy. Source,
application time, resume version, cover-letter text and next action are optional
workflow metadata; the generated external identity represents only this local
record.

## Observable states

- loading while vacancies and Applications are requested from Core;
- empty journal before the first Application is recorded;
- success after an Application is persisted and displayed with its Vacancy;
- error when Core rejects a request or cannot be reached;
- disabled submission while one create request is in flight.

## Out of scope

- sending an application to HH or any other external system;
- editing results or next actions after creation;
- Daily Metrics and conversion reporting.
