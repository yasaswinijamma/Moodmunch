package com.example.moodmunch.repository;

import com.example.moodmunch.model.ShoppingListItem;
import com.example.moodmunch.model.ShoppingListItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingListItem, ShoppingListItemId> {
    List<ShoppingListItem> findByIdUsername(String username);// Corrected method name
    long countByIdUsername(String username);
}