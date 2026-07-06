# Implementation Plan: Nutrition & Diet Tracker

**Branch**: `002-nutrition-tracker` | **Date**: 2026-07-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-nutrition-tracker/spec.md`

## Summary
The goal of this feature is to establish the food logging mechanics, aggregate calorie/macronutrient reporting, and the daily targets approvals workflow. It adds a new backend Maven module `rsfit-nutrition` that exposes diet logging APIs, handles daily calendar aggregations in PostgreSQL, and integrates with the existing approvals mechanism so target modifications require client confirmations.

## Technical Context

**Language/Version**: Java 17, TypeScript 5.0+

**Primary Dependencies**:
* Backend: Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security), Lombok, PostgreSQL Driver
* Frontend Mobile: React Native (Expo v50+), Axios

**Storage**: PostgreSQL 15+ (Handles logging records and client targets)

**Testing**: JUnit 5, Mockito, Spring Security Test

**Target Platform**: JVM / Docker, Mobile (React Native)

**Project Type**: Monorepo combining a modular monolithic backend and Expo mobile frontends.

**Performance Goals**:
* Daily summary queries response latency <100ms (p95).
* Write operations (food logs) <50ms.

**Constraints**:
* Calorie and macronutrient values must be positive numbers.
* Query aggregates must align to the client's local timezone offset.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Plan | Status |
|---|---|---|
| **I. Library-First & Modular Design** | Backend features grouped inside a new Maven module `rsfit-nutrition`. | ✅ Compliant |
| **II. Clean API & Interface Separation** | Rest endpoints and DTO models are fully specified prior to implementation. | ✅ Compliant |
| **III. Test-Driven Development (TDD)** | Integration tests for aggregation queries will be written first to verify timezone sum values. | ✅ Compliant |
| **IV. Grounded AI Integration (RAG)** | Grounding queries pre-fetch data from `NutritionLog` to inject into prompt context. | ✅ Compliant |
| **V. Client Autonomy & Explicit Approval** | Proposed target modifications are stored as recommendations and only applied on client acceptance. | ✅ Compliant |

## Project Structure

### Documentation (this feature)

```text
specs/002-nutrition-tracker/
├── plan.md              # This file
├── research.md          # Timezone and query aggregates research
├── data-model.md        # Nutrition log & targets entities
├── quickstart.md        # Curl validation script
└── contracts/
    └── nutrition.json   # REST endpoints payload contracts
```

### Source Code Layout

```text
backend/
├── pom.xml                               # Root parent POM (add rsfit-nutrition)
├── rsfit-api/
│   └── src/main/java/com/rsfit/api/controller/
│       └── NutritionController.java      # Exposes nutrition endpoints
└── rsfit-nutrition/                      # New module for nutrition tracker
    ├── pom.xml
    └── src/main/java/com/rsfit/nutrition/
        ├── entity/
        │   ├── NutritionLog.java
        │   └── NutritionTarget.java
        ├── repository/
        │   ├── NutritionLogRepository.java
        │   └── NutritionTargetRepository.java
        └── service/
            └── NutritionService.java

frontend/
└── mobile/
    └── src/
        ├── screens/
        │   ├── AddMealScreen.js          # Meal logging input
        │   └── NutritionDashboard.js     # Progress dashboard
        └── components/
            └── MacroSummary.js           # Progress bars component
```

**Structure Decision**: Monorepo layout using a dedicated `rsfit-nutrition` Maven submodule.

## Complexity Tracking

*No violations identified.*
