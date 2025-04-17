// src/main/java/com/example/moodmunch/model/MealPlanEntity.java
package com.example.moodmunch.model;

import jakarta.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "meal_plans")
public class MealPlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @ElementCollection
    @MapKeyColumn(name = "day")
    @Column(name = "meals", columnDefinition = "TEXT")
    @CollectionTable(name = "meal_plan_meals", joinColumns = @JoinColumn(name = "meal_plan_id"))
    private Map<String, String> meals = new HashMap<>(); // Map of day to JSON string of meals

    // Constructors
    public MealPlanEntity() {}

    public MealPlanEntity(String username, Map<String, String> meals) {
        this.username = username;
        this.meals = meals;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Map<String, String> getMeals() {
        return meals;
    }

    public void setMeals(Map<String, String> meals) {
        this.meals = meals;
    }

    @Override
    public String toString() {
        return "MealPlanEntity{id=" + id + ", username='" + username + "', meals=" + meals + "}";
    }
}