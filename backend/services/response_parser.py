import json

from models.schemas import TriageResponse

_VALID_PRIORITIES = {"low", "medium", "high", "critical"}
_VALID_CATEGORIES = {
    "Mechanical Failure",
    "Electrical",
    "Hydraulic",
    "Software/Controls",
    "Preventive Maintenance",
    "Unknown",
}
_VALID_CONFIDENCES = {"low", "medium", "high"}

_HEDGING_WORDS = [
    "possibly",
    "unclear",
    "uncertain",
    "it appears",
    "might",
    "not sure",
    "insufficient",
    "hard to determine",
]


def _fallback(case_id: str) -> TriageResponse:
    return TriageResponse(
        caseId=case_id,
        suggestedPriority="medium",
        suggestedCategory="Unknown",
        reasoning="AI could not determine triage — manual review required",
        confidence="low",
    )


def _unrecognized_fallback(case_id: str) -> TriageResponse:
    return TriageResponse(
        caseId=case_id,
        suggestedPriority="medium",
        suggestedCategory="Unknown",
        reasoning="AI returned an unrecognized value — please assign priority and category manually",
        confidence="low",
    )


def parse_llm_response(raw: str, case_id: str) -> TriageResponse:
    # Step 1: direct parse
    data = None
    try:
        data = json.loads(raw)
    except Exception:
        pass

    # Step 2: bracket-depth scan — handles markdown fences and { or } inside strings
    if data is None:
        start = raw.find("{")
        if start != -1:
            depth = 0
            for i, ch in enumerate(raw[start:], start):
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        try:
                            data = json.loads(raw[start : i + 1])
                        except Exception:
                            pass
                        break

    # Step 3: still nothing — return safe fallback
    if not isinstance(data, dict):
        return _fallback(case_id)

    # Step 4: validate each field, replace invalid values with fallback
    priority = data.get("suggestedPriority", "medium")
    category = data.get("suggestedCategory", "Unknown")

    if priority not in _VALID_PRIORITIES or category not in _VALID_CATEGORIES:
        return _unrecognized_fallback(case_id)

    confidence = data.get("confidence", "low")
    if confidence not in _VALID_CONFIDENCES:
        confidence = "low"

    reasoning = data.get("reasoning", "")
    if not isinstance(reasoning, str):
        reasoning = str(reasoning) if reasoning is not None else ""

    # Step 5: confidence calibration — hedge + high → medium
    if confidence == "high":
        lower = reasoning.lower()
        if any(word in lower for word in _HEDGING_WORDS):
            confidence = "medium"

    # Step 6: return validated response
    return TriageResponse(
        caseId=case_id,
        suggestedPriority=priority,
        suggestedCategory=category,
        reasoning=reasoning,
        confidence=confidence,
    )
