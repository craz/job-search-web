FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

WORKDIR /app
COPY requirements.runtime.txt ./
RUN python -m pip install --root-user-action=ignore --no-cache-dir --require-hashes \
    -r requirements.runtime.txt
COPY src ./src

EXPOSE 8080
CMD ["uvicorn", "job_search_web.app:app", "--host", "0.0.0.0", "--port", "8080"]
