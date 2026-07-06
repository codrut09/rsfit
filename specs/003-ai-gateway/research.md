# Research Notes: LLM AI Gateway & RAG Chat

This document details the configuration properties, prompt grounding design, and mock fallbacks for the AI Gateway.

---

## 1. Spring AI Gemini Configuration

To interface with Google Gemini Pro, we declare the Vertex AI Gemini starter. The configurations inside `application.yml` are defined as follows:

```yaml
spring:
  ai:
    vertex:
      ai:
        gemini:
          project-id: ${SPRING_AI_VERTEX_PROJECT_ID:rsfit-app}
          location: ${SPRING_AI_VERTEX_LOCATION:us-central1}
          api-key: ${SPRING_AI_VERTEX_AI_GEMINI_API_KEY:}
          model: gemini-pro
```

---

## 2. RAG Prompt Grounding Design

During briefing or conversational chat, the backend compiles the database records for the requested date, structures them as context, and injects them into the prompt.

### Prompt Template Structure
```text
System Prompt:
You are RSFit, a certified personal trainer and sports nutritionist.
Ground your answers ONLY on the client's logs provided in the Context section below. 
Do not make up workouts or meals. If the context is empty, encourage the client in a friendly way to start logging their gym sessions and food entries.

Context:
---
Daily Targets:
* Target Calories: {targetCalories} kcal
* Target Protein: {targetProtein}g

Logged Meals:
{nutritionLogs}

Logged Workout Sessions:
{workoutLogs}
---

User Query: {query}
```

### Context Formatting Rules
* **Nutrition logs**: Formatted as a bulleted list: `* [Time] Food Name - Calories kcal (Protein g, Carbs g, Fat g)`.
* **Workout logs**: Formatted as: `* Workout Name (Status) completed at [Time]. Exercises: [Name]: Set 1 (reps @ weight), Set 2...`.

---

## 3. Conditional Mock Fallback ChatClient

To ensure the backend builds and runs successfully in local developer environments without throwing startup exceptions when the Gemini API key is absent, we configure a mock fallback bean:

```java
@Configuration
public class AiConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.ai.vertex.ai.gemini.api-key", matchIfMissing = true, havingValue = "")
    public ChatClient mockChatClient() {
        return new ChatClient() {
            @Override
            public ChatResponse call(Prompt prompt) {
                // Return a mock generated brief summarizing the injected prompt context
                String content = prompt.getInstructions().get(0).getContent();
                String summary = generateMockSummary(content);
                return new ChatResponse(List.of(new Generation(summary)));
            }
        };
    }
}
```

### Mock summary logic:
* Checks the prompt context string.
* If it detects calories/workout records, it summarizes them locally (e.g. *"Mock Summary: Today you consumed X kcal and completed exercise Y."*).
* Prevents external network requests, enabling rapid local endpoint testing.
