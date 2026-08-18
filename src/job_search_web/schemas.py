"""Web boundary schemas independent from Core implementation modules."""

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
