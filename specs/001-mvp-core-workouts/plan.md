# Implementation Plan: MVP Core Workouts & Access Control

**Branch**: `001-mvp-core-workouts` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-mvp-core-workouts/spec.md`

## Summary
The goal of this feature is to establish the core user identity, many-to-many coach-client relationship modeling, and the workout logging and template planning engine. The system will be built as a modular monolith using Java/Spring Boot and PostgreSQL, serving a React Native mobile client and a Vite React web client. It features a strict "Approvals Hub" mechanism where coach-proposed workout modifications must be explicitly authorized by clients before updating active logs.

## Technical Context

**Language/Version**: Java 17, TypeScript 5.0+

**Primary Dependencies**: 
* Backend: Spring Boot 3.x, Spring Data JPA, Spring Security (JWT-based session authentication), Spring AI, Lombok, PostgreSQL Driver
* Frontend Mobile: React Native (Expo v50+), React Navigation, Axios
* Frontend Web: React 18, Vite, Tailwind CSS

**Storage**: PostgreSQL 15+ (Relational engine handling multi-tenant mappings)

**Testing**: JUnit 5, Mockito, Spring Security Test, Testcontainers (for database integration testing)

**Target Platform**: AWS/GCP (Docker-based deployment for backend), iOS/Android (via React Native/Expo), Web Browsers (Chrome, Safari, Firefox)

**Project Type**: Monorepo combining a modular monolithic backend and multi-platform frontends.

**Performance Goals**:
* API Response Time: <200ms (p95) for all standard dashboard and logging actions.
* Concurrent Sessions: Support up to 5,000 active concurrent connections without latency degradation.
* Low Friction: Mobile logging latency under 50ms locally.

**Constraints**:
* Cross-Origin Resource Sharing (CORS) configured for both localhost development and target web domains.
* Row-level authorization matching CoachClientRelationship records.
* Grounded AI queries must not execute raw prompts without prior vector-retrieval or contextual database pre-filtering.

**Scale/Scope**: MVP release supporting up to 50 active coaches and 500 active clients.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Plan | Status |
|---|---|---|
| **I. Library-First & Modular Design** | Backend split into packages by feature (`auth`, `coaching`, `workouts`, `ai-gateway`). Minimal dependencies between domains. | ✅ Compliant |
| **II. Clean API & Interface Separation** | All API exchange data is fully defined by DTO classes. Endpoint contracts are documented before coding. | ✅ Compliant |
| **III. Test-Driven Development (TDD)** | Integration tests for the Approvals Hub and relation-based access controls will be written prior to service implementation. | ✅ Compliant |
| **IV. Grounded AI Integration (RAG)** | The LLM gateway will only process chat contexts containing pre-fetched SQL workout/calorie facts to ground answers. | ✅ Compliant |
| **V. Client Autonomy & Explicit Approval** | The database schema separates active logs from suggested logs, requiring client-initiated transitions. | ✅ Compliant |

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-core-workouts/
├── plan.md              # This file
├── research.md          # Technical analysis & choices
├── data-model.md        # PostgreSQL Schema & Relationships
├── quickstart.md        # Run-guide & validation instructions
├── checklists/
│   └── requirements.md  # Specification Checklist
└── contracts/           # API request/response JSON schemas
    ├── auth.json
    ├── workouts.json
    └── approvals.json
```

### Source Code Layout

```text
backend/
├── pom.xml                               # Root backend Maven config
├── rsfit-api/                            # REST API Controllers & Security
│   └── src/main/java/com/rsfit/api/
├── rsfit-auth/                           # Auth module (JWT, User Accounts)
│   └── src/main/java/com/rsfit/auth/
├── rsfit-coaching/                       # Coaching & Client Relationship Management
│   └── src/main/java/com/rsfit/coaching/
└── rsfit-workouts/                       # Workout plans, logs, and Approvals Hub
    └── src/main/java/com/rsfit/workouts/

frontend/
├── web/                                  # Vite React Web application
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── tailwind.config.js
└── mobile/                               # React Native (Expo) application
    ├── package.json
    └── src/
        ├── components/
        └── screens/
```

**Structure Decision**: Monorepo layout with modular subdirectories separated by backend/frontend and individual Spring Boot domain projects.

## Complexity Tracking

*No violations identified.*
