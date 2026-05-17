# ITHENA Take-Home Assignment

> NOTE:
> This assignment heavily evaluates:
> - engineering judgment
> - AI systems thinking
> - prompt engineering
> - architecture tradeoffs
> - i18n scalability
> - failure handling
> - product reasoning
> - security awareness
> - clarity of communication

## Developer Role | Full Stack + AI + i18n

---

# Before You Start

- Spend 20–30 minutes on `ithena.ai` before starting — specifically the **iSERV (Smart Service)** product.
- You may use any AI tools you choose.
- There is no penalty for heavy AI use.
- **How you use AI is part of what we are evaluating.**
- The README at the end is **not optional**.
- Deadline: **Monday 5 pm IST**
- Depth and clarity are rewarded over speed.

---

# Overview

This assignment has four parts.

Parts 1 and 2 build the triage feature.  
Part 3 adds internationalization.  
Part 4 is a written reflection.

| Part | What You Build | What It Tests |
|---|---|---|
| 1 | Backend API endpoint | Python + LLM integration + prompt engineering |
| 2 | React triage review UI | Full stack, component design, loading/error states |
| 3 | i18n on the triage card | Locale-aware formatting, translation architecture, fallback handling |
| 4 | README reflection | Communication, self-awareness, AI tool fluency |

---

# The Scenario

ITHENA's iSERV platform helps industrial machine builders manage aftermarket service:

- field technician dispatch
- spare parts
- maintenance contracts

Currently, when a technician submits a service case:

1. A human coordinator reads the description
2. Manually assigns a priority
3. Routes it to the correct team

This does not scale.

Your task is to build a working prototype of an AI-assisted triage feature:

- the system reads an incoming service case
- suggests a priority and routing category
- a coordinator can accept or override the suggestion with a reason

ITHENA is expanding into:

- Germany
- Japan
- Mexico

The triage card must support multiple locales from day one.

---

# From the ITHENA Service Director

> “We get 200+ new cases a day. Half are mislabeled.
> A coordinator spends 3 hours on initial triage.
> If the AI does a first pass, we cut that to 30 minutes —
> and we need it to work for our customers in Germany and Japan
> just as well as it does in the US.”

---

# Part 1 — Backend: Triage API Endpoint

Build a backend endpoint that accepts a service case and returns an AI-generated triage suggestion.

---

## Endpoint Specification

### POST `/api/triage`

### Request Body

```json
{
  "caseId": "string",
  "machineType": "string",
  "description": "string",
  "submittedAt": "ISO 8601 timestamp"
}
```

### Response Body

```json
{
  "caseId": "string",
  "suggestedPriority": "low | medium | high | critical",
  "suggestedCategory": "string",
  "reasoning": "string",
  "confidence": "low | medium | high"
}
```

---

## Requirements

- Python preferred:
  - FastAPI
  - Flask
- Node/Express acceptable if justified in README
- Must call an LLM:
  - Claude API
  - OpenAI
  - hosted model
- No hardcoded classification rules
- Prompt quality is evaluated:
  - structured
  - constrained output
  - contextualized
- Handle malformed/unexpected LLM responses gracefully
- Endpoint must never crash
- Include at least one test:
  - prompt construction test
  - mock-based response shape test

---

# Part 2 — Frontend: Triage Review Component

Build a React component:

## `TriageReviewCard`

This component should:

- display the incoming service case
- display AI triage suggestions
- allow acceptance or override

---

## Required UI Elements

### Service Case Details

- machine type
- description
- submitted timestamp

### AI Suggestion Panel

- priority badge
- category label
- reasoning text
- confidence indicator

### Actions

#### Accept Button

- locks in AI suggestion with one click

#### Override Section

- dropdown to change priority
- dropdown to change category
- required reason field

#### Submit Button

- sends final decision
- mocked submission acceptable

---

## Frontend Requirements

- Call backend endpoint on mount
- Show loading state:
  - LLM latency expected: 1–3 seconds
- Override reason must be required
- Low-confidence suggestions must be visually distinct
- Handle API failure gracefully
- Do not silently swallow errors

> IMPORTANT:
> Part 3 adds i18n.
> Build this component cleanly enough that locale support is a natural extension — not a rewrite.

---

# Part 3 — Internationalization (i18n)

Support the following locales:

- `en-US`
- `de-DE`
- `ja-JP`

---

## Requirements

### Locale-Aware Dates

- No hardcoded MM/DD/YYYY formatting

### Translation Support

Translate:

- low
- medium
- high
- critical
- open
- in progress
- resolved

Use a proper i18n architecture.

Do NOT use switch statements.

---

## Locale Fallback

If unsupported locale is passed:

- gracefully fall back to `en-US`

This must be implemented as:

- standalone utility function
- not inline logic

---

## Locale Switcher

Add a locale switcher in the demo so all locales can be compared.

---

## Testing

Add at least one unit test covering:

- locale fallback behavior

Explain in README:

- why this test matters

---

# i18n Library Choice

You may choose:

- i18next
- react-intl
- custom solution

You MUST justify your choice in README.

This justification is evaluated.

---

# Stretch Goals (Optional)

- RTL layout considerations (Arabic support)
- Second component reusing same i18n setup
- Lazy-loading translation strategy discussion

---

# Part 4 — Security Consideration & README Reflection

---

# Security Analysis

The triage endpoint accepts free-text technician input and passes it to an LLM.

Write about:

## Two realistic abuse/injection scenarios

For each:

1. Name the attack
2. Describe the impact
3. Give one concrete mitigation

Requirements:

- must be realistic
- must be specific to this workflow
- generic AI risks are insufficient

---

# README Reflection

Maximum:

- one page
- prose only

---

## Questions

### 1. Prompt Engineering

What was the hardest decision in Part 1 around prompt design?

- What did you try first?
- Why did you change it?

---

### 2. i18n Architecture

What i18n approach/library did you choose and why?

What would you improve with more time?

---

### 3. Production Scaling

If deployed to production with:

- 500 concurrent coordinators
- three countries

What breaks first?

---

### 4. AI Tool Usage

How did you use AI tools?

- What did AI generate?
- Where was AI wrong?
- Which decisions were entirely yours?

---

# Evaluation Criteria

| Dimension | What They're Evaluating | Weight |
|---|---|---|
| Prompt engineering | Structured prompting, output constraints, contextual reasoning | 20% |
| Full stack integration | Backend/frontend integration, loading/error/success states | 20% |
| i18n architecture | Scalable locale system, fallback handling, formatting | 20% |
| Security instinct | Realistic workflow-specific threat analysis | 15% |
| Error handling | API, LLM, UI, and locale fallback resilience | 10% |
| README quality | Clarity, specificity, completeness | 15% |

---

# Submission Format

## Backend

- Python or Node
- Include:
  - `requirements.txt`
  - `package.json`
- Must run locally with one command

---

## Frontend

- React
- CodeSandbox, StackBlitz, or GitHub acceptable
- Include clear run instructions

---

## Repo Structure

- monorepo acceptable
- separate folders acceptable

---

## API Keys

- `.env` only
- never commit secrets
- include `.env.example`

---

# Submission Email

Send to:

```text
shubhamc@ithena.ai
```

---

# Scope Guidance

> This is a working prototype, not a production system.

A clean 300-line implementation beats:

- sprawling architecture
- overengineering
- excessive abstraction

The evaluation prioritizes:

- decision quality
- engineering clarity
- thoughtful tradeoffs
- maintainability

NOT quantity of code.