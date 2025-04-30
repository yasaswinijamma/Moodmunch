package com.example.moodmunch.controller;

import com.example.moodmunch.model.Order;
import com.example.moodmunch.repository.UserRepository;
import com.example.moodmunch.repository.OrderRepository;
import com.example.moodmunch.repository.MealPlanRepository;
import com.example.moodmunch.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminController.class);

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats(Authentication authentication) {
        log.info("Received request to fetch admin stats at /api/admin/stats");
        String username = authentication.getName();
        log.info("Fetching stats for admin user: {}", username);

        Map<String, Object> stats = new HashMap<>();

        // Total Users
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);

        // Total Orders
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);

        // Total Meal Plans
        long totalMealPlans = mealPlanRepository.count();
        stats.put("totalMealPlans", totalMealPlans);

        // Total Favorites
        long totalFavorites = favoriteRepository.count();
        stats.put("totalFavorites", totalFavorites);

        // Average Orders Per User
        double averageOrdersPerUser = totalUsers > 0 ? (double) totalOrders / totalUsers : 0;
        stats.put("averageOrdersPerUser", Math.round(averageOrdersPerUser * 100.0) / 100.0);

        // Recent Orders (Top 5, sorted by date descending)
        List<Order> recentOrders = orderRepository.findAll(
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "orderDate"))
        ).getContent();
        stats.put("recentOrders", recentOrders);

        // Top Users by Orders (Top 5)
        List<Map<String, Object>> topUsersByOrders = orderRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        Order::getUsername,
                        Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> userStats = new HashMap<>();
                    userStats.put("username", entry.getKey());
                    userStats.put("orderCount", entry.getValue());
                    return userStats;
                })
                .collect(Collectors.toList());
        stats.put("topUsersByOrders", topUsersByOrders);

        log.info("Admin stats fetched successfully: {}", stats);
        return ResponseEntity.ok(stats);
    }
}