// src/main/java/com/example/moodmunch/model/Favorite.java
package com.example.moodmunch.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "favorites")
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String recipeId;
    private String title;
    private String image;
    private Integer readyInMinutes;

    // Default constructor
    public Favorite() {}

    // Parameterized constructor
    public Favorite(String username, String recipeId, String title, String image, Integer readyInMinutes) {
        this.username = username;
        this.recipeId = recipeId;
        this.title = title;
        this.image = image;
        this.readyInMinutes = readyInMinutes;
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

    public String getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(String recipeId) {
        this.recipeId = recipeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getReadyInMinutes() {
        return readyInMinutes;
    }

    public void setReadyInMinutes(Integer readyInMinutes) {
        this.readyInMinutes = readyInMinutes;
    }

    @Override
    public String toString() {
        return "Favorite{id=" + id + ", username='" + username + "', recipeId='" + recipeId + "', title='" + title + "', image='" + image + "', readyInMinutes=" + readyInMinutes + "}";
    }
}