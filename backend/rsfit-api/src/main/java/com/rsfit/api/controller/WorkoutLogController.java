package com.rsfit.api.controller;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.security.JwtUtils;
import com.rsfit.workouts.entity.WorkoutLog;
import com.rsfit.workouts.entity.WorkoutLogSet;
import com.rsfit.workouts.service.WorkoutLoggingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/workouts/logs")
public class WorkoutLogController {

    @Autowired
    private WorkoutLoggingService loggingService;

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

    @PostMapping
    public ResponseEntity<Map<String, Object>> startLog(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {

        User client = getAuthenticatedUser(authHeader);
        String name = (String) body.get("name");
        String planIdStr = (String) body.get("planId");

        if (name == null) {
            throw new IllegalArgumentException("Field name is required");
        }

        UUID planId = planIdStr != null ? UUID.fromString(planIdStr) : null;

        WorkoutLog log = loggingService.startWorkoutLog(client.getId(), planId, name);

        Map<String, Object> response = new HashMap<>();
        response.put("id", log.getId());
        response.put("name", log.getName());
        response.put("status", log.getStatus());
        response.put("startTime", log.getStartTime());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/sets")
    public ResponseEntity<Map<String, String>> upsertSets(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") String logIdStr,
            @RequestBody Map<String, Object> body) {

        getAuthenticatedUser(authHeader); // Validate token
        UUID logId = UUID.fromString(logIdStr);
        String exerciseName = (String) body.get("exerciseName");
        List<Map<String, Object>> setsList = (List<Map<String, Object>>) body.get("sets");

        if (exerciseName == null || setsList == null) {
            throw new IllegalArgumentException("Fields exerciseName and sets are required");
        }

        List<WorkoutLogSet> sets = new ArrayList<>();
        for (Map<String, Object> setMap : setsList) {
            WorkoutLogSet set = WorkoutLogSet.builder()
                    .setIndex((Integer) setMap.get("setIndex"))
                    .reps((Integer) setMap.get("reps"))
                    .weight(new BigDecimal(setMap.get("weight").toString()))
                    .completed(setMap.containsKey("completed") ? (Boolean) setMap.get("completed") : true)
                    .build();
            sets.add(set);
        }

        loggingService.upsertSets(logId, exerciseName, sets);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Sets logged successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<Map<String, Object>> finishLog(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") String logIdStr) {

        getAuthenticatedUser(authHeader); // Validate token
        UUID logId = UUID.fromString(logIdStr);

        WorkoutLog log = loggingService.finishWorkoutLog(logId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", log.getId());
        response.put("status", log.getStatus());
        response.put("endTime", log.getEndTime());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutLog>> getLogs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User client = getAuthenticatedUser(authHeader);
        List<WorkoutLog> logs = loggingService.getWorkoutLogsByClient(client.getId());
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }
}
