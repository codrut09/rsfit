<!--
Sync Impact Report:
- Version change: N/A -> 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] -> I. Library-First & Modular Design
  - [PRINCIPLE_2_NAME] -> II. Clean API & Interface Separation
  - [PRINCIPLE_3_NAME] -> III. Test-Driven Development (TDD)
  - [PRINCIPLE_4_NAME] -> IV. Grounded AI Integration (RAG)
  - [PRINCIPLE_5_NAME] -> V. Client Autonomy & Explicit Approval
- Added sections:
  - Security & Access Control
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated/compliant)
  - .specify/templates/spec-template.md (✅ updated/compliant)
  - .specify/templates/tasks-template.md (✅ updated/compliant)
- Follow-up TODOs: none
-->

# RSFit Constitution

## Core Principles

### I. Library-First & Modular Design
Every backend feature must be developed as a standalone, modular slice (e.g., separate Maven modules or package structure in Spring Boot). Modules must be self-contained, independently testable, documented, and have a clear, distinct purpose to maintain clean modularity.

### II. Clean API & Interface Separation
Define clear, strongly-typed interface contracts (REST endpoints and JSON DTOs) between the Java/Spring Boot backend and frontend clients. Mobile (React Native) and Web (React) frontends should share consistent patterns and types.

### III. Test-Driven Development (TDD)
Automated testing is required. Core business logic, especially authorization rules governing coach-client relationships, must be validated via unit and integration tests.

### IV. Grounded AI Integration (RAG)
The LLM gateway backend service must ground its responses (such as summaries and workout chats) using Retrieval-Augmented Generation (RAG) based on actual logs (calories, exercises, protein, weight) from the PostgreSQL database, prioritizing safety and accuracy.

### V. Client Autonomy & Explicit Approval
Coaches can suggest and recommend modifications to training programs or logs. However, these suggestions remain inactive draft recommendations until the client explicitly approves them.

## Technology Stack & Constraints

* **Backend**: Java 17+, Spring Boot (Spring Web, Spring Data JPA, Spring Security, Spring AI).
* **Database**: PostgreSQL (relational model with many-to-many associations between Coaches and Clients).
* **Frontend Mobile**: React Native (primary platform for gym floor logging).
* **Frontend Web**: React ( Vite companion application).
* **Architecture**: Modular Monolith.

## Security & Access Control
Strict row-level and relation-based access controls. A coach can only view, read, or propose modifications to the logs of clients with whom they have an active, established relationship. Clients have full read-write access to their own logs.

## Governance
This constitution is the source of truth for RSFit architectural rules. Amendments require a major or minor version bump and a Sync Impact Report.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
