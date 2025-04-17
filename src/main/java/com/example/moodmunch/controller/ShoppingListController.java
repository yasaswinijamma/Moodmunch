// src/main/java/com/example/moodmunch/controller/ShoppingListController.java
package com.example.moodmunch.controller;

import com.example.moodmunch.model.Order;
import com.example.moodmunch.model.ShoppingListItem;
import com.example.moodmunch.model.ShoppingListItemId;
import com.example.moodmunch.repository.OrderRepository;
import com.example.moodmunch.repository.ShoppingListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ShoppingListController {

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/shopping-list")
    public ResponseEntity<String> addToShoppingList(
            @RequestParam("username") String username,
            @RequestParam("ingredient") String ingredient
    ) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only modify your own shopping list");
        }

        ShoppingListItemId id = new ShoppingListItemId(username, ingredient);
        ShoppingListItem item = shoppingListRepository.findById(id).orElse(null);
        if (item != null) {
            // Item already exists, increment quantity
            item.setQuantity(item.getQuantity() + 1);
        } else {
            // New item
            item = new ShoppingListItem(username, ingredient);
            item.setQuantity(1);
        }
        shoppingListRepository.save(item);
        return ResponseEntity.ok("Added to shopping list: " + ingredient);
    }

    @GetMapping("/shopping-list")
    public ResponseEntity<List<ShoppingListItem>> getShoppingList(@RequestParam("username") String username) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body(new ArrayList<ShoppingListItem>());
        }

        List<ShoppingListItem> items = shoppingListRepository.findByIdUsername(username);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/shopping-list/increase-quantity")
    public ResponseEntity<String> increaseQuantity(
            @RequestParam("username") String username,
            @RequestParam("ingredient") String ingredient
    ) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only modify your own shopping list");
        }

        ShoppingListItemId id = new ShoppingListItemId(username, ingredient);
        ShoppingListItem item = shoppingListRepository.findById(id).orElse(null);
        if (item != null) {
            item.setQuantity(item.getQuantity() + 1);
            shoppingListRepository.save(item);
            return ResponseEntity.ok("Quantity increased for: " + ingredient);
        }
        return ResponseEntity.badRequest().body("Item not found: " + ingredient);
    }

    @DeleteMapping("/shopping-list/remove")
    public ResponseEntity<String> removeItem(
            @RequestParam("username") String username,
            @RequestParam("ingredient") String ingredient
    ) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only modify your own shopping list");
        }

        ShoppingListItemId id = new ShoppingListItemId(username, ingredient);
        if (shoppingListRepository.existsById(id)) {
            shoppingListRepository.deleteById(id);
            return ResponseEntity.ok("Removed from shopping list: " + ingredient);
        }
        return ResponseEntity.badRequest().body("Item not found: " + ingredient);
    }

    @PostMapping("/shopping-list/place-order")
    public ResponseEntity<String> placeOrder(@RequestParam("username") String username) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only place orders for your own shopping list");
        }

        List<ShoppingListItem> items = shoppingListRepository.findByIdUsername(username);
        if (items.isEmpty()) {
            return ResponseEntity.badRequest().body("Shopping list is empty");
        }

        // Generate a unique order number
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Convert items to a list of "ingredient:quantity" strings
        List<String> orderItems = items.stream()
                .map(item -> item.getIngredient() + ":" + item.getQuantity())
                .collect(Collectors.toList());

        // Create and save the order
        Order order = new Order(username, orderNumber, LocalDateTime.now(), orderItems);
        orderRepository.save(order);

        // Clear the shopping list
        shoppingListRepository.deleteAll(items);

        String message = "Order placed successfully. Order number: " + orderNumber;
        return ResponseEntity.ok(message);
    }
}