package com.rsfit.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.security.JwtUtils;
import com.rsfit.workouts.entity.PlanModificationRecommendation;
import com.rsfit.workouts.service.ApprovalsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalsController {

    @Autowired
    private ApprovalsService approvalsService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    @PostMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> proposeRecommendation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) throws Exception {

        User coach = getAuthenticatedUser(authHeader);
        if (!"COACH".equals(coach.getRole().name())) {
            throw new SecurityException("Only coaches can make plan/log recommendations");
        }

        String clientIdStr = (String) request.get("clientId");
        String planIdStr = (String) request.get("planId");
        String logIdStr = (String) request.get("logId");
        Map<String, Object> proposedChanges = (Map<String, Object>) request.get("proposedChanges");

        if (clientIdStr == null || proposedChanges == null) {
            throw new IllegalArgumentException("Fields clientId and proposedChanges are required");
        }

        UUID clientId = UUID.fromString(clientIdStr);
        UUID planId = planIdStr != null ? UUID.fromString(planIdStr) : null;
        UUID logId = logIdStr != null ? UUID.fromString(logIdStr) : null;
        String changesJson = objectMapper.writeValueAsString(proposedChanges);

        PlanModificationRecommendation rec = approvalsService.createRecommendation(
                coach.getId(), clientId, planId, logId, changesJson);

        Map<String, Object> response = new HashMap<>();
        response.put("id", rec.getId());
        response.put("status", rec.getStatus());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PlanModificationRecommendation>> getPending(
            @RequestHeader("Authorization") String authHeader) {

        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can retrieve pending recommendations");
        }

        List<PlanModificationRecommendation> list = approvalsService.getPendingRecommendationsForClient(client.getId());
        return new ResponseEntity<>(list, HttpStatus.OK);
    }

    @PostMapping("/recommendations/{id}/action")
    public ResponseEntity<Map<String, Object>> actOnRecommendation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") String recommendationIdStr,
            @RequestBody Map<String, String> request) {

        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can act on recommendations");
        }

        UUID recId = UUID.fromString(recommendationIdStr);
        String action = request.get("action");

        if (action == null) {
            throw new IllegalArgumentException("Field action is required");
        }

        PlanModificationRecommendation rec = approvalsService.respondToRecommendation(recId, action);

        Map<String, Object> response = new HashMap<>();
        response.put("id", rec.getId());
        response.put("status", rec.getStatus());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
