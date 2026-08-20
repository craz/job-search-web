# People dashboard

## User Story

Как пользователь системы поиска работы, я хочу добавлять подтверждённые контакты
к компаниям и вакансиям и менять их локальный статус, чтобы управлять referral и
коммуникационным workflow с Web-даша.

Confirmed people still use `GET/POST /api/v1/people` and
`PATCH /api/v1/people/{id}` through Core HTTP.

Vacancy cards separately read normalized proposals from OSINT. When a confirmed
company website exists, the user can start a bounded search and see proposed
name, title, evidence excerpt, source URL and observation time. These results
are visibly marked `не проверено`, stay outside Core and never trigger a message.
The same card can start a vacancy-mirror search and show career-page URLs with
score and reasons, also marked unverified and never written to Core.
OSINT loading or failure cannot make Core vacancy data unavailable.
