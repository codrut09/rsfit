package com.rsfit.api.controller;

import com.rsfit.auth.entity.User;
import com.rsfit.auth.repository.UserRepository;
import com.rsfit.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");

        if (email == null || password == null || role == null) {
            throw new IllegalArgumentException("Fields email, password, and role are required");
        }

        User user = authService.registerUser(email, password, role);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            throw new IllegalArgumentException("Fields email and password are required");
        }

        String token = authService.authenticateUser(email, password);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("tokenType", "Bearer");

        // Fetch user from DB to include role in response
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        response.put("role", user.getRole().name());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
