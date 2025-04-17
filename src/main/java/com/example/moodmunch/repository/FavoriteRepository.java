package com.example.moodmunch.repository;

import com.example.moodmunch.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUsernameAndRecipeId(String username, String recipeId);

    List<Favorite> findByUsername(String username);

    @Modifying
    @Query("DELETE FROM Favorite f WHERE f.username = :username AND f.recipeId = :recipeId")
    void deleteByUsernameAndRecipeId(String username, String recipeId);
    long countByUsername(String username);
}