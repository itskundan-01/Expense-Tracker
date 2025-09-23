package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.entity.Budget;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TransactionRepository transactionRepository;

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

    private BudgetResponse convertToResponse(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setAmount(budget.getAmount());
        response.setPeriod(budget.getPeriod());
        response.setStartDate(budget.getStartDate());
        response.setEndDate(budget.getEndDate());
        response.setAlertThreshold(budget.getAlertThreshold());
        response.setIsActive(budget.getIsActive());
        response.setNotes(budget.getNotes());
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());

        if (budget.getCategory() != null) {
            response.setCategoryId(budget.getCategory().getId());
            response.setCategoryName(budget.getCategory().getName());
            response.setCategoryIcon(budget.getCategory().getIcon());
            response.setCategoryColor(budget.getCategory().getColor());
        }

        // Calculate spent amount based on budget period
        BigDecimal spent = calculateSpentAmount(budget);
        response.setSpent(spent != null ? spent : BigDecimal.ZERO);

        return response;
    }

    private BigDecimal calculateSpentAmount(Budget budget) {
        if (budget.getCategory() == null || budget.getUser() == null) {
            return BigDecimal.ZERO;
        }

        LocalDate endDate = budget.getEndDate() != null ? budget.getEndDate() : LocalDate.now();
        
        return transactionRepository.getSpentByCategoryAndDateRange(
                budget.getUser().getId(),
                budget.getCategory().getId(),
                budget.getStartDate(),
                endDate
        );
    }

    @GetMapping
    public ResponseEntity<?> getAllBudgets(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            List<Budget> budgets = budgetRepository.findByUserIdAndIsActiveTrue(user.getId());
            List<BudgetResponse> response = budgets.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch budgets: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            // Validate category
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid category"));
            }

            Category category = categoryOpt.get();

            // Check if there's already an active budget for this category
            List<Budget> existingBudgets = budgetRepository.findByUserIdAndCategoryIdAndIsActiveTrue(
                    user.getId(), category.getId());
            if (!existingBudgets.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("An active budget already exists for this category"));
            }

            Budget budget = new Budget();
            budget.setAmount(request.getAmount());
            budget.setPeriod(request.getPeriod());
            budget.setStartDate(request.getStartDate());
            budget.setEndDate(request.getEndDate());
            budget.setAlertThreshold(request.getAlertThreshold());
            budget.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            budget.setNotes(request.getNotes());
            budget.setUser(user);
            budget.setCategory(category);

            Budget savedBudget = budgetRepository.save(budget);
            BudgetResponse response = convertToResponse(savedBudget);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create budget: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Budget> budgetOpt = budgetRepository.findById(id);
            
            if (budgetOpt.isEmpty() || !budgetOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Budget budget = budgetOpt.get();

            // Validate category if it's being changed
            if (!budget.getCategory().getId().equals(request.getCategoryId())) {
                Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
                if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid category"));
                }

                // Check if there's already an active budget for the new category
                List<Budget> existingBudgets = budgetRepository.findByUserIdAndCategoryIdAndIsActiveTrue(
                        user.getId(), request.getCategoryId());
                if (!existingBudgets.isEmpty() && !existingBudgets.get(0).getId().equals(id)) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("An active budget already exists for this category"));
                }

                budget.setCategory(categoryOpt.get());
            }

            budget.setAmount(request.getAmount());
            budget.setPeriod(request.getPeriod());
            budget.setStartDate(request.getStartDate());
            budget.setEndDate(request.getEndDate());
            budget.setAlertThreshold(request.getAlertThreshold());
            if (request.getIsActive() != null) {
                budget.setIsActive(request.getIsActive());
            }
            budget.setNotes(request.getNotes());

            Budget updatedBudget = budgetRepository.save(budget);
            BudgetResponse response = convertToResponse(updatedBudget);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update budget: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Budget> budgetOpt = budgetRepository.findById(id);
            
            if (budgetOpt.isEmpty() || !budgetOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Budget budget = budgetOpt.get();
            
            // Soft delete by setting isActive to false
            budget.setIsActive(false);
            budgetRepository.save(budget);

            return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete budget: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Budget> budgetOpt = budgetRepository.findById(id);
            
            if (budgetOpt.isEmpty() || !budgetOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            BudgetResponse response = convertToResponse(budgetOpt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch budget: " + e.getMessage()));
        }
    }
}