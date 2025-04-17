// src/main/java/com/example/moodmunch/service/SpoonacularService.java
package com.example.moodmunch.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class SpoonacularService {
    private static final Logger logger = LoggerFactory.getLogger(SpoonacularService.class);
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${spoonacular.api.key}")
    private String apiKey;
    private final Map<String, String> moodMappings = new HashMap<>();

    public SpoonacularService() {
        moodMappings.put("happy", "cake");
        moodMappings.put("sad", "soup");
        moodMappings.put("hungry", "pizza");
        moodMappings.put("cozy", "stew");
        moodMappings.put("excited", "taco");
        moodMappings.put("relaxed", "salad");
    }

    private final LoadingCache<String, String> recipeCache = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS) // Cache for 1 hour
            .maximumSize(100) // Limit to 100 entries
            .build(new CacheLoader<String, String>() {
                @Override
                public String load(String url) throws Exception {
                    return fetchFromSpoonacular(url);
                }
            });

    public String getRecipesByMood(String mood, int number, Integer maxReadyTime, Integer offset, String diet, String intolerances, String type, Integer maxCalories) throws IOException {
        String query = moodMappings.getOrDefault(mood.toLowerCase(), "food");
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8.toString());
        StringBuilder urlBuilder = new StringBuilder("https://api.spoonacular.com/recipes/complexSearch?query=" + encodedQuery +
                "&number=" + number + "&offset=" + (offset != null ? offset : 0) + "&apiKey=" + apiKey + "&addRecipeInformation=true");

        if (maxReadyTime != null) urlBuilder.append("&maxReadyTime=").append(maxReadyTime);
        if (diet != null && !diet.isEmpty()) urlBuilder.append("&diet=").append(URLEncoder.encode(diet, StandardCharsets.UTF_8.toString()));
        if (intolerances != null && !intolerances.isEmpty()) urlBuilder.append("&intolerances=").append(URLEncoder.encode(intolerances, StandardCharsets.UTF_8.toString()));
        if (type != null && !type.isEmpty()) urlBuilder.append("&type=").append(URLEncoder.encode(type, StandardCharsets.UTF_8.toString()));
        if (maxCalories != null) urlBuilder.append("&maxCalories=").append(maxCalories);

        String url = urlBuilder.toString();
        logger.info("Fetching recipes for mood: {} with query: {} and URL: {}", mood, query, url);

        try {
            return recipeCache.get(url); // Use cache if available
        } catch (Exception e) {
            logger.error("Failed to fetch recipes for mood {}: {}", mood, e.getMessage(), e);
            throw new IOException("Failed to fetch recipes for mood " + mood + ": " + e.getMessage(), e);
        }
    }

    private String fetchFromSpoonacular(String url) throws IOException {
        Request request = new Request.Builder().url(url).build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Spoonacular API failed with code {}: {}", response.code(), errorBody);
                throw new IOException("Spoonacular API failed with code " + response.code() + ": " + errorBody);
            }
            String responseBody = response.body().string();
            logger.info("Fetched from Spoonacular: {}", responseBody);
            return responseBody;
        }
    }

    public String searchRecipes(
            String query, String ingredient, String cuisine, String mood,
            String diet, String intolerances, String type, int number,
            Integer maxCalories, Integer maxReadyTime, Integer offset) throws IOException {
        String effectiveQuery = query != null ? query : (mood != null ? moodMappings.getOrDefault(mood.toLowerCase(), "food") : "food");
        String url = "https://api.spoonacular.com/recipes/complexSearch?apiKey=" + apiKey +
                "&number=" + number + "&offset=" + offset +
                "&query=" + encode(effectiveQuery) +
                (ingredient != null ? "&includeIngredients=" + encode(ingredient) : "") +
                (cuisine != null ? "&cuisine=" + encode(cuisine) : "") +
                (diet != null ? "&diet=" + encode(diet) : "") +
                (intolerances != null ? "&intolerances=" + encode(intolerances) : "") +
                (type != null ? "&type=" + encode(type) : "") +
                (maxCalories != null ? "&maxCalories=" + maxCalories : "") +
                (maxReadyTime != null ? "&maxReadyTime=" + maxReadyTime : "") +
                "&addRecipeInformation=true";

        logger.info("Calling Spoonacular API with URL: {}", url);

        try {
            String responseBody = recipeCache.get(url);
            logger.info("Spoonacular search response: {}", responseBody);

            if (responseBody.contains("\"results\":[]") && mood != null) {
                logger.info("No results for mood '{}', falling back to general search", mood);
                url = "https://api.spoonacular.com/recipes/complexSearch?apiKey=" + apiKey +
                        "&number=" + number + "&offset=" + offset +
                        "&query=" + encode("food") +
                        "&addRecipeInformation=true";
                responseBody = fetchFromSpoonacular(url);
                logger.info("Fallback response: {}", responseBody);
            }
            return responseBody;
        } catch (Exception e) {
            logger.error("Failed to fetch recipes from cache: {}", e.getMessage(), e);
            throw new IOException("Failed to fetch recipes: " + e.getMessage(), e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public String getRecipeDetails(String id) throws IOException {
        String url = "https://api.spoonacular.com/recipes/" + id + "/information?apiKey=" + apiKey + "&addRecipeNutrition=true";
        logger.info("Fetching recipe details for ID: {} with URL: {}", id, url);
        Request request = new Request.Builder().url(url).build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Spoonacular API failed with code {}: {}", response.code(), errorBody);
                throw new IOException("Spoonacular API failed with code " + response.code() + ": " + errorBody);
            }
            String responseBody = response.body().string();
            logger.info("Recipe details response: {}", responseBody);
            return responseBody;
        }
    }

    public String getRandomRecipe() throws IOException {
        String url = "https://api.spoonacular.com/recipes/random?number=1&apiKey=" + apiKey;
        logger.info("Fetching random recipe with URL: {}", url);

        Request request = new Request.Builder()
                .url(url)
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Spoonacular API failed with code {}: {}", response.code(), errorBody);
                throw new IOException("Spoonacular API failed with code " + response.code() + ": " + errorBody);
            }
            String responseBody = response.body().string();
            logger.info("Random recipe response: {}", responseBody);
            return responseBody;
        }
    }

    public String fetchRandomRecipeByMood(String mood, Integer maxReadyTime) throws IOException {
        String tag = moodMappings.getOrDefault(mood.toLowerCase(), "food");
        String encodedTag = URLEncoder.encode(tag, StandardCharsets.UTF_8.toString());
        StringBuilder urlBuilder = new StringBuilder("https://api.spoonacular.com/recipes/random?number=1&tags=" + encodedTag + "&apiKey=" + apiKey);
        if (maxReadyTime != null) {
            urlBuilder.append("&maxReadyTime=").append(maxReadyTime);
        }
        String url = urlBuilder.toString();
        logger.info("Fetching random recipe for mood: {} with tag: {} and URL: {}", mood, tag, url);

        Request request = new Request.Builder()
                .url(url)
                .build();
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                logger.error("Spoonacular API failed with code {}: {}", response.code(), errorBody);
                throw new IOException("Spoonacular API failed with code " + response.code() + ": " + errorBody);
            }
            String responseBody = response.body().string();
            logger.info("Random recipe response for mood {}: {}", mood, responseBody);
            return responseBody;
        }
    }

    public String generateMealPlan(String timeFrame, String cuisine, String diet, String targetCalories) throws IOException {
        if (apiKey == null || apiKey.isEmpty()) {
            logger.error("Spoonacular API key is not configured.");
            throw new IOException("Spoonacular API key is not configured.");
        }

        StringBuilder urlBuilder = new StringBuilder("https://api.spoonacular.com/mealplanner/generate?apiKey=" + apiKey);
        if (timeFrame != null && !timeFrame.isEmpty()) {
            urlBuilder.append("&timeFrame=").append(URLEncoder.encode(timeFrame, StandardCharsets.UTF_8.toString()));
        } else {
            logger.warn("timeFrame is null or empty, defaulting to 'week'");
            urlBuilder.append("&timeFrame=week");
        }
        if (cuisine != null && !cuisine.isEmpty()) {
            urlBuilder.append("&cuisine=").append(URLEncoder.encode(cuisine, StandardCharsets.UTF_8.toString()));
        }
        if (diet != null && !diet.isEmpty()) {
            urlBuilder.append("&diet=").append(URLEncoder.encode(diet, StandardCharsets.UTF_8.toString()));
        }
        if (targetCalories != null && !targetCalories.isEmpty()) {
            urlBuilder.append("&targetCalories=").append(URLEncoder.encode(targetCalories, StandardCharsets.UTF_8.toString()));
        }

        String url = urlBuilder.toString();
        logger.info("Generating meal plan with URL: {}", url);

        try {
            String responseBody = recipeCache.get(url);
            logger.info("Meal plan response: {}", responseBody);
            return responseBody;
        } catch (Exception e) {
            logger.error("Failed to generate meal plan: {}", e.getMessage(), e);
            throw new IOException("Failed to generate meal plan: " + e.getMessage(), e);
        }
    }
}