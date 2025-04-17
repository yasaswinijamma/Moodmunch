// src/main/java/com/example/moodmunch/model/ShoppingListItem.java
package com.example.moodmunch.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.EmbeddedId;

@Entity
@Table(name = "shopping_list_item")
public class ShoppingListItem {
    @EmbeddedId
    private ShoppingListItemId id;

    private int quantity; // Added field for quantity
    private boolean purchased = false; // Existing purchased field

    public ShoppingListItem() {}

    public ShoppingListItem(String username, String ingredient) {
        this.id = new ShoppingListItemId(username, ingredient);
        this.quantity = 1; // Default quantity
    }

    // Getters and Setters
    public ShoppingListItemId getId() { return id; }
    public void setId(ShoppingListItemId id) { this.id = id; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public boolean isPurchased() { return purchased; }
    public void setPurchased(boolean purchased) { this.purchased = purchased; }

    // Convenience methods
    public String getUsername() { return id.getUsername(); }
    public String getIngredient() { return id.getIngredient(); }
}