# Feature Specification: Nutrition & Diet Tracker

**Feature Branch**: `002-nutrition-tracker`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Nutrition tracking module for logging calories, protein, and macros, supporting coach overview and RAG briefing context."

## Clarifications

### Session 2026-07-06
- Q: How are client daily nutrition targets managed? → A: Option A (Coaches recommend target adjustments, client approves/rejects via the Approvals Hub).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Client Logs Daily Food Entries (Priority: P1)
As a Client, I want to log the food items I eat, including estimate calories, protein, carbohydrates, and fats, so that my daily nutritional intake is tracked.

**Why this priority**: Core tracking data source required for progressive diet logging and RAG AI context.

**Independent Test**: Client enters "Chicken breast (200g)" with 330 kcal, 62g protein, 0g carbs, 7g fat. Verifies the entry appears in their daily meal logs history.

**Acceptance Scenarios**:
1. **Given** an authenticated client, **When** they submit a meal log entry with food name, calories, and macronutrient parameters, **Then** the record is persisted and marked for the current day.

---

### User Story 2 - Daily Progress Dashboard (Priority: P1)
As a Client, I want to view my accumulated totals of calories and macronutrients for the day alongside my target goals, so that I know if I am on track.

**Why this priority**: Core user engagement view displaying real-time feedback on daily progress.

**Independent Test**: Client logs 500 kcal, verifies the dashboard gauge updates to display 500 kcal accumulated toward their daily target.

**Acceptance Scenarios**:
1. **Given** logged meals for today, **When** the client views their nutrition dashboard, **Then** they see sum totals of calories, protein, carbs, and fat alongside target daily goals.

---

### User Story 3 - Coach Nutrition Oversight & Recommendations (Priority: P2)
As a Coach, I want to view my active clients' daily nutrition logs and target goals, and recommend plan modifications.

**Why this priority**: Essential for collaborative coach-client coaching context.

**Independent Test**: Coach B views Client A's logs and verifies they can read Client A's calorie intake, but cannot view logs of unlinked clients.

**Acceptance Scenarios**:
1. **Given** an active relationship, **When** Coach B queries Client A's nutrition logs, **Then** the list is returned successfully.
2. **Given** a coach wishes to adjust a client's daily targets, **When** the modification is recommended by the coach proposing target adjustments, and the client approves it via the Approvals Hub, **Then** the daily target limits are updated and active.

---

### Edge Cases
- **Future logging**: Prevent logging meal inputs for future calendar dates.
- **Log cleanup**: If a client deletes a meal, daily summaries must recalculate immediately.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clients MUST be able to log food items (name, calories, protein, carbohydrates, fat, timestamp).
- **FR-002**: System MUST calculate aggregate sums of calories, protein, carbohydrates, and fat grouped by client and day.
- **FR-003**: System MUST support defining target goals for daily calories and macronutrient metrics.
- **FR-004**: Coaches MUST be able to view nutrition records of associated clients only.

### Key Entities *(include if feature involves data)*

- **NutritionLog**: Represents a logged meal entry. Attributes: ID, client ID, food name, calories (kcal), protein (g), carbohydrates (g), fat (g), logged at (timestamp).
- **NutritionTarget**: Represents daily target goals. Attributes: ID, client ID, target calories, target protein, target carbs, target fat, active status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of nutrition logs are automatically mapped and aggregated to local timezone days.
- **SC-002**: Daily aggregate sum queries respond in under 100ms (p95) to ensure smooth dashboard loading.
- **SC-003**: Coach data access controls restrict client logs oversight to verified links only.

## Assumptions

- We assume clients manually input their calories/macros in this version (no barcode scanner or automated food database is in scope for MVP v1).
