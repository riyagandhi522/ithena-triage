from datetime import datetime, timezone
from models.schemas import TriageRequest
from services.prompt_builder import build_triage_prompt


def _make_case(**overrides) -> TriageRequest:
    defaults = {
        "caseId": "TEST-001",
        "machineType": "Industrial Hydraulic Pump",
        "description": "Pump making loud grinding noise since morning shift start.",
        "submittedAt": datetime(2024, 3, 5, 14, 30, 0, tzinfo=timezone.utc),  # Tuesday 02:30 PM
    }
    return TriageRequest(**(defaults | overrides))


def test_system_prompt_contains_all_priority_definitions():
    system, _ = build_triage_prompt(_make_case())
    assert "production stoppage" in system
    assert "same-day response" in system
    assert "within 24 hours" in system
    assert "scheduled maintenance" in system


def test_system_prompt_contains_all_categories():
    system, _ = build_triage_prompt(_make_case())
    assert "Mechanical Failure" in system
    assert "Electrical" in system
    assert "Hydraulic" in system
    assert "Software/Controls" in system
    assert "Preventive Maintenance" in system
    assert "Unknown" in system


def test_user_prompt_contains_machine_type():
    _, user = build_triage_prompt(_make_case(machineType="CNC Milling Machine"))
    assert "CNC Milling Machine" in user


def test_user_prompt_wraps_description_in_xml():
    _, user = build_triage_prompt(_make_case())
    assert "<technician_description>" in user
    assert "</technician_description>" in user


def test_user_prompt_contains_word_count():
    _, user = build_triage_prompt(_make_case(description="one two three four five"))
    assert "words" in user
    assert "5" in user


def test_function_is_deterministic():
    case = _make_case()
    first = build_triage_prompt(case)
    second = build_triage_prompt(case)
    assert first == second


def test_submission_context_includes_day():
    # 2024-03-05 is a Tuesday
    _, user = build_triage_prompt(_make_case(
        submittedAt=datetime(2024, 3, 5, 14, 30, 0, tzinfo=timezone.utc)
    ))
    assert "Tuesday" in user
