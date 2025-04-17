package com.example.moodmunch.controller;

import com.example.moodmunch.service.SpoonacularService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RecipeController {
    @Autowired
    private SpoonacularService spoonacularService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/recipes/mood/{mood}")
    public ResponseEntity<String> getRecipesByMood(
            @PathVariable String mood,
            @RequestParam(defaultValue = "25") int number,
            @RequestParam(required = false) Integer maxReadyTime,
            @RequestParam(defaultValue = "0") Integer offset,
            @RequestParam(required = false) String diet,
            @RequestParam(required = false) String intolerances,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer maxCalories
    ) throws IOException {
        if (mood == null || mood.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mood parameter is required");
        }
        return ResponseEntity.ok(spoonacularService.getRecipesByMood(mood, number, maxReadyTime, offset, diet, intolerances, type, maxCalories));
    }

    @GetMapping("/recipes/search")
    public ResponseEntity<String> searchRecipes(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String ingredient,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String mood,
            @RequestParam(required = false) String diet,
            @RequestParam(required = false) String intolerances,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "25") int number,
            @RequestParam(required = false) Integer maxCalories,
            @RequestParam(required = false) Integer maxReadyTime,
            @RequestParam(defaultValue = "0") Integer offset
    ) throws IOException {
        return ResponseEntity.ok(spoonacularService.searchRecipes(
                query, ingredient, cuisine, mood, diet, intolerances, type, number, maxCalories, maxReadyTime, offset
        ));
    }

    @GetMapping("/recipes/{id}")
    public ResponseEntity<String> getRecipeDetails(@PathVariable String id) throws IOException {
        return ResponseEntity.ok(spoonacularService.getRecipeDetails(id));
    }

    @GetMapping("/recipes/random")
    public ResponseEntity<?> getRandomRecipe(
            @RequestParam(required = false) String mood,
            @RequestParam(required = false) Integer maxReadyTime
    ) throws IOException {
        try {
            if (mood != null && !mood.isEmpty()) {
                Integer timeLimit = maxReadyTime != null ? maxReadyTime : (mood != null ? 30 : null);
                String jsonResponse = spoonacularService.fetchRandomRecipeByMood(mood, timeLimit);
                Map<String, Object> recipeData = objectMapper.readValue(jsonResponse, Map.class);
                List<Map<String, Object>> recipes = (List<Map<String, Object>>) recipeData.get("recipes");
                if (recipes == null || recipes.isEmpty()) {
                    return ResponseEntity.status(500).body("No recipes found in response");
                }
                Map<String, Object> recipe = recipes.get(0);
                Map<String, Object> response = new HashMap<>();
                response.put("image", recipe.get("image"));
                response.put("title", recipe.get("title"));
                response.put("readyInMinutes", recipe.get("readyInMinutes"));
                return ResponseEntity.ok(response);
            } else {
                String jsonResponse = spoonacularService.getRandomRecipe();
                return ResponseEntity.ok(jsonResponse);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    @GetMapping("/random-spin")
    public ResponseEntity<String> getRandomRecipe() throws IOException {
        String response = spoonacularService.getRandomRecipe();
        return ResponseEntity.ok(response);
    }
}