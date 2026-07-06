package com.rsfit.workouts.config;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.Generation;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class AiConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.ai.vertex.ai.gemini.api-key", matchIfMissing = true, havingValue = "")
    public ChatClient mockChatClient() {
        return new ChatClient() {
            @Override
            public ChatResponse call(Prompt prompt) {
                String instruction = prompt.getInstructions().get(0).getContent();
                String summary = generateMockResponse(instruction);
                return new ChatResponse(List.of(new Generation(summary)));
            }
        };
    }

    private String generateMockResponse(String promptText) {
        if (promptText.contains("summarize my logs today") || promptText.contains("brief")) {
            return "Mock AI Brief: Today you consumed calories/macronutrients and completed workout logs based on your uploaded context. Keep up the active tracking!";
        }
        return "Mock AI Answer: You asked about your progress. Based on your active targets, your diet logging is aligned and healthy. Keep up the good work!";
    }
}
