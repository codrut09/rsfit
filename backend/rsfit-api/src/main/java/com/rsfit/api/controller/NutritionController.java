package com.rsfit.api.controller;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.security.JwtUtils;
import com.rsfit.nutrition.entity.NutritionLog;
import com.rsfit.nutrition.service.NutritionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing or invalid authorization header");
        }
        String token = authHeader.substring(7);
        if (!jwtUtils.validateToken(token)) {
            throw new SecurityException("Invalid JWT token");
        }
        String email = jwtUtils.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Authenticated user not found"));
    }

    @PostMapping("/logs")
    public ResponseEntity<NutritionLog> logMeal(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {

        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can log meal entries");
        }

        String foodName = (String) request.get("foodName");
        Integer calories = (Integer) request.get("calories");
        BigDecimal protein = new BigDecimal(request.get("protein").toString());
        BigDecimal carbs = new BigDecimal(request.get("carbohydrates").toString());
        BigDecimal fat = new BigDecimal(request.get("fat").toString());

        if (foodName == null || calories == null) {
            throw new IllegalArgumentException("Fields foodName and calories are required");
        }

        NutritionLog log = nutritionService.logMeal(client.getId(), foodName, calories, protein, carbs, fat);
        return new ResponseEntity<>(log, HttpStatus.CREATED);
    }

    @Autowired
    private com.rsfit.coaching.service.CoachingService coachingService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "client_id", required = false) String clientIdStr,
            @RequestParam("timezone") String timezone) {

        User user = getAuthenticatedUser(authHeader);
        java.util.UUID targetClientId;

        if (clientIdStr != null) {
            targetClientId = java.util.UUID.fromString(clientIdStr);
            if (!user.getId().equals(targetClientId)) {
                if (!"COACH".equals(user.getRole().name())) {
                    throw new SecurityException("Only coaches can view other clients' records");
                }
                if (!coachingService.isLinked(user.getId(), targetClientId)) {
                    throw new SecurityException("Coach is not linked to this client");
                }
            }
        } else {
            if (!"CLIENT".equals(user.getRole().name())) {
                throw new IllegalArgumentException("Coaches must specify a client_id parameter");
            }
            targetClientId = user.getId();
        }

        Map<String, Object> summary = nutritionService.getDailySummary(targetClientId, timezone);
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @Autowired
    private com.rsfit.workouts.service.ApprovalsService approvalsService;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @PostMapping("/targets")
    public ResponseEntity<Map<String, Object>> proposeNutritionTargets(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) throws Exception {

        User coach = getAuthenticatedUser(authHeader);
        if (!"COACH".equals(coach.getRole().name())) {
            throw new SecurityException("Only coaches can recommend nutrition target changes");
        }

        String clientIdStr = (String) request.get("clientId");
        Map<String, Object> proposedChanges = (Map<String, Object>) request.get("proposedChanges");

        if (clientIdStr == null || proposedChanges == null) {
            throw new IllegalArgumentException("Fields clientId and proposedChanges are required");
        }

        java.util.UUID clientId = java.util.UUID.fromString(clientIdStr);
        String changesJson = objectMapper.writeValueAsString(proposedChanges);

        com.rsfit.workouts.entity.PlanModificationRecommendation rec = approvalsService.createRecommendation(
                coach.getId(), clientId, null, null, changesJson);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", rec.getId());
        response.put("status", rec.getStatus());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
