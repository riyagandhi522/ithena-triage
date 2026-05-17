import json
import pytest

from models.schemas import TriageResponse
from services.response_parser import parse_llm_response


def test_valid_json_parses_correctly():
    raw = json.dumps({
        "suggestedPriority": "high",
        "suggestedCategory": "Hydraulic",
        "reasoning": "Pressure fluctuations and grinding noise indicate hydraulic failure.",
        "confidence": "high",
    })
    result = parse_llm_response(raw, "CASE-001")
    assert isinstance(result, TriageResponse)
    assert result.caseId == "CASE-001"
    assert result.suggestedPriority == "high"
    assert result.suggestedCategory == "Hydraulic"
    assert result.confidence == "high"


def test_json_wrapped_in_prose_extracts():
    raw = (
        'Here is my response: '
        '{"suggestedPriority": "medium", "suggestedCategory": "Electrical", '
        '"reasoning": "Electrical fault detected.", "confidence": "medium"} '
        'Hope that helps!'
    )
    result = parse_llm_response(raw, "CASE-002")
    assert result.suggestedPriority == "medium"
    assert result.suggestedCategory == "Electrical"


def test_completely_invalid_returns_fallback():
    result = parse_llm_response("I cannot determine this.", "CASE-003")
    assert result.caseId == "CASE-003"
    assert result.confidence == "low"
    assert result.suggestedCategory == "Unknown"
    assert result.suggestedPriority == "medium"


def test_hedging_downgrades_confidence():
    raw = json.dumps({
        "suggestedPriority": "high",
        "suggestedCategory": "Mechanical Failure",
        "reasoning": "it appears to be a mechanical issue",
        "confidence": "high",
    })
    result = parse_llm_response(raw, "CASE-004")
    assert result.confidence == "medium"


def test_no_downgrade_when_medium():
    raw = json.dumps({
        "suggestedPriority": "high",
        "suggestedCategory": "Mechanical Failure",
        "reasoning": "possibly mechanical",
        "confidence": "medium",
    })
    result = parse_llm_response(raw, "CASE-005")
    assert result.confidence == "medium"


def test_invalid_category_replaced():
    raw = json.dumps({
        "suggestedPriority": "high",
        "suggestedCategory": "pump failure",
        "reasoning": "The pump is broken.",
        "confidence": "high",
    })
    result = parse_llm_response(raw, "CASE-006")
    assert result.suggestedCategory == "Unknown"
    assert result.confidence == "low"
    assert "unrecognized" in result.reasoning or "manually" in result.reasoning


def test_invalid_priority_replaced():
    raw = json.dumps({
        "suggestedPriority": "urgent",
        "suggestedCategory": "Electrical",
        "reasoning": "There is an electrical fault.",
        "confidence": "high",
    })
    result = parse_llm_response(raw, "CASE-007")
    assert result.suggestedPriority == "medium"
    assert result.confidence == "low"
    assert "unrecognized" in result.reasoning or "manually" in result.reasoning


def test_never_raises_for_any_input():
    inputs = ["", "null", "[]", "{}", "💥🔥", "<xml>test</xml>"]
    for raw in inputs:
        try:
            result = parse_llm_response(raw, "CASE-008")
            assert isinstance(result, TriageResponse)
        except Exception as e:
            pytest.fail(f"raised {type(e).__name__} for {raw!r}: {e}")
