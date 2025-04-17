package com.example.moodmunch.model;

public class Recipe {
    private Long id;
    private String name;
    private String mood;
    private Integer prepTime;
    private String ingredients;
    private String steps;
    private String image; // New field

    public Recipe() {}

    public Recipe(String name, String mood, Integer prepTime, String ingredients, String steps) {
        this.name = name;
        this.mood = mood;
        this.prepTime = prepTime;
        this.ingredients = ingredients;
        this.steps = steps;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    public Integer getPrepTime() { return prepTime; }
    public void setPrepTime(Integer prepTime) { this.prepTime = prepTime; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String ingredients) { this.ingredients = ingredients; }
    public String getSteps() { return steps; }
    public void setSteps(String steps) { this.steps = steps; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}