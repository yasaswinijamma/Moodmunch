package com.example.moodmunch.controller;

import com.example.moodmunch.model.Order;
import com.example.moodmunch.model.ShoppingListItem;
import com.example.moodmunch.model.ShoppingListItemId;
import com.example.moodmunch.model.User;
import com.example.moodmunch.repository.FavoriteRepository;
import com.example.moodmunch.repository.MealPlanRepository;
import com.example.moodmunch.repository.OrderRepository;
import com.example.moodmunch.repository.ShoppingListRepository;
import com.example.moodmunch.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private ShoppingListRepository shoppingListRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PutMapping("/shopping-list/toggle")
    public ResponseEntity<String> togglePurchased(@RequestParam String username, @RequestParam String ingredient) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only modify your own shopping list");
        }

        ShoppingListItemId id = new ShoppingListItemId(username, ingredient);
        ShoppingListItem item = shoppingListRepository.findById(id).orElse(null);
        if (item != null) {
            item.setPurchased(!item.isPurchased());
            shoppingListRepository.save(item);
            return ResponseEntity.ok("Updated purchased status");
        }
        return ResponseEntity.badRequest().body("Item not found");
    }

    @DeleteMapping("/shopping-list/delete")
    public ResponseEntity<String> deleteItem(@RequestParam String username, @RequestParam String ingredient) {
        String authenticatedUser = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authenticatedUser.equals(username)) {
            return ResponseEntity.status(403).body("Unauthorized: You can only modify your own shopping list");
        }

        ShoppingListItemId id = new ShoppingListItemId(username, ingredient);
        if (shoppingListRepository.existsById(id)) {
            shoppingListRepository.deleteById(id);
            return ResponseEntity.ok("Item deleted");
        }
        return ResponseEntity.badRequest().body("Item not found");
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || "anonymousUser".equals(username)) {
            return ResponseEntity.status(401).body("Please log in");
        }

        // Fetch user from the database
        Optional<User> userOptional = userRepository.findById(username);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOptional.get();

        // Fetch counts
        long favoriteCount = favoriteRepository.countByUsername(username);
        long mealPlanCount = mealPlanRepository.countByUsername(username);
        long shoppingListCount = shoppingListRepository.countByIdUsername(username);

        // Fetch order history
        List<Order> orders = orderRepository.findByUsername(username);

        // Parse flavors into a list
        String flavorsString = user.getFlavors();
        java.util.List<String> flavorsList = flavorsString != null && !flavorsString.isEmpty()
                ? Arrays.stream(flavorsString.split(","))
                .map(String::trim)
                .collect(Collectors.toList())
                : java.util.Collections.emptyList();

        // Prepare profile data
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("dateOfBirth", user.getDateOfBirth());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("address", user.getAddress());
        profile.put("bio", user.getBio() != null ? user.getBio() : "Not set");
        profile.put("favoriteCuisine", user.getFavoriteCuisine() != null ? user.getFavoriteCuisine() : "Not set");
        profile.put("favoriteCount", favoriteCount);
        profile.put("mealPlanCount", mealPlanCount);
        profile.put("shoppingListCount", shoppingListCount);
        profile.put("flavors", flavorsList);
        profile.put("orders", orders); // Add order history

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/users/profile")
    public ResponseEntity<?> getUserProfile() {
        logger.info("Received request to fetch user profile at /api/users/profile");

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (username == null || "anonymousUser".equals(username)) {
            logger.error("User is not authenticated");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        logger.info("Fetching profile for username: {}", username);

        // Fetch user from the database
        Optional<User> userOptional = userRepository.findById(username);
        if (!userOptional.isPresent()) {
            logger.error("User not found: {}", username);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + username);
        }

        User user = userOptional.get();
        logger.info("User found: username={}, role={}, email={}", user.getUsername(), user.getRole(), user.getEmail());

        // Prepare minimal profile data with role
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("role", user.getRole());
        profile.put("email", user.getEmail());

        return ResponseEntity.ok(profile);
    }
}