# ITHENA iSERV — AI Triage Feature

This file is read automatically by Claude Code on every session.
Do not delete it. All architectural decisions are documented here.

---

## What This Project Is

An AI-assisted triage feature for ITHENA's iSERV industrial service platform.

A field technician submits a free-text description of a machine problem.
The system reads it and returns a structured triage suggestion:
- suggestedPriority: low | medium | high | critical
- suggestedCategory: one of 6 fixed values (see schemas.py)
- reasoning: 1-2 sentences
- confidence: low | medium | high

A coordinator (service manager) reviews the suggestion, then accepts or overrides it.

---

## Non-Negotiable Architectural Decisions

Read these before writing any code. These are final — do not suggest alternatives.

### Backend
- Framework: FastAPI (not Flask, not Django)
- Python: 3.11
- LLM: Claude Haiku via Anthropic SDK — model string: claude-haiku-4-5-20251001
- Temperature: 0 on all LLM calls (deterministic output required)
- NO LangChain, NO LlamaIndex, NO orchestration frameworks
- Call the Anthropic API directly — the prompt is the evaluated artifact
- Pydantic v2 for all models — use model_config = ConfigDict(extra='forbid')

### Frontend
- React 18 + TypeScript (strict mode)
- Tailwind CSS for all styling — no CSS modules, no styled-components
- i18next + react-i18next for i18n — no custom solution, no react-intl
- State management: useState + useEffect only — no Redux, no Zustand, no Context for this feature
- Date formatting: native Intl.DateTimeFormat only — no date-fns, no moment.js

### Security (built into implementation)
- Technician description MUST be wrapped in <technician_description>...</technician_description> in the prompt
- Category output MUST be validated against the fixed enum in the parser — never pass free-form categories to the frontend
- Never log the full description field (may contain sensitive operational data)
- Log: caseId, machineType, LLM response time, parse success/fail, final confidence

### What NOT to build
- No authentication
- No database (mock the submission response)
- No Docker or deployment config
- No more than 6 categories
- No streaming LLM responses
- No WebSockets
- No state management library

---

## Exact Folder Structure

```
ithena-triage/
├── CLAUDE.md                          ← this file
├── README.md                          ← written last
├── backend/
│   ├── main.py                        ← FastAPI app + CORS
│   ├── api/
│   │   └── triage.py                  ← route handler only, thin layer
│   ├── services/
│   │   ├── prompt_builder.py          ← pure function, no API calls
│   │   ├── llm_client.py              ← Anthropic SDK calls + retry
│   │   └── response_parser.py        ← validates + normalizes LLM output
│   ├── models/
│   │   └── schemas.py                 ← Pydantic models
│   ├── tests/
│   │   ├── test_prompt_builder.py
│   │   └── test_response_parser.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── i18n.ts
    │   ├── components/
    │   │   └── TriageReviewCard/
    │   │       ├── index.tsx
    │   │       ├── ConfidenceBadge.tsx
    │   │       ├── OverrideForm.tsx
    │   │       └── TimestampAge.tsx
    │   ├── locales/
    │   │   ├── en-US/triage.json
    │   │   ├── de-DE/triage.json
    │   │   └── ja-JP/triage.json
    │   └── utils/
    │       └── locale.ts
    ├── tests/
    │   └── locale.test.ts
    └── package.json
```

---

## Data Contracts (Memorize These)

### POST /api/triage — Request
```json
{
  "caseId": "string, non-empty",
  "machineType": "string, non-empty",
  "description": "string, non-empty, max 2000 chars",
  "submittedAt": "ISO 8601 datetime"
}
```

### POST /api/triage — Success Response
```json
{
  "caseId": "string",
  "suggestedPriority": "low | medium | high | critical",
  "suggestedCategory": "Mechanical Failure | Electrical | Hydraulic | Software/Controls | Preventive Maintenance | Unknown",
  "reasoning": "string, 1-2 sentences",
  "confidence": "low | medium | high"
}
```

### POST /api/triage — Error Response (never 500 crash)
```json
{
  "caseId": "string",
  "error": "string",
  "fallback": true
}
```

---

## Priority Definitions (Used in Prompt)

These are operational, not abstract:
- **critical**: production stoppage OR safety risk OR immediate SLA breach — dispatch required NOW
- **high**: significant degradation, likely stoppage within hours, same-day response required
- **medium**: partial degradation, operational but impaired, response within 24 hours
- **low**: minor issue, no production impact, scheduled maintenance window acceptable

