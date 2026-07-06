# Validation Guide (Quickstart): MVP Core Workouts

This document outlines how to spin up the local development environment and run verification commands to test the complete user lifecycle of RSFit.

---

## 1. Local Prerequisites & Running

### PostgreSQL Database
Run a local PostgreSQL instance using Docker:
```bash
docker run --name rsfit-postgres \
  -e POSTGRES_DB=rsfit \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 -d postgres:15
```

### Spring Boot Backend Monolith
Navigate to the backend directory and compile/run the application:
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run -pl rsfit-api
```

---

## 2. API Verification Script (Walkthrough)

Below is a series of `curl` requests to manually verify the database state, role dashboards, and the Approvals Hub.

### Step 1: User Registration
Register a Coach account:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@rsfit.com", "password":"password123", "role":"COACH"}'
```

Register a Client account:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"client@rsfit.com", "password":"password123", "role":"CLIENT"}'
```

### Step 2: Retrieve Authorization Tokens
Log in as the Client to retrieve the JWT:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@rsfit.com", "password":"password123"}'
```
*Note the returned `"token"` for use in subsequent calls as the `$CLIENT_TOKEN` headers (`Authorization: Bearer <token>`).*

### Step 3: Establish Coach-Client Link
Create an active link between the Coach and Client. *(For testing/setup, this can be seeded or established via an invitation approval endpoint).*

### Step 4: Client Starts & Logs Workout
Client creates an in-progress log:
```bash
curl -X POST http://localhost:8080/api/workouts/logs \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Back Day Workout"}'
```
*Take note of the returned workout log ID: `$LOG_ID`.*

Client logs sets for "Pull-Ups":
```bash
curl -X PUT http://localhost:8080/api/workouts/logs/$LOG_ID/sets \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exerciseName": "Pull-Ups", "sets": [{"setIndex": 0, "reps": 10, "weight": 0.0, "completed": true}]}'
```

### Step 5: Coach Recommends a Modification
Coach proposes modifying the client's current active log (e.g. suggesting adding weights or target sets):
```bash
curl -X POST http://localhost:8080/api/approvals/recommendations \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "$CLIENT_UUID",
    "logId": "$LOG_ID",
    "proposedChanges": {
      "action": "ADJUST_SETS_REPS",
      "targetExercise": "Pull-Ups",
      "targetSets": 3,
      "targetReps": 8,
      "targetWeight": 15.0
    }
  }'
```
*Take note of the returned recommendation ID: `$REC_ID`.*

### Step 6: Client Reviews and Approves Modification
Client checks their pending approvals:
```bash
curl -X GET http://localhost:8080/api/approvals/pending \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```

Client approves the recommendation:
```bash
curl -X POST http://localhost:8080/api/approvals/recommendations/$REC_ID/action \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'
```

Verify that the client's active log status or target values for Pull-Ups has now been updated to include the coach's recommendation.
