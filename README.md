# Job Search Web

Browser vacancy board for the local job-search system. Web owns presentation
only: it talks to Core through versioned HTTP and never imports Core code,
connects to PostgreSQL, or mounts Core data volumes.

## Current status

The browser lists and creates vacancies, changes their controlled funnel status,
and records local Applications linked to existing Vacancies. The Application
journal is a tracking workflow only: it never submits to an employer or external
job platform. Loading, empty, success and error states are explicit.

## Development

Requirements: Python 3.12, `uv`, GNU Make and a running Core API.

```bash
make bootstrap
CORE_API_URL=http://127.0.0.1:8000 make dev
make test
```

Open <http://127.0.0.1:8080>. Production-like startup uses the workspace
Compose stack so the browser reaches Web and Web reaches `core:8000` internally.

## Boundaries

- Browser requests use Web's same-origin `/api/v1` facade.
- Web forwards only the public Core HTTP contract.
- Core error status and payloads are preserved.
- Transport failures become a stable `503 core_unavailable` response.
- Fixtures and examples are synthetic.

See the [vacancy board](docs/specs/vacancy-board.md) and
[Application journal](docs/specs/application-journal.md) feature specs.
