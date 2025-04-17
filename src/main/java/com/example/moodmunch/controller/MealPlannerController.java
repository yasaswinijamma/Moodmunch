// src/main/java/com/example/moodmunch/controller/MealPlannerController.java
package com.example.moodmunch.controller;

import com.example.moodmunch.model.MealPlanEntity;
import com.example.moodmunch.repository.MealPlanRepository;
import com.example.moodmunch.service.SpoonacularService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class MealPlannerController {

    private static final Logger logger = LoggerFactory.getLogger(MealPlannerController.class);

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private SpoonacularService spoonacularService;

    @GetMapping("/meal-planner")
    public ResponseEntity<List<MealPlanEntity>> getMealPlan() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("GET /api/meal-planner - Username: {}", username);
        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/meal-planner for username: {}", username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<MealPlanEntity> mealPlans = mealPlanRepository.findByUsername(username);
        logger.info("Meal plans retrieved for user {}: {}", username, mealPlans);
        return ResponseEntity.ok(mealPlans);
    }

    @PostMapping("/meal-planner")
    public ResponseEntity<MealPlanEntity> addMealPlan(@RequestBody MealPlanEntity mealPlan) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("POST /api/meal-planner - Username: {}", username);
        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/meal-planner for username: {}", username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        mealPlan.setUsername(username);
        MealPlanEntity savedMealPlan = mealPlanRepository.save(mealPlan);
        logger.info("Added meal plan for user {}: {}", username, savedMealPlan);
        return ResponseEntity.ok(savedMealPlan);
    }

    @GetMapping("/spoonacular/mealplanner/generate")
    public ResponseEntity<String> generateMealPlan(
            @RequestParam String timeFrame,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String diet,
            @RequestParam(required = false) String targetCalories) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("GET /api/spoonacular/mealplanner/generate - Username: {}", username);
        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/spoonacular/mealplanner/generate for username: {}", username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"Unauthorized access\"}");
        }

        logger.info("Generating meal plan with timeFrame: {}, cuisine: {}, diet: {}, targetCalories: {}",
                timeFrame, cuisine, diet, targetCalories);
        try {
            String response = spoonacularService.generateMealPlan(timeFrame, cuisine, diet, targetCalories);
            logger.info("Successfully generated meal plan for user {}: {}", username, response);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Error generating meal plan for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to generate meal plan: " + e.getMessage() + "\"}");
        }
    }
}