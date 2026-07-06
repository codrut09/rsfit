# Implementation Plan: LLM AI Gateway & RAG Chat

**Branch**: `003-ai-gateway` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-ai-gateway/spec.md`

## Summary
The goal of this feature is to introduce the LLM AI Gateway and conversational fitness chat. We will configure **Spring AI** to communicate with Google Gemini Pro. The backend will fetch the client's logs/targets for the current date, format them as context, and inject them into RAG prompt templates. We'll also build a mock LLM fallback to handle local testing when API credentials are absent.

## Technical Context

**Language/Version**: Java 17, TypeScript 5.0+

**Primary Dependencies**:
* Backend: Spring Boot 3.x, Spring AI Gemini starter (`spring-ai-vertex-ai-gemini-spring-boot-starter` or core configurations)
* Frontend Mobile: React Native (Expo v50+), Axios

**Storage**: Read-only queries to `workout_logs`, `workout_log_sets`, `nutrition_logs`, and `nutrition_targets` tables.

**Testing**: JUnit 5, Mockito

**Target Platform**: JVM / Docker, Mobile (React Native)

**Project Type**: Monorepo combining a modular monolithic backend and Expo mobile frontends.

**Performance Goals**:
* On-demand daily brief generation response latency <3.0s (under LLM standard times).
* Chat replies stream/response <3.0s.

**Constraints**:
* Prompts must be strictly isolated to the authenticated user's records.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Plan | Status |
|---|---|---|
| **I. Library-First & Modular Design** | AI components packaged within a clear structure to decouple them from core repositories. | ✅ Compliant |
| **II. Clean API & Interface Separation** | Rest endpoints and DTO models are fully specified prior to implementation. | ✅ Compliant |
| **III. Test-Driven Development (TDD)** | Integration tests for prompt generation will verify context strings include mock data. | ✅ Compliant |
| **IV. Grounded AI Integration (RAG)** | Prompt templates only construct contexts using database query results for the current client. | ✅ Compliant |
| **V. Client Autonomy & Explicit Approval** | The AI only reads logs on-demand when client triggers the brief. | ✅ Compliant |

## Project Structure

### Documentation (this feature)

```text
specs/003-ai-gateway/
├── plan.md              # This file
├── research.md          # Grounding templates and fallback chat client research
├── data-model.md        # Database tables read mapping
├── quickstart.md        # Curl validation script
└── contracts/
    └── ai.json          # REST endpoints payload contracts
```

### Source Code Layout

```text
backend/
├── rsfit-api/
│   └── src/main/java/com/rsfit/api/controller/
│       └── AiController.java             # Exposes AI endpoints
└── rsfit-workouts/                       # Decoupled AI helper service package
    └── src/main/java/com/rsfit/workouts/
        └── service/
            └── AiGatewayService.java     # Compiles logs and triggers Spring AI
```

**Structure Decision**: Expose AI operations through a single Controller in `rsfit-api`, invoking services from the workouts/nutrition modules to assemble the RAG context.
