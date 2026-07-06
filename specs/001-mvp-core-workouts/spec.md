# Feature Specification: MVP Core Workouts & Access Control

**Feature Branch**: `001-mvp-core-workouts`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Application will serve for both, coaches and clients and client should be able to log their own session, but also the coach can recommend modification, which need to be approved by the client. MVP Core workouts, Auth, and Multi-coach/multi-client support."

## Clarifications

### Session 2026-07-06
- Q: How is the coach-client link established? → A: Coach invites Client via email, Client must accept.
- Q: Where and how does the client approve/reject suggestions? → A: Dedicated Approvals Hub screen/tab.
- Q: Can coaches recommend modifications to current active logs or only future plans? → A: Full Retroactive (Future templates, current active logs, and past logs).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication & Role-Based Dashboard (Priority: P1)
As a Coach or a Client, I want to securely log in to the application and view a dashboard tailored to my role.

**Why this priority**: Fundamental entry point required to distinguish between user actions and access controls.

**Independent Test**: Verify that logging in as a Client displays client logging options, while logging in as a Coach displays client management options.

**Acceptance Scenarios**:
1. **Given** a registered user with a "Client" role, **When** they log in with valid credentials, **Then** they see their dashboard with options to log a workout session.
2. **Given** a registered user with a "Coach" role, **When** they log in with valid credentials, **Then** they see their dashboard listing linked clients.

---

### User Story 2 - Workout Logging by Client (Priority: P1)
As a Client, I want to log my gym workouts (exercises, sets, reps, weight) directly on the mobile app, either based on an assigned plan or as a custom session, so that my progress is recorded.

**Why this priority**: Core value proposition for the client, generating data for progress tracking and AI retrieval.

**Independent Test**: A client starts an empty workout session, adds an exercise, logs 3 sets of 10 reps at 50kg, finishes the workout, and verifies it appears in their history.

**Acceptance Scenarios**:
1. **Given** an active client session, **When** the client selects "Start Workout", adds "Back Squat" with 3 sets, logs weights/reps, and presses "Finish", **Then** the session status changes to "Completed" and is persisted.

---

### User Story 3 - Coach-Client Multi-Link & Workspace (Priority: P2)
As a Coach, I want to view my client roster and access their individual workout logs so that I can monitor their performance.
As a Client, I want to connect with multiple coaches (e.g., strength coach and nutrition coach).

**Why this priority**: Essential to enable the multi-tenant collaborative workflow.

**Independent Test**: Connect client A to coach B and coach C, verify both coaches can view client A's logs, but coach D cannot.

**Acceptance Scenarios**:
1. **Given** a client linked to Coach A and Coach B, **When** Coach A views their client roster, **Then** the client appears in the list.
2. **Given** Coach C is not linked to the client, **When** Coach C tries to view the client's dashboard, **Then** access is denied.
3. **Given** a new relationship needs to be established, **When** the link is initiated by the Coach inviting the Client via email, and the Client explicitly accepts, **Then** the connection is created and active.

---

### User Story 4 - Coach Recommended Workout Modifications (Priority: P2)
As a Coach, I want to recommend modifications to a client's workout plan.
As a Client, I want to view, approve, or reject these recommended changes before they affect my active workout logs.

**Why this priority**: Establishes the cooperative but client-autonomous workout planning.

**Independent Test**: Coach proposes changing Bench Press to Dumbbell Press in Client A's plan. Client A sees the request, rejects it, and the active plan remains Bench Press.

**Acceptance Scenarios**:
1. **Given** a linked relationship, **When** the coach modifies the client's plan, **Then** a recommended modification record is created in a "Pending Approval" state, and the active plan is not modified.
2. **Given** a pending recommendation, **When** the client approves the change in the dedicated Approvals Hub screen/tab, **Then** the recommended plan becomes active.
3. **Given** a pending recommendation, **When** the client rejects the change, **Then** the recommendation status is set to "Rejected" and the active plan is untouched.

---

### Edge Cases
- **Concurrent & Retroactive modifications**: Coaches can propose modifications to future templates, active running logs, or past logs. All such proposals are held in a pending state until approved.
- **Orphan logs**: A coach is unlinked from a client; all recommended pending modifications from that coach must be automatically canceled/removed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support distinct User Roles: Coach and Client.
- **FR-002**: System MUST permit a Client to be associated with multiple Coaches, and a Coach with multiple Clients (Many-to-Many).
- **FR-003**: Clients MUST be able to create, edit, log, and complete workout sessions (exercises, sets, reps, weight, comments).
- **FR-004**: Coaches MUST be able to view workout history and plans for only their associated clients.
- **FR-005**: Coaches MUST be able to propose modifications (e.g., add/remove exercises, change target weights/reps) to a client's workout plan.
- **FR-006**: Proposed modifications MUST be stored as draft recommendations with a state of `PENDING_APPROVAL`.
- **FR-007**: Clients MUST be able to explicitly accept or reject any `PENDING_APPROVAL` modifications.
- **FR-008**: System MUST only update the active plan once the client accepts the proposed modification.

### Key Entities *(include if feature involves data)*

- **User**: Represents any application user. Attributes: ID, email, hashed password, role (COACH, CLIENT).
- **CoachClientRelationship**: Represents the connection between a coach and a client. Attributes: Coach ID, Client ID, status, date established.
- **WorkoutPlan**: Represents a planned workout template. Attributes: ID, client ID, name, creator ID (Coach or Client), active status.
- **WorkoutPlanExercise**: Represents an exercise in a workout plan with targets. Attributes: exercise name, target sets, target reps, target weight.
- **WorkoutLog**: Represents a completed or in-progress logged workout session. Attributes: ID, client ID, timestamp, status (IN_PROGRESS, COMPLETED).
- **WorkoutLogSet**: Represents a set logged within a workout log. Attributes: exercise name, set index, actual reps, actual weight.
- **PlanModificationRecommendation**: Represents a proposed change by a coach. Attributes: ID, plan ID, coach ID, proposed changes payload, status (PENDING_APPROVAL, APPROVED, REJECTED), date proposed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of workout data modifications initiated by coaches require client confirmation before altering the active workout schema.
- **SC-002**: Unauthorized access attempts by coaches to unlinked client profiles must fail 100% of the time.
- **SC-003**: Clients can log a workout set in under 5 seconds (frictionless gym-floor logging).
- **SC-004**: Pending recommendations are displayed to the client immediately upon logging in or starting their workout session.

## Assumptions

- We assume users will have internet connectivity when logging workouts (offline logging is out of scope for MVP v1).
- We assume user authentication will use secure email/password login in v1 (social login is out of scope).
