// src/main/java/com/example/moodmunch/repository/MealPlanRepository.java
package com.example.moodmunch.repository;

import com.example.moodmunch.model.MealPlanEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealPlanRepository extends JpaRepository<MealPlanEntity, Long> {
    List<MealPlanEntity> findByUsername(String username);
    long countByUsername(String username);
}