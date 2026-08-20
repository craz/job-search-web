"""Web boundary schemas independent from Core implementation modules."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class VacancyCreate(BaseModel):
    """Browser-submitted vacancy fields forwarded to Core."""

    company_name: str = Field(min_length=1, max_length=255)
    company_external_id: str = Field(min_length=1, max_length=255)
    source: str = Field(min_length=1, max_length=64)
    external_id: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=500)
    url: HttpUrl
    description: str | None = None


class VacancyStatusUpdate(BaseModel):
    """Browser-requested controlled funnel state."""

    status: str = Field(pattern="^(new|reviewing|rejected|shortlisted)$")


class ApplicationCreate(BaseModel):
    """Browser-submitted local Application fields forwarded to Core."""

    vacancy_id: UUID
    source: str = Field(min_length=1, max_length=64)
    external_id: str = Field(min_length=1, max_length=255)
    applied_at: datetime | None = None
    resume_version: str | None = Field(default=None, max_length=255)
    cover_letter_version: str | None = Field(default=None, max_length=255)
    cover_letter_text: str | None = None
    result: str | None = Field(default=None, pattern="^(reply|interview|rejected|offer)$")
    next_action: str | None = Field(default=None, max_length=500)
    next_action_at: datetime | None = None
