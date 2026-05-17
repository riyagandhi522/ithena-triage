# Route handler only — all business logic lives in /services

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.schemas import TriageRequest, TriageErrorResponse
from services.llm_client import get_triage_suggestion

router = APIRouter()


@router.post("/api/triage")
async def triage(case: TriageRequest):
    try:
        result = await get_triage_suggestion(case)
        return result
    except Exception as exc:
        print(f"[api/triage] unhandled error for {case.caseId}: {exc}")
        error = TriageErrorResponse(
            caseId=case.caseId,
            error="Triage service encountered an unexpected error.",
        )
        return JSONResponse(status_code=500, content=error.model_dump())
