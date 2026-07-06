package com.rsfit.api.controller;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.security.JwtUtils;
import com.rsfit.coaching.entity.CoachClientRelationship;
import com.rsfit.coaching.service.CoachingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/coaching")
public class CoachingController {

    @Autowired
    private CoachingService coachingService;

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

    @PostMapping("/invite")
    public ResponseEntity<CoachClientRelationship> inviteClient(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        User coach = getAuthenticatedUser(authHeader);
        if (!"COACH".equals(coach.getRole().name())) {
            throw new SecurityException("Only coaches can invite clients");
        }

        String clientEmail = request.get("email");
        if (clientEmail == null) {
            throw new IllegalArgumentException("Field email is required");
        }

        CoachClientRelationship rel = coachingService.inviteClient(coach.getId(), clientEmail);
        return new ResponseEntity<>(rel, HttpStatus.CREATED);
    }

    @PostMapping("/accept")
    public ResponseEntity<CoachClientRelationship> acceptInvitation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> request) {

        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can accept invitations");
        }

        String coachIdStr = request.get("coachId");
        if (coachIdStr == null) {
            throw new IllegalArgumentException("Field coachId is required");
        }

        CoachClientRelationship rel = coachingService.acceptInvitation(client.getId(), UUID.fromString(coachIdStr));
        return new ResponseEntity<>(rel, HttpStatus.OK);
    }

    @GetMapping("/clients")
    public ResponseEntity<List<CoachClientRelationship>> getClients(@RequestHeader("Authorization") String authHeader) {
        User coach = getAuthenticatedUser(authHeader);
        if (!"COACH".equals(coach.getRole().name())) {
            throw new SecurityException("Only coaches can retrieve client rosters");
        }
        List<CoachClientRelationship> clients = coachingService.getClientsForCoach(coach.getId());
        return new ResponseEntity<>(clients, HttpStatus.OK);
    }

    @GetMapping("/coaches")
    public ResponseEntity<List<CoachClientRelationship>> getCoaches(@RequestHeader("Authorization") String authHeader) {
        User client = getAuthenticatedUser(authHeader);
        if (!"CLIENT".equals(client.getRole().name())) {
            throw new SecurityException("Only clients can retrieve coach links");
        }
        List<CoachClientRelationship> coaches = coachingService.getCoachesForClient(client.getId());
        return new ResponseEntity<>(coaches, HttpStatus.OK);
    }
}
