# RSFit (Gym Coach & Client Workout Tracker)

This repository contains the source code for the RSFit platform, designed as a modular monolith.

## Codebase Architecture

* **[backend/](file:///Users/livadarucodrut/Documents/Projects/rsfit/backend)**: Java 17 / Spring Boot 3.x multi-module project.
  * `rsfit-api`: Exposes REST endpoints, configures security filters, and handles exceptions.
  * `rsfit-auth`: Manages user credentials (BCrypt), roles, and stateless JWT token exchanges.
  * `rsfit-coaching`: Tracks relationships, invite status, and multi-coach access gates.
  * `rsfit-workouts`: Manages workout logs, exercises, sets, the retroactive Approvals Hub, and the LLM AI Gateway.
  * `rsfit-nutrition`: Tracks daily food intake log entries and stages daily goals target approvals.
* **[frontend/mobile/](file:///Users/livadarucodrut/Documents/Projects/rsfit/frontend/mobile)**: React Native mobile client for tracking workouts on the gym floor.
* **[frontend/web/](file:///Users/livadarucodrut/Documents/Projects/rsfit/frontend/web)**: Vite React web client for coaches to review client rosters.

---

## Local Setup & Run

### Database
Run a PostgreSQL container:
```bash
docker run --name rsfit-postgres \
  -e POSTGRES_DB=rsfit \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 -d postgres:15
```

### Backend Monolith
Navigate to `backend` and build:
```bash
cd backend
mvn clean install
mvn spring-boot:run -pl rsfit-api
```

### Mobile Client
Navigate to `frontend/mobile` and start Expo:
```bash
cd frontend/mobile
npm install
npm start
```
