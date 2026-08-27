# Human-readable resume sync UX (R2.1.5 / US-01.3)

## User Story

```text
Как оператор,
Я хочу в обычном Web видеть понятное состояние рабочего резюме и sync,
Чтобы обновлять локальную ResumeVersion без curl/CLI и без технической модели.
```

## Implemented

- Strip «Резюме HH» shows human working-resume + content state:
  - synced → «Содержание синхронизировано» + date + **Обновить**
  - not_synced → «Содержание ещё не синхронизировано» + **Синхронизировать**
  - cleared/none → no previous snapshot treated as current
  - HH check failed + local synced → «Локальная копия сохранена» + **Повторить**
  - login/CAPTCHA/recovery → existing human CTAs (not fake synced)
- Manual sync: Web `POST /api/v1/hh/resumes/sync` → HH R2.1.3 sync → Core SoT
- After sync, UI refreshes from returned / fetched candidate-context
- Removed permanent debug copy «Локальная связь…» / UUID / hash from product strip
- No auto-sync on select; no full CV body viewer

## Non-scope

Resume history UI, snapshot editing, auto-sync, vacancy, Scoring, PDF/HTML,
SearchProfile redesign, closing Gate R2.1 as a whole (needs separate
integrated acceptance after OWNER ACCEPT of this slice).
