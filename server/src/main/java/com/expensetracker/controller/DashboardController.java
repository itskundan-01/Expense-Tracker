package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.DashboardSummary;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.TransactionService;
import com.expensetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private User getUserFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtUtil.getEmailFromToken(token);
            return userService.findByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            // Get financial summary
            BigDecimal totalIncome = transactionService.getTotalIncomeByUser(user);
            BigDecimal totalExpenses = transactionService.getTotalExpensesByUser(user);
            BigDecimal netBalance = transactionService.getNetBalance(user);
            
            // Get total transaction count
            List<Transaction> allTransactions = transactionService.getAllTransactionsByUser(user);
            int totalTransactions = allTransactions.size();

            DashboardSummary summary = new DashboardSummary(
                    totalIncome,
                    totalExpenses, 
                    netBalance,
                    totalTransactions
            );

            return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve dashboard summary"));
        }
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<?> getRecentTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "5") int limit) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            List<Transaction> transactions = transactionService.getAllTransactionsByUser(user);
            // Take only the first 'limit' transactions since they're already sorted by date desc
            List<Transaction> recentTransactions = transactions.stream()
                    .limit(limit)
                    .toList();

            return ResponseEntity.ok(ApiResponse.success("Recent transactions retrieved successfully", recentTransactions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recent transactions"));
        }
    }

    @GetMapping("/monthly-summary")
    public ResponseEntity<?> getMonthlySummary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "2024") int year) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            // Calculate monthly data for the current year
            LocalDate startOfYear = LocalDate.of(year, 1, 1);
            LocalDate endOfYear = LocalDate.of(year, 12, 31);
            
            BigDecimal yearlyIncome = transactionService.getTotalByUserAndTypeAndDateRange(
                    user, "income", startOfYear, endOfYear);
            BigDecimal yearlyExpenses = transactionService.getTotalByUserAndTypeAndDateRange(
                    user, "expense", startOfYear, endOfYear);

            DashboardSummary.MonthlyData monthlyData = new DashboardSummary.MonthlyData(
                    year, year, yearlyIncome, yearlyExpenses);

            return ResponseEntity.ok(ApiResponse.success("Monthly summary retrieved successfully", monthlyData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve monthly summary"));
        }
    }
}