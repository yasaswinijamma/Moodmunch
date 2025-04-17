// src/main/java/com/example/moodmunch/service/FavoritesService.java
package com.example.moodmunch.service;

import com.example.moodmunch.model.Favorite;
import com.example.moodmunch.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoritesService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    public List<Favorite> getFavorites(String username) {
        return favoriteRepository.findByUsername(username);
    }

    @Transactional
    public void addFavorite(String username, String recipeId, String title, String image, Integer readyInMinutes) {
        Favorite favorite = new Favorite(username, recipeId, title, image, readyInMinutes);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String username, String recipeId) {
        favoriteRepository.deleteByUsernameAndRecipeId(username, recipeId);
    }

    public boolean existsByUsernameAndRecipeId(String username, String recipeId) {
        return favoriteRepository.existsByUsernameAndRecipeId(username, recipeId);
    }

    @Autowired
    public FavoritesService(FavoriteRepository favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
}