"""Web boundary schemas independent from Core implementation modules."""

from datetime import date, datetime
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


class VacancyOwnerDecisionUpdate(BaseModel):
    """Browser-requested owner review decision (distinct from AI verdict)."""

    owner_decision: str = Field(pattern="^(unreviewed|interested|deferred|skipped|applied)$")


class VacancyActionPlanUpdate(BaseModel):
    """Browser-requested intended channel/next action (R3.0; no Application create)."""

    action_channel: str | None = Field(default=None, pattern="^(hh|direct|both)$")
    next_action: str | None = Field(default=None, max_length=500)
    next_action_at: datetime | None = None
    next_action_done: bool | None = None
    clear_action_channel: bool = False
    clear_next_action: bool = False


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


class DailyMetricUpdate(BaseModel):
    """Browser-submitted partial Daily Metric snapshot forwarded to Core."""

    metric_date: date
    views_total: int | None = Field(default=None, ge=0)
    views_new: int | None = Field(default=None, ge=0)
    applications: int | None = Field(default=None, ge=0)
    replies: int | None = Field(default=None, ge=0)
    invitations: int | None = Field(default=None, ge=0)
    rejections: int | None = Field(default=None, ge=0)
    notes: str | None = Field(default=None, max_length=4000)


class PersonCreate(BaseModel):
    """Browser-submitted confirmed contact forwarded to Core."""

    company_id: UUID
    vacancy_id: UUID | None = None
    source: str = Field(min_length=1, max_length=64)
    external_id: str = Field(min_length=1, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(pattern="^(hiring_manager|recruiter|referral|peer)$")
    title: str | None = Field(default=None, max_length=500)
    url: HttpUrl | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    notes: str | None = Field(default=None, max_length=4000)


class PersonStatusUpdate(BaseModel):
    """Browser-requested controlled local contact workflow state."""

    status: str = Field(pattern="^(new|researching|contacted|replied|dropped)$")


class PeopleResearchRequest(BaseModel):
    """Browser-triggered bounded research request sent to OSINT."""

    company_id: UUID
    vacancy_id: UUID
    company_name: str = Field(min_length=1, max_length=255)
    website_url: HttpUrl


class PeopleConfirmRequest(BaseModel):
    """Browser-triggered promotion of one proposed contact through OSINT."""

    report_id: str = Field(min_length=1, max_length=128)
    person_id: str = Field(min_length=1, max_length=128)


class VacancyMirrorRequest(BaseModel):
    """Browser-triggered bounded vacancy-mirror search sent to OSINT."""

    company_id: UUID
    vacancy_id: UUID
    company_name: str = Field(min_length=1, max_length=255)
    website_url: HttpUrl
    vacancy_title: str = Field(min_length=1, max_length=500)


class HypothesisCreate(BaseModel):
    """Browser-submitted measurable experiment forwarded to Core."""

    source: str = Field(min_length=1, max_length=64)
    external_id: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=4000)
    test_size: int | None = Field(default=None, gt=0)
    metric: str | None = Field(default=None, max_length=500)


class HypothesisClose(BaseModel):
    """Browser-submitted observed result for an active experiment."""

    result: str = Field(min_length=1, max_length=4000)


class AssessmentCreate(BaseModel):
    """Browser-submitted normalized scoring result forwarded to Core."""

    vacancy_id: UUID
    source: str = Field(min_length=1, max_length=64)
    external_id: str = Field(min_length=1, max_length=255)
    relevance_score: int = Field(ge=0, le=100)
    verdict: str = Field(pattern="^(apply|maybe|skip)$")
    reason: str = Field(min_length=1, max_length=4000)
    risk: str | None = Field(default=None, max_length=4000)
    action: str = Field(min_length=1, max_length=1000)
    model: str = Field(min_length=1, max_length=255)
    prompt_version: str = Field(min_length=1, max_length=255)
    assessed_at: datetime
