# Validation Guide (Quickstart): LLM AI Gateway

This document describes how to verify the AI briefing and conversational chat REST endpoints.

---

## 1. REST Endpoint Test Requests

### Step 1: Request Daily Briefing (On-Demand)
Retrieve today's logs formatted as a natural language summary from the AI:
```bash
curl -X POST http://localhost:8080/api/ai/brief \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Europe/Bucharest"
  }'
```
Response:
```json
{
  "brief": "Today you consumed 450 calories (35.5g protein) which is toward your target of 2200 calories. You completed no workouts today. Keep up the consistency!"
}
```

### Step 2: Engage in RAG Conversational Chat
Ask a question grounded on your logs:
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Did I log any protein today?",
    "timezone": "Europe/Bucharest"
  }'
```
Response:
```json
{
  "response": "Yes, you logged 35.5g of protein today from your meal 'Oatmeal with Protein Powder'.",
  "contextUsed": "Daily Target Protein: 160g. Meals today: Oatmeal with Protein Powder - 450 kcal (35.5g protein)."
}
```

### Step 3: Coach checks client brief
Coach requests a brief for a linked client:
```bash
curl -X POST http://localhost:8080/api/ai/brief \
  -H "Authorization: Bearer $COACH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Europe/Bucharest",
    "client_id": "$CLIENT_UUID"
  }'
```
*Note: This fails with a 403 Security Exception if the coach is not linked to that client.*
