import asyncio
import os

from google import genai
from google.genai import types
from google.api_core import exceptions as google_exc

from models.schemas import TriageRequest, TriageResponse
from services.prompt_builder import build_triage_prompt
from services.response_parser import parse_llm_response

_MODEL = "gemini-2.5-flash"
_MAX_TOKENS = 500

_SERVICE_FALLBACK_REASONING = (
    "AI service temporarily unavailable — please triage manually"
)


def _service_fallback(case_id: str) -> TriageResponse:
    return TriageResponse(
        caseId=case_id,
        suggestedPriority="medium",
        suggestedCategory="Unknown",
        reasoning=_SERVICE_FALLBACK_REASONING,
        confidence="low",
    )


async def get_triage_suggestion(case: TriageRequest) -> TriageResponse:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    system_prompt, user_prompt = build_triage_prompt(case)

    config = types.GenerateContentConfig(
        system_instruction=system_prompt,
        temperature=0,
        max_output_tokens=_MAX_TOKENS,
    )

    last_exc: Exception | None = None
    for attempt in range(2):
        try:
            response = await client.aio.models.generate_content(
                model=_MODEL,
                contents=user_prompt,
                config=config,
            )
            raw = response.text
            return parse_llm_response(raw, case.caseId)

        except (google_exc.DeadlineExceeded, google_exc.ResourceExhausted) as exc:
            last_exc = exc
            if attempt == 0:
                await asyncio.sleep(2)

        except google_exc.ServiceUnavailable as exc:
            last_exc = exc
            if attempt == 0:
                await asyncio.sleep(1)

        except Exception as exc:
            print(f"[llm_client] unexpected error: {exc}")
            return _service_fallback(case.caseId)

    print(f"[llm_client] all retries exhausted: {last_exc}")
    return _service_fallback(case.caseId)
