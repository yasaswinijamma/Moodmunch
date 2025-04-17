// src/main/java/com/example/moodmunch/model/ShoppingListItemId.java
package com.example.moodmunch.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ShoppingListItemId implements Serializable {
    private String username;
    private String ingredient;

    public ShoppingListItemId() {}

    public ShoppingListItemId(String username, String ingredient) {
        this.username = username;
        this.ingredient = ingredient;
    }

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getIngredient() { return ingredient; }
    public void setIngredient(String ingredient) { this.ingredient = ingredient; }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ShoppingListItemId that = (ShoppingListItemId) o;
        return Objects.equals(username, that.username) &&
                Objects.equals(ingredient, that.ingredient);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, ingredient);
    }
}