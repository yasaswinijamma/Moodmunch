// src/main/java/com/example/moodmunch/controller/AuthController.java
package com.example.moodmunch.controller;

import com.example.moodmunch.model.User;
import com.example.moodmunch.repository.UserRepository;
import com.example.moodmunch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping(value = "/register", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<String> register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String dateOfBirth,
            @RequestParam String phoneNumber,
            @RequestParam String address,
            @RequestParam String bio,
            @RequestParam String favoriteCuisine,
            @RequestParam String flavors // Comma-separated string, e.g., "Spicy,Savory,Tangy"
    ) {
        // Check if username already exists
        if (userRepository.findById(username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Parse date of birth
        LocalDate dob;
        try {
            dob = LocalDate.parse(dateOfBirth, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid date format");
        }

        // Create new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // Hash the password
        user.setRole("USER"); // Default role
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDateOfBirth(dob);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setBio(bio);
        user.setFavoriteCuisine(favoriteCuisine);
        user.setFlavors(flavors);

        // Save user to database
        userRepository.save(user);

        return ResponseEntity.ok("Registered successfully");
    }

    @GetMapping("/home")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("Welcome to MoodMunch!");
    }

    // Spring Security handles /api/login and /api/logout, but we can add custom logic if needed
    @PostMapping("/login")
    public ResponseEntity<String> login(HttpSession session) {
        // This endpoint is processed by Spring Security's form login
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        session.setAttribute("username", username); // Store username in session
        return ResponseEntity.ok("Login successful");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        // This endpoint is handled by Spring Security's logout configuration
        session.invalidate();
        return ResponseEntity.ok("Logout successful");
    }

    @GetMapping("/check-session")
    public ResponseEntity<String> checkSession(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username != null && SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("Session check successful for user: " + username + ", Session ID: " + session.getId());
            return ResponseEntity.ok("Session valid for user: " + username);
        }
        System.out.println("Session check failed, username: " + username + ", Session ID: " + (session != null ? session.getId() : "none"));
        return ResponseEntity.status(401).body("Session invalid");
    }
}