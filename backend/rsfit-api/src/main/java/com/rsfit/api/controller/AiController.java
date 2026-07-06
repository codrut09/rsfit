package com.rsfit.api.controller;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.security.JwtUtils;
import com.rsfit.coaching.service.CoachingService;
import com.rsfit.workouts.service.AiGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiGatewayService aiGatewayService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoachingService coachingService;

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

    @PostMapping("/brief")
    public ResponseEntity<Map<String, Object>> getDailyBrief(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        User user = getAuthenticatedUser(authHeader);
        String timezone = request.get("timezone");
        String clientIdStr = request.get("client_id");

        if (timezone == null) {
            throw new IllegalArgumentException("Field timezone is required");
        }

        UUID targetClientId;

        if (clientIdStr != null) {
            targetClientId = UUID.fromString(clientIdStr);
            if (!user.getId().equals(targetClientId)) {
                if (!"COACH".equals(user.getRole().name())) {
                    throw new SecurityException("Only coaches can query other clients' briefs");
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

        String brief = aiGatewayService.generateDailyBrief(targetClientId, timezone);

        Map<String, Object> response = new HashMap<>();
        response.put("brief", brief);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithClient(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can converse with the trainer chat");
        }

        String message = request.get("message");
        String timezone = request.get("timezone");

        if (message == null || timezone == null) {
            throw new IllegalArgumentException("Fields message and timezone are required");
        }

        String aiResponse = aiGatewayService.chatWithClient(client.getId(), message, timezone);
        String contextUsed = aiGatewayService.compileContext(client.getId(), timezone);

        Map<String, Object> response = new HashMap<>();
        response.put("response", aiResponse);
        response.put("contextUsed", contextUsed);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
