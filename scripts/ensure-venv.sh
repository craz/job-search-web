#!/usr/bin/env sh
set -eu

UV_LINK_MODE=copy uv sync --all-groups --frozen
