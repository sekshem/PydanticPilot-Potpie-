from typing import List, Literal, Optional
from pydantic import BaseModel, Field, UUID4, field_validator


OutputFormat = Literal["plan", "checklist", "email", "summary_actions"]
Tone = Literal["professional", "friendly", "strict"]


class AgentRunRequest(BaseModel):
    goal: str = Field(..., min_length=1, description="User goal or objective")
    context: Optional[str] = Field(None, description="Optional context or background")
    outputFormat: OutputFormat
    tone: Tone
    constraints: Optional[List[str]] = Field(
        default=None, description="Optional list of constraints"
    )

    @field_validator("constraints")
    @classmethod
    def validate_constraints(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        if not all(isinstance(item, str) for item in v):
            raise ValueError("constraints must be a list of strings")
        return v


class AgentSection(BaseModel):
    heading: str
    content: List[str]


class AgentRunResponse(BaseModel):
    runId: UUID4
    status: Literal["success", "error"]
    title: str
    summary: str
    sections: List[AgentSection]
    warnings: Optional[List[str]] = None
    confidence: float = 0.0
    createdAt: str


class ErrorResponse(BaseModel):
    message: str
    code: str
