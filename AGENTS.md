# Development agent instructions

1. Read README and feature specs before non-trivial changes.
2. Web consumes Core only through versioned HTTP; never import Core or access PostgreSQL.
3. Write a User Story and executable Gherkin scenario before user-facing behavior.
4. Keep loading, empty, success and error states accessible and testable.
5. Use synthetic fixtures and never commit secrets or private history.
6. Run `make test` and the relevant container/browser smoke before completion.
7. Commit only a completed green logical step; never push unless explicitly requested.
