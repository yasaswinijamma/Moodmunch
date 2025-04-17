package com.example.moodmunch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoodmunchApplication {

	public static void main(String[] args) {
		SpringApplication.run(MoodmunchApplication.class, args);
	}

	// If you have a CommandLineRunner or similar to seed data, fix it here
    /*
    @Bean
    public CommandLineRunner demo(RecipeService recipeService) {
        return args -> {
            // Example of corrected instantiation
            Recipe recipe = new Recipe("Test Recipe", "Happy", 30, "Flour, Sugar", "Mix and bake");
            recipeService.saveRecipe(recipe);
        };
    }
    */
}