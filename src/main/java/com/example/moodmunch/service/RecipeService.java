package com.example.moodmunch.service;

import org.springframework.stereotype.Service;

@Service
public class RecipeService {
    // No Spoonacular API key needed; placeholder for future backend logic if required
    public String getRecipesByMood(String mood) {
        return "Recipes for mood: " + mood; // Stub for now
    }
}