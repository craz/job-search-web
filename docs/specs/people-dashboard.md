# People dashboard

## User Story

Как пользователь системы поиска работы, я хочу добавлять подтверждённые контакты
к компаниям и вакансиям и менять их локальный статус, чтобы управлять referral и
коммуникационным workflow с Web-даша.

Web proxies `GET/POST /api/v1/people` and `PATCH /api/v1/people/{id}` only
through Core HTTP. It does not run OSINT, retain provider payloads or send
messages. The `contacted` status is local tracking, not delivery evidence.
