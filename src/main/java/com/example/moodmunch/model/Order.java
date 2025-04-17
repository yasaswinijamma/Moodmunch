// src/main/java/com/example/moodmunch/model/Order.java
package com.example.moodmunch.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String orderNumber;
    private LocalDateTime orderDate;

    @ElementCollection
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "item")
    private List<String> items; // Stores "ingredient:quantity" pairs

    // Constructors
    public Order() {}

    public Order(String username, String orderNumber, LocalDateTime orderDate, List<String> items) {
        this.username = username;
        this.orderNumber = orderNumber;
        this.orderDate = orderDate;
        this.items = items;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public List<String> getItems() { return items; }
    public void setItems(List<String> items) { this.items = items; }
}