package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.CategoryRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

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

    private CategoryResponse convertToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setType(category.getType());
        response.setIcon(category.getIcon());
        response.setColor(category.getColor());
        response.setDescription(category.getDescription());
        response.setIsActive(category.getIsActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            List<Category> categories = categoryRepository.findByUserIdAndIsActiveTrue(user.getId());
            List<CategoryResponse> response = categories.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch categories: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            // Check if category name already exists for the user
            if (categoryRepository.existsByUserIdAndName(user.getId(), request.getName())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Category with this name already exists"));
            }

            Category category = new Category();
            category.setName(request.getName());
            category.setType(request.getType());
            category.setIcon(request.getIcon());
            category.setColor(request.getColor());
            category.setDescription(request.getDescription());
            category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            category.setUser(user);

            Category savedCategory = categoryRepository.save(category);
            CategoryResponse response = convertToResponse(savedCategory);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create category: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Category> categoryOpt = categoryRepository.findById(id);
            
            if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Category category = categoryOpt.get();
            
            // Check if the new name conflicts with another category
            if (!category.getName().equals(request.getName()) && 
                categoryRepository.existsByUserIdAndName(user.getId(), request.getName())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Category with this name already exists"));
            }

            category.setName(request.getName());
            category.setType(request.getType());
            category.setIcon(request.getIcon());
            category.setColor(request.getColor());
            category.setDescription(request.getDescription());
            if (request.getIsActive() != null) {
                category.setIsActive(request.getIsActive());
            }

            Category updatedCategory = categoryRepository.save(category);
            CategoryResponse response = convertToResponse(updatedCategory);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update category: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Category> categoryOpt = categoryRepository.findById(id);
            
            if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Category category = categoryOpt.get();
            
            // Soft delete by setting isActive to false instead of hard delete
            // This preserves referential integrity with transactions
            category.setIsActive(false);
            categoryRepository.save(category);

            return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete category: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Category> categoryOpt = categoryRepository.findById(id);
            
            if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            CategoryResponse response = convertToResponse(categoryOpt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch category: " + e.getMessage()));
        }
    }
}