from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


Priority = Literal["low", "medium", "high", "critical"]
Category = Literal[
    "Mechanical Failure",
    "Electrical",
    "Hydraulic",
    "Software/Controls",
    "Preventive Maintenance",
    "Unknown",
]
Confidence = Literal["low", "medium", "high"]


class TriageRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    caseId: str = Field(min_length=1)
    machineType: str = Field(min_length=1)
    description: str = Field(min_length=1, max_length=2000)
    submittedAt: datetime


class TriageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    caseId: str
    suggestedPriority: Priority
    suggestedCategory: Category
    reasoning: str
    confidence: Confidence


class TriageErrorResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    caseId: str
    error: str
    fallback: bool = True
