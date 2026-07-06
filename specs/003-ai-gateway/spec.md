# Feature Specification: LLM AI Gateway & RAG Chat

**Feature Branch**: `003-ai-gateway`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "LLM gateway for integration with AI, doing daily briefings (calories, protein, exercises) and responding to questions from a chat based on database logs."

## Clarifications

### Session 2026-07-06
- Q: Is the daily brief on-demand or scheduled? → A: Option A (On-Demand via the app).
- Q: Which LLM provider should be configured? → A: Option C (Google Gemini Pro).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - On-Demand Client Daily Briefing (Priority: P1)
As a Client, I want to request a daily brief in my app, so that I can see an AI-summarized overview of my workout performance and nutrition intake for today.

**Why this priority**: Core value feature to review progress instantly in a natural language format.

**Independent Test**: Client logs a chest workout and a 500 kcal meal, clicks "Generate Daily Brief", and verifies the AI returns: *"Today you consumed 500 kcal and completed a chest workout session."*

**Acceptance Scenarios**:
1. **Given** logged workouts and meals for today, **When** the client requests a daily brief on-demand via the app, **Then** the system retrieves today's logs, passes them to Spring AI as context, and returns the generated paragraph.

---

### User Story 2 - Conversational Fitness Chat (Priority: P1)
As a Client, I want to ask questions in a chat console regarding my training or nutrition logs, so that I can get context-grounded advice.

**Why this priority**: Drives engagement by letting clients interact with their historical data conversationalist style.

**Independent Test**: Client asks: *"Did I hit my protein goal today?"*, and the AI answers: *"Yes, you consumed 165g of protein which exceeds your target of 150g."* or *"No, you have consumed 80g out of your 150g goal."*

**Acceptance Scenarios**:
1. **Given** historical data, **When** the client submits a question to the chat endpoint, **Then** the system queries database records, injects them into the LLM prompt template, and streams/returns the response.

---

### User Story 3 - Coach Oversight of Client Briefs (Priority: P2)
As a Coach, I want to read the daily briefs of my active clients, so that I can quickly monitor their consistency without analyzing tables.

**Why this priority**: Increases coach productivity.

**Independent Test**: Coach B requests the daily brief for Client A. Verifies they retrieve the text summary.

**Acceptance Scenarios**:
1. **Given** an active coaching relationship, **When** the coach requests the daily summary text of Client A, **Then** the generated summary is returned.

---

### Edge Cases
- **Empty Logs**: If a client requests a brief on a day they logged nothing, the AI should return a friendly encouragement rather than failing or saying nothing.
- **Data Leakage**: System must strictly isolate grounding queries so that User A's chat session cannot access User B's workout logs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST interface with a ChatClient (using Spring AI Gemini) to communicate with the LLM.
- **FR-002**: System MUST retrieve the client's logs and targets for the specified date to construct the prompt grounding context.
- **FR-003**: System MUST block chats from querying data belonging to other clients.
- **FR-004**: System MUST fallback to a mock client generator if no external API key is set in application properties.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of LLM prompts are grounded only with logs belonging to the authenticated client requesting the chat.
- **SC-002**: Daily brief generation responds in under 3.0s (under LLM latency thresholds).

## Assumptions

- We assume Spring AI handles connection mappings and prompt structuring.
- API keys will be configured locally via environment variables (`SPRING_AI_VERTEX_AI_GEMINI_API_KEY`).
