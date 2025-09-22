package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Expense Tracker API is running successfully!"));
    }

    @GetMapping("/version")
    public ResponseEntity<?> getVersion() {
        return ResponseEntity.ok(ApiResponse.success("Version 1.0.0", "Expense Tracker Server v1.0.0"));
    }
}