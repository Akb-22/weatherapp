package com.example.weatherapp.controller;

import com.example.weatherapp.service.weather.weatherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin("*")   // Allow frontend access
public class weatherController {

    @Autowired
    private weatherService service;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(
            @RequestParam String city,
            @RequestParam(defaultValue = "10") int days
    ) {
        try {
            // 1. Get raw JSON string from service
            String response = service.getForecastByCity(city, days);

            if (response == null) {
                return ResponseEntity.status(404)
                        .body("City not found or invalid response");
            }

            // 2. Convert raw JSON → JSON object
            JsonNode json = mapper.readTree(response);

            // 3. Return full JSON (including hourly & daily)
            return ResponseEntity.ok(json);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Error processing forecast");
        }
    }
}
