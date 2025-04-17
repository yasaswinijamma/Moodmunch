package com.example.moodmunch.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/local-flavor")
public class LocalFlavorController {

    @Value("${foursquare.api.key}")
    private String apiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping
    public Map<String, Object> getLocalFlavors(
            @RequestParam String zipCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String mood) throws Exception {
        System.out.println("Processing zipCode: " + zipCode);

        // Geocode zip code to lat,lng using Nominatim
        String geocodeUrl = "https://nominatim.openstreetmap.org/search?postalcode=" + zipCode + "&format=json&limit=1";
        Request geocodeRequest = new Request.Builder()
                .url(geocodeUrl)
                .header("User-Agent", "MoodMunch/1.0")
                .build();
        Response geocodeResponse = client.newCall(geocodeRequest).execute();
        String geocodeBody = geocodeResponse.body().string();
        JsonNode geocodeJson = mapper.readTree(geocodeBody);
        if (geocodeJson.size() == 0) {
            throw new Exception("Invalid zip code");
        }
        String latLng = geocodeJson.get(0).get("lat").asText() + "," + geocodeJson.get(0).get("lon").asText();

        // Mood to category mapping
        Map<String, String> moodToCategory = new HashMap<>();
        moodToCategory.put("happy", "13099"); // Italian
        moodToCategory.put("comfort", "13003"); // American
        moodToCategory.put("spicy", "13145"); // Mexican
        String category = mood != null ? moodToCategory.getOrDefault(mood.toLowerCase(), "13065") : "13065"; // Default: all restaurants

        // Fetch restaurants from Foursquare
        int limit = 20;
        String restaurantUrl = "https://api.foursquare.com/v3/places/search" +
                "?ll=" + latLng +
                "&radius=5000" +
                "&categories=" + category +
                "&sort=RATING" +
                "&limit=" + limit +
                "&offset=" + (page * limit) +
                "&v=20250328";
        Request restaurantRequest = new Request.Builder()
                .url(restaurantUrl)
                .header("Authorization", apiKey)
                .build();
        Response restaurantResponse = client.newCall(restaurantRequest).execute();
        String restaurantBody = restaurantResponse.body().string();
        JsonNode restaurantJson = mapper.readTree(restaurantBody);

        List<Map<String, Object>> venues = new ArrayList<>();
        for (JsonNode venue : restaurantJson.get("results")) {
            Map<String, Object> venueData = new HashMap<>();
            String fsqId = venue.get("fsq_id").asText();
            venueData.put("name", venue.get("name").asText());
            venueData.put("address", venue.get("location").get("formatted_address").asText());

            // Fetch rating from place details
            String detailsUrl = "https://api.foursquare.com/v3/places/" + fsqId + "?fields=rating&v=20250328";
            Request detailsRequest = new Request.Builder()
                    .url(detailsUrl)
                    .header("Authorization", apiKey)
                    .build();
            Response detailsResponse = client.newCall(detailsRequest).execute();
            JsonNode detailsJson = mapper.readTree(detailsResponse.body().string());
            double rating = detailsJson.has("rating") ? detailsJson.get("rating").asDouble() : 0.0;
            venueData.put("rating", rating);

            // Fetch photo
            String photoUrl = "https://api.foursquare.com/v3/places/" + fsqId + "/photos?limit=1&v=20250328";
            Request photoRequest = new Request.Builder()
                    .url(photoUrl)
                    .header("Authorization", apiKey)
                    .build();
            Response photoResponse = client.newCall(photoRequest).execute();
            JsonNode photoJson = mapper.readTree(photoResponse.body().string());
            if (photoJson.size() > 0) {
                String prefix = photoJson.get(0).get("prefix").asText();
                String suffix = photoJson.get(0).get("suffix").asText();
                venueData.put("photo", prefix + "300x200" + suffix);
            }
            venues.add(venueData);
        }

        // Mock local foods (for now)
        Map<String, List<String>> localFoodsByZip = new HashMap<>();
        localFoodsByZip.put("90210", List.of("California Sushi", "Avocado Toast", "In-N-Out Burger"));
        List<Map<String, Object>> localFoods = new ArrayList<>();
        List<String> foods = localFoodsByZip.getOrDefault(zipCode, List.of("Local Cuisine TBD"));
        for (String food : foods) {
            Map<String, Object> foodData = new HashMap<>();
            foodData.put("name", food);
            localFoods.add(foodData);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("venues", venues);
        result.put("localFoods", localFoods);
        System.out.println("Response: " + mapper.writeValueAsString(result));
        return result;
    }
}