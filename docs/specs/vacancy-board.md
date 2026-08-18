# Vacancy board MVP

## User Story

Как пользователь системы, я хочу видеть вакансии, добавлять новые и менять их
статус в браузере, чтобы управлять поиском без ручных CLI-команд.

## Contract

Web serves one responsive board and a same-origin `/api/v1` facade. The facade
delegates list, create and status update operations to the configured Core URL.
It has no database credentials and no imported Core package.

## Observable states

- loading while the initial Core request is in flight;
- empty when Core returns zero vacancies;
- success after create or status update;
- error when Core rejects a request or cannot be reached.
