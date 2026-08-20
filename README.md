# Job Search Web

Browser vacancy board for the local job-search system. Web owns presentation
only: it talks to Core through versioned HTTP and never imports Core code,
connects to PostgreSQL, or mounts Core data volumes.

## Current status

The browser lists and creates vacancies, changes their controlled funnel status,
records local Applications linked to existing Vacancies, displays/updates
Core-owned Daily Metrics, tracks confirmed people connected to a company and
manages measurable search Hypotheses. Hypothesis results are local evidence;
vacancy. Application and contact statuses are local tracking workflows only:
the Web service never submits to an employer, starts OSINT, or sends a message.
Loading, empty, success and error states are explicit.

## Development

Requirements: Python 3.12, `uv`, GNU Make and a running Core API.

```bash
make bootstrap
CORE_API_URL=http://127.0.0.1:8000 make dev
make test
```

Open <http://127.0.0.1:8080>. Production-like startup uses the workspace
Compose stack so the browser reaches Web and Web reaches `core:8000` internally.
The workspace development stack mounts source read-only, reloads Uvicorn and
refreshes an already open browser page when static assets change. This behavior
is enabled only by `WEB_LIVE_RELOAD=1`; packaged standalone startup keeps normal
asset caching and no polling dependency.

## Boundaries

- Browser requests use Web's same-origin `/api/v1` facade.
- Web forwards only the public Core HTTP contract.
- Core error status and payloads are preserved.
- Transport failures become a stable `503 core_unavailable` response.
- Fixtures and examples are synthetic.

See the [vacancy board](docs/specs/vacancy-board.md) and
[Application journal](docs/specs/application-journal.md) and
[Daily Metrics dashboard](docs/specs/metrics-dashboard.md) and
[People dashboard](docs/specs/people-dashboard.md) feature specs.
