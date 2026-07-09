package com.example.weatherapp.service.weather;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class weatherService {

    @Value("${weather.api.url}")
    private String weatherApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // 1) Convert city → coordinates
    @SuppressWarnings("unchecked")
    public Map<String, Double> getCoordinates(String city) {

        String cleanCity = city.trim().replace(" ", "%20"); // simple encoding
        String geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" + cleanCity + "&count=1";

        Map<String, Object> response = restTemplate.getForObject(geoUrl, Map.class);
        if (response == null || !response.containsKey("results")) {
            return null;
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
        if (results == null || results.isEmpty()) {
            return null;
        }

        Map<String, Object> first = results.get(0);

        double lat = ((Number) first.get("latitude")).doubleValue();
        double lon = ((Number) first.get("longitude")).doubleValue();

        Map<String, Double> map = new HashMap<>();
        map.put("lat", lat);
        map.put("lon", lon);

        return map;
    }

    // 2) Get forecast from latitude & longitude
    public String getForecast(double lat, double lon, int days) {
        String url = weatherApiUrl
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum"
                + "&hourly=temperature_2m,weathercode"     // ← ADDED THIS LINE
                + "&forecast_days=" + days
                + "&timezone=auto";

        return restTemplate.getForObject(url, String.class);
    }



    // 3) Convenience: forecast directly from city
    public String getForecastByCity(String city, int days) {
        Map<String, Double> coords = getCoordinates(city);

        if (coords == null) return null;

        double lat = coords.get("lat");
        double lon = coords.get("lon");

        return getForecast(lat, lon, days);
    }
}
