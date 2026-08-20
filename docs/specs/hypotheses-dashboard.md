# Hypotheses dashboard

## User Story

Как пользователь системы поиска работы, я хочу создавать измеримые эксперименты
и фиксировать их результат в браузере, чтобы улучшать стратегию без ручного CLI.

## Boundaries

- Web lists, creates and closes Hypotheses only through Core `/api/v1` HTTP;
- the browser generates a unique external identity and idempotency key per create;
- active cards expose result capture; completed cards display immutable evidence;
- loading, empty and failure states remain visible and accessible;
- these forms record local strategy and trigger no external action.