---

## LLM Prompt Rules

- System prompt defines: persona, priority definitions, output schema, category enum, grounding instruction
- User prompt contains: machine type, submission context (time of day + day of week), word count, description in XML delimiters
- Grounding instruction: "Base reasoning ONLY on the technician description. Do not invent symptoms. If description is insufficient, return confidence: low and category: Unknown."
- Output instruction: "Return ONLY valid JSON matching the schema. No prose, no markdown."

---

## Response Parser Rules

In order — never skip a step, never throw:
1. Try json.loads(raw)
2. On failure: regex extract first {...} block
3. On failure: return safe fallback (priority: medium, category: Unknown, confidence: low)
4. After parse: validate each field against enum — replace invalid values with fallback, never crash
5. Confidence calibration: if reasoning contains hedging words AND confidence is "high" → downgrade to "medium"
   Hedging words: ["possibly", "unclear", "uncertain", "it appears", "might", "not sure", "insufficient", "hard to determine"]

---

## Frontend Component Behavior

### TriageReviewCard states
- loading: show skeleton placeholder (not spinner) matching the card layout
- error: show "AI triage unavailable. You can still manually assign priority and category." — coordinator NOT blocked
- success: show suggestion with confidence-aware styling

### Confidence-aware styling
- high: solid border, Accept button primary/prominent
- medium: dashed border, "Review recommended" label visible
- low: warning background color, override section PRE-EXPANDED, Accept button de-emphasized

### Priority badge colors (color + text label always — never color alone)
- critical: red
- high: orange
- medium: yellow/amber
- low: green

### Override form behavior
- Pre-expand automatically when confidence is low
- Reason chips (clickable presets that fill the text field):
  "Machine type not recognized" | "Local context applies" | "SLA requires escalation" | "Technician error suspected" | "Other"
- Free text field below chips — still editable after chip selection
- Priority + Category dropdowns
- Submit disabled until reason field is non-empty
- Validate on submit attempt only — no red borders on page load

### TimestampAge behavior
- Shows relative time: "X minutes ago" / "X hours ago"
- Color: green if < 1 hour, yellow/amber if 1–4 hours, red if > 4 hours
- Updates every minute

---

## i18n Rules

### getLocale() function — pure, no side effects
```
'en-US' → 'en-US'   (exact match)
'de-DE' → 'de-DE'   (exact match)
'ja-JP' → 'ja-JP'   (exact match)
'de'    → 'de-DE'   (partial match on language code)
'fr-FR' → 'en-US'   (unsupported → fallback)
''      → 'en-US'   (empty → fallback)
```

### Required translation keys (all 3 locales)
```
priority.low / priority.medium / priority.high / priority.critical
status.open / status.inProgress / status.resolved
confidence.low / confidence.medium / confidence.high
category.mechanicalFailure / category.electrical / category.hydraulic
category.softwareControls / category.preventiveMaintenance / category.unknown
ui.accept / ui.override / ui.submit / ui.loading / ui.error
ui.reviewRecommended / ui.aiUnavailable / ui.manualAssign
override.reason / override.submit / override.cancel
override.chips.machineTypeNotRecognized / override.chips.localContextApplies
override.chips.slaEscalation / override.chips.technicianError / override.chips.other
```

### Date formatting
Use ONLY: new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
No libraries.

---

## Run Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
cp .env.example .env  # then add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000

# Backend tests
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm install
npm run dev  # runs on http://localhost:5173

# Frontend tests
cd frontend && npm test
```

---

## Environment Variables

backend/.env (never commit):
```
ANTHROPIC_API_KEY=sk-ant-...
```

backend/.env.example (commit this):
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## Demo Data (Use This in App.tsx)

```typescript
const demoCase = {
  caseId: "DEMO-001",
  machineType: "Industrial Hydraulic Pump",
  description: "Pump making loud grinding noise since morning shift start. Line 3 is operating at 40% capacity. Operators report vibration in the main coupling. No visible leaks but pressure gauge reading is fluctuating between 80-120 PSI instead of normal 140 PSI.",
  submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
};
```

This case should produce: priority high or critical, category Hydraulic, confidence medium or high.
TimestampAge should render in yellow (2 hours = within 1–4hr range).


## Assignment Reference
The full assignment is in ASSIGNMENT.md at the project root.
When in doubt about requirements, check there first.
