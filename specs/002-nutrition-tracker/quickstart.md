# Validation Guide (Quickstart): Nutrition Tracker

This document describes how to verify the nutrition tracking database queries, aggregates, and approvals flows.

---

## 1. REST Endpoint Test Requests

### Step 1: Client logs a meal entry
```bash
curl -X POST http://localhost:8080/api/nutrition/logs \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodName": "Oatmeal with Protein Powder",
    "calories": 450,
    "protein": 35.5,
    "carbohydrates": 55.0,
    "fat": 8.0
  }'
```

### Step 2: Retrieve daily aggregates vs targets
Query daily statistics (including target goals, if configured):
```bash
curl -X GET "http://localhost:8080/api/nutrition/summary?timezone=Europe/Bucharest" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```
Response contains:
```json
{
  "aggregates": {
    "calories": 450,
    "protein": 35.5,
    "carbohydrates": 55.0,
    "fat": 8.0
  },
  "targets": null
}
```

### Step 3: Coach proposes a target goal adjustment
Coach recommends a target goal setting:
```bash
curl -X POST http://localhost:8080/api/nutrition/targets \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "$CLIENT_UUID",
    "proposedChanges": {
      "action": "ADJUST_NUTRITION_TARGETS",
      "targetCalories": 2200,
      "targetProtein": 160,
      "targetCarbs": 220,
      "targetFat": 70
    }
  }'
```
*Note the returned recommendation ID: `$REC_ID`.*

### Step 4: Client approves targets via the Approvals Hub
Client accepts the coach's suggested targets from their mobile device:
```bash
curl -X POST http://localhost:8080/api/approvals/recommendations/$REC_ID/action \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "APPROVE"}'
```

### Step 5: Verify updated summary targets
Run summary query again. The target constraints should now be set:
```bash
curl -X GET "http://localhost:8080/api/nutrition/summary?timezone=Europe/Bucharest" \
  -H "Authorization: Bearer $CLIENT_TOKEN"
```
Response will now contain the active goals:
```json
{
  "aggregates": { "calories": 450, "protein": 35.5, "carbohydrates": 55.0, "fat": 8.0 },
  "targets": { "calories": 2200, "protein": 160, "carbohydrates": 220, "fat": 70 }
}
```
