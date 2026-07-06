package com.rsfit.workouts.service;

import com.rsfit.workouts.entity.WorkoutLog;
import com.rsfit.workouts.entity.WorkoutLogSet;
import com.rsfit.workouts.repository.WorkoutLogRepository;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiGatewayService {

    @Autowired
    private ChatClient chatClient;

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String generateDailyBrief(UUID clientId, String timezone) {
        String context = compileContext(clientId, timezone);
        
        String systemInstruction = "You are RSFit, a certified personal trainer and sports nutritionist.\n" +
                "Ground your answers ONLY on the client's logs provided in the Context section below.\n" +
                "Do not make up workouts or meals. Keep the brief short, motivating, and professional (around 3-4 sentences).\n" +
                "If the context is empty, encourage the client in a friendly way to start logging their gym sessions and food entries.";

        String query = "Generate a daily brief summarizing my logs today.";
        String fullPromptText = systemInstruction + "\n\nContext:\n---\n" + context + "\n---\n\nUser Query: " + query;

        return chatClient.call(new Prompt(fullPromptText)).getResult().getOutput().getContent();
    }

    public String chatWithClient(UUID clientId, String message, String timezone) {
        String context = compileContext(clientId, timezone);

        String systemInstruction = "You are RSFit, a certified personal trainer and sports nutritionist.\n" +
                "Ground your answers ONLY on the client's logs provided in the Context section below.\n" +
                "If the user asks questions about their stats (e.g. protein or target calories), read it from the context.\n" +
                "For general fitness questions (e.g. how to build muscle), you can provide standard advice but link it back to their targets.";

        String fullPromptText = systemInstruction + "\n\nContext:\n---\n" + context + "\n---\n\nUser Query: " + message;

        return chatClient.call(new Prompt(fullPromptText)).getResult().getOutput().getContent();
    }

    public String compileContext(UUID clientId, String timezone) {
        StringBuilder sb = new StringBuilder();

        // 1. Fetch Nutrition targets
        List<Map<String, Object>> targets = jdbcTemplate.queryForList(
                "SELECT target_calories, target_protein, target_carbs, target_fat FROM nutrition_targets WHERE client_id = ? AND is_active = true",
                clientId
        );

        sb.append("Daily Targets:\n");
        if (!targets.isEmpty()) {
            Map<String, Object> target = targets.get(0);
            sb.append("- Calories: ").append(target.get("target_calories")).append(" kcal\n");
            sb.append("- Protein: ").append(target.get("target_protein")).append("g\n");
            sb.append("- Carbs: ").append(target.get("target_carbs")).append("g\n");
            sb.append("- Fat: ").append(target.get("target_fat")).append("g\n");
        } else {
            sb.append("- No daily nutrition targets set yet.\n");
        }
        sb.append("\n");

        // 2. Fetch Nutrition logs today
        List<Map<String, Object>> meals = jdbcTemplate.queryForList(
                "SELECT food_name, calories, protein, carbohydrates, fat FROM nutrition_logs " +
                        "WHERE client_id = ? AND CAST(logged_at AT TIME ZONE 'UTC' AT TIME ZONE ? AS DATE) = CAST(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE ? AS DATE)",
                clientId, timezone, timezone
        );

        sb.append("Logged Meals Today:\n");
        if (!meals.isEmpty()) {
            for (Map<String, Object> meal : meals) {
                sb.append("* ").append(meal.get("food_name")).append(" - ")
                        .append(meal.get("calories")).append(" kcal (")
                        .append(meal.get("protein")).append("g protein, ")
                        .append(meal.get("carbohydrates")).append("g carbs, ")
                        .append(meal.get("fat")).append("g fat)\n");
            }
        } else {
            sb.append("- No meals logged today.\n");
        }
        sb.append("\n");

        // 3. Fetch Workout logs today
        List<WorkoutLog> logs = workoutLogRepository.findByClientId(clientId);
        
        sb.append("Logged Workout Sessions Today:\n");
        boolean loggedWorkout = false;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");

        for (WorkoutLog log : logs) {
            if (log.getStartTime().toLocalDate().isEqual(LocalDateTime.now().toLocalDate())) {
                loggedWorkout = true;
                sb.append("* ").append(log.getName()).append(" (Status: ").append(log.getStatus()).append(") started at ")
                        .append(log.getStartTime().format(formatter)).append(".\n");
                
                sb.append("  Exercises completed:\n");
                if (log.getSets() != null && !log.getSets().isEmpty()) {
                    for (WorkoutLogSet set : log.getSets()) {
                        sb.append("    - ").append(set.getExerciseName()).append(": Set ").append(set.getSetIndex() + 1)
                                .append(" (").append(set.getReps()).append(" reps @ ").append(set.getWeight()).append(" kg)\n");
                    }
                } else {
                    sb.append("    - No sets logged yet.\n");
                }
            }
        }

        if (!loggedWorkout) {
            sb.append("- No workout sessions completed today.\n");
        }

        return sb.toString();
    }
}
