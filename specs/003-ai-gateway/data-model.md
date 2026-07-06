# Data Model: LLM AI Gateway

This feature introduces no new database tables. It relies on read-only queries executed against existing domain modules to compile the client context.

## Referenced Tables

1. **`users`**: To resolve role privileges and client profile details.
2. **`workout_logs` & `workout_log_sets`**: Retaining the exercise logs, sets count, reps, and weights completed on the selected calendar date.
3. **`nutrition_logs`**: Tracking food names, calories, and macronutrient parameters logged on the selected calendar date.
4. **`nutrition_targets`**: Checking calorie and protein target goals.

## Access Security & Row-Level Gates

1. **Row-Level Queries Restriction**:
   Queries fetching data for the prompt template MUST bind the WHERE clause parameters strictly to the client ID extracted from the authenticated user's JWT credentials.
2. **Coach Access Gate**:
   Coaches can query target summaries for clients *if and only if* there exists a valid, active relationship in `coach_client_relationship`.
