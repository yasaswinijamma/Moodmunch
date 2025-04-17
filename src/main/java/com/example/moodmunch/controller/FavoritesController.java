// src/main/java/com/example/moodmunch/controller/FavoritesController.java
package com.example.moodmunch.controller;

import com.example.moodmunch.model.Favorite;
import com.example.moodmunch.service.FavoritesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class FavoritesController {

    private static final Logger logger = LoggerFactory.getLogger(FavoritesController.class);

    @Autowired
    private FavoritesService favoritesService;

    @PostMapping(value = "/favorites", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<String> addFavorite(
            @RequestParam("recipeId") String recipeId,
            @RequestParam("title") String title,
            @RequestParam(value = "image", required = false) String image,
            @RequestParam(value = "readyInMinutes", required = false) Integer readyInMinutes
    ) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("POST /api/favorites - Authenticated User: {}, RecipeId: {}, Title: {}", username, recipeId, title);

        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/favorites - No authenticated user");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized: Please log in to add favorites");
        }

        if (recipeId == null || recipeId.trim().isEmpty()) {
            logger.warn("Invalid recipeId: {}", recipeId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Recipe ID is required");
        }

        if (title == null || title.trim().isEmpty()) {
            logger.warn("Invalid title: {}", title);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Title is required");
        }

        if (favoritesService.existsByUsernameAndRecipeId(username, recipeId)) {
            logger.info("Recipe {} already in favorites for user: {}", recipeId, username);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Recipe already in favorites for user: " + username);
        }

        try {
            favoritesService.addFavorite(username, recipeId, title, image, readyInMinutes);
            logger.info("Added to favorites: {} for user: {}", title, username);
            return ResponseEntity.ok("Added to favorites: " + title);
        } catch (Exception e) {
            logger.error("Error adding favorite for user {} with recipeId {}: {}", username, recipeId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add favorite: " + e.getMessage());
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Favorite>> getFavorites() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("GET /api/favorites - Authenticated User: {}", username);

        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/favorites - No authenticated user");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            List<Favorite> favorites = favoritesService.getFavorites(username);
            logger.info("Favorites retrieved for user {}: {}", username, favorites);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            logger.error("Error retrieving favorites for user {}: {}", username, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/favorites")
    public ResponseEntity<Map<String, Object>> removeFavorite(@RequestParam("recipeId") String recipeId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        logger.info("DELETE /api/favorites - Authenticated User: {}, RecipeId: {}", username, recipeId);

        if (username == null || "anonymousUser".equals(username)) {
            logger.warn("Unauthorized access to /api/favorites - No authenticated user");
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Unauthorized: Please log in to remove favorites");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        try {
            favoritesService.removeFavorite(username, recipeId);
            logger.info("Removed recipe {} from favorites for user: {}", recipeId, username);
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Removed recipe " + recipeId + " from favorites for user: " + username);
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            logger.error("Error removing favorite for user {} with recipeId {}: {}", username, recipeId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to remove favorite: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}