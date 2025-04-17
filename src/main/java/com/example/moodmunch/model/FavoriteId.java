package com.example.moodmunch.model;

import java.io.Serializable;
import java.util.Objects;

public class FavoriteId implements Serializable {
    private String username;
    private String recipeId;

    public FavoriteId() {}
    public FavoriteId(String username, String recipeId) {
        this.username = username;
        this.recipeId = recipeId;
    }
    // Getters, setters, equals, hashCode

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        FavoriteId that = (FavoriteId) o;
        return Objects.equals(username, that.username) && Objects.equals(recipeId, that.recipeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, recipeId);
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
}