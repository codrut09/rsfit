# Research Notes: Nutrition & Diet Tracker

This document compiles the research findings and database query designs for the Nutrition Tracker module.

## 1. Timezone-Aligned Daily Aggregations

### Problem
A client logs meals at specific moments. If meals are stored as UTC timestamps, querying aggregates using a simple database date cast (e.g. `logged_at::date`) will cause meals eaten late in the evening to slip into the next day for clients in local timezones (e.g., UTC+2 or UTC-5).

### Decision
Store all meal timestamps in UTC (`TIMESTAMP WITHOUT TIME ZONE` or `TIMESTAMP WITH TIME ZONE`). When fetching daily summary aggregates, pass the client's current timezone ID (e.g., `'Europe/Bucharest'` or `'America/New_York'`) as a query parameter and perform the timezone conversion in the database:

```sql
SELECT 
    CAST(logged_at AT TIME ZONE 'UTC' AT TIME ZONE :timezone AS DATE) as log_date,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbohydrates) as total_carbs,
    SUM(fat) as total_fat
FROM nutrition_logs
WHERE client_id = :clientId
  AND logged_at >= :startUtc
  AND logged_at < :endUtc
GROUP BY log_date;
```

### Rationale
* **Precision**: Accurately maps food logs to the client's active calendar day.
* **Flexibility**: If the client travels to a different timezone, their historical logs dynamically adjust to their local context.

---

## 2. Approvals Hub Integration for Nutrition Targets

### Decision
Rather than creating a separate approvals database table for nutrition targets, we will reuse the existing `plan_modification_recommendations` table from the workouts module. 

We will define a custom payload type for the `proposed_changes` JSONB column:

```json
{
  "action": "ADJUST_NUTRITION_TARGETS",
  "targetCalories": 2500,
  "targetProtein": 180,
  "targetCarbs": 250,
  "targetFat": 80
}
```

When the client approves this recommendation:
1. The backend security controller intercepts the approval action.
2. It parses the target calories/macros from the JSON.
3. It updates the client's active record in the `nutrition_targets` table.
4. It marks the recommendation as `APPROVED`.

### Rationale
* **Reusability**: Avoids database sprawl and logic duplication.
* **Unified UI**: The mobile Approvals Hub tab can query a single endpoint (`/api/approvals/pending`) to display both workout modifications and nutrition target adjustments.
