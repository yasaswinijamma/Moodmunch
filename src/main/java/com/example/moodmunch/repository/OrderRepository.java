// src/main/java/com/example/moodmunch/repository/OrderRepository.java
package com.example.moodmunch.repository;

import com.example.moodmunch.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUsername(String username);
}