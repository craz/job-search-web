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
    """Browser-requested intended channel/next action (R3.0/R4.2; no Application create)."""

    action_channel: str | None = Field(default=None, pattern="^(hh|direct|both)$")
    next_action: str | None = Field(default=None, max_length=500)
    next_action_at: datetime | None = None
    next_action_done: bool | None = None
    clear_action_channel: bool = False
    clear_next_action: bool = False
    clear_next_action_at: bool = False


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


class DirectOutreachCreate(BaseModel):
    """Browser-submitted owner-reported contact fact (R3.2; no external send)."""

    vacancy_id: UUID
    person_id: UUID
    method: str = Field(pattern="^(email|linkedin|telegram|phone|other)$")
    occurred_at: datetime | None = None
    note: str | None = Field(default=None, max_length=2000)
    url: HttpUrl | None = None


class EmployerResponseCreate(BaseModel):
    """Browser-submitted employer reply fact (R3.3; no external send)."""

    vacancy_id: UUID
    source: str = Field(pattern="^(hh|direct)$")
    response_type: str = Field(
        pattern=(
            "^(replied|invitation|rejection|question|interview_request|"
            "test_task|no_response|other)$"
        )
    )
    occurred_at: datetime | None = None
    note: str | None = Field(default=None, max_length=2000)
    application_id: UUID | None = None
    direct_outreach_id: UUID | None = None
    person_id: UUID | None = None


class HiringProcessCreate(BaseModel):
    """Browser-submitted explicit hiring process start (R4.0)."""

    vacancy_id: UUID
    initial_stage: str | None = Field(
        default=None,
        pattern="^(screening|interview|test_task|final_interview|other)$",
    )
    started_at: datetime | None = None
    note: str | None = Field(default=None, max_length=2000)


class HiringStageTransition(BaseModel):
    """Browser-submitted hiring stage change."""

    stage: str = Field(pattern="^(screening|interview|test_task|final_interview|other)$")
    occurred_at: datetime | None = None
    note: str | None = Field(default=None, max_length=2000)


class HiringProcessStatusUpdate(BaseModel):
    """Browser-submitted hiring process status change."""

    status: str = Field(pattern="^(active|completed|cancelled)$")


class HiringActivityCreate(BaseModel):
    """Browser-submitted hiring activity (R4.1)."""

    activity_type: str = Field(pattern="^(screening|interview|test_task|other)$")
    status: str | None = Field(default=None, pattern="^(planned|completed|cancelled)$")
    title: str | None = Field(default=None, max_length=500)
    scheduled_at: datetime | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None
    participant: str | None = Field(default=None, max_length=500)
    person_id: UUID | None = None
    note: str | None = Field(default=None, max_length=2000)
    result: str | None = Field(default=None, max_length=2000)
    url: HttpUrl | None = None


class HiringActivityUpdate(BaseModel):
    """Browser-submitted hiring activity update."""

    activity_type: str | None = Field(
        default=None, pattern="^(screening|interview|test_task|other)$"
    )
    status: str | None = Field(default=None, pattern="^(planned|completed|cancelled)$")
    title: str | None = Field(default=None, max_length=500)
    scheduled_at: datetime | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None
    participant: str | None = Field(default=None, max_length=500)
    person_id: UUID | None = None
    note: str | None = Field(default=None, max_length=2000)
    result: str | None = Field(default=None, max_length=2000)
    url: HttpUrl | None = None


class OfferCreate(BaseModel):
    """Browser-submitted Offer (R5.0)."""

    hiring_process_id: UUID
    received_at: datetime | None = None
    position_title: str | None = Field(default=None, max_length=500)
    compensation_amount: int | None = Field(default=None, ge=0)
    compensation_currency: str | None = Field(default=None, max_length=16)
    compensation_basis: str | None = Field(default=None, pattern="^(gross|net|unknown)$")
    work_format: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=500)
    bonus_text: str | None = Field(default=None, max_length=2000)
    benefits_text: str | None = Field(default=None, max_length=2000)
    proposed_start_date: date | None = None
    note: str | None = Field(default=None, max_length=2000)


class OfferDecisionUpdate(BaseModel):
    """Browser-submitted Offer accept/decline."""

    status: str = Field(pattern="^(accepted|declined)$")
    decided_at: datetime | None = None
    decision_note: str | None = Field(default=None, max_length=2000)


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
