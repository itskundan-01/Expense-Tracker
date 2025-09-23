package com.expensetracker.controller;

import com.expensetracker.dto.AccountRequest;
import com.expensetracker.dto.AccountResponse;
import com.expensetracker.dto.ApiResponse;
import com.expensetracker.entity.Account;
import com.expensetracker.entity.User;
import com.expensetracker.repository.AccountRepository;
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
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

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

    private AccountResponse convertToResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setName(account.getName());
        response.setType(account.getType());
        response.setBalance(account.getBalance());
        response.setCurrency(account.getCurrency());
        response.setDescription(account.getDescription());
        response.setBankName(account.getBankName());
        response.setAccountNumber(account.getAccountNumber());
        response.setIsActive(account.getIsActive());
        response.setIcon(account.getIcon());
        response.setColor(account.getColor());
        response.setCreatedAt(account.getCreatedAt());
        response.setUpdatedAt(account.getUpdatedAt());
        return response;
    }

    @GetMapping
    public ResponseEntity<?> getAllAccounts(@RequestHeader("Authorization") String authHeader) {
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            List<Account> accounts = accountRepository.findByUserIdAndIsActiveTrue(user.getId());
            List<AccountResponse> response = accounts.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch accounts: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody AccountRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            // Check if account name already exists for the user
            if (accountRepository.existsByUserIdAndName(user.getId(), request.getName())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Account with this name already exists"));
            }

            Account account = new Account();
            account.setName(request.getName());
            account.setType(request.getType());
            account.setBalance(request.getBalance());
            account.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
            account.setDescription(request.getDescription());
            account.setBankName(request.getBankName());
            account.setAccountNumber(request.getAccountNumber());
            account.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            account.setIcon(request.getIcon());
            account.setColor(request.getColor());
            account.setUser(user);

            Account savedAccount = accountRepository.save(account);
            AccountResponse response = convertToResponse(savedAccount);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create account: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Account> accountOpt = accountRepository.findById(id);
            
            if (accountOpt.isEmpty() || !accountOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Account account = accountOpt.get();
            
            // Check if the new name conflicts with another account
            if (!account.getName().equals(request.getName()) && 
                accountRepository.existsByUserIdAndName(user.getId(), request.getName())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Account with this name already exists"));
            }

            account.setName(request.getName());
            account.setType(request.getType());
            account.setBalance(request.getBalance());
            account.setCurrency(request.getCurrency() != null ? request.getCurrency() : account.getCurrency());
            account.setDescription(request.getDescription());
            account.setBankName(request.getBankName());
            account.setAccountNumber(request.getAccountNumber());
            if (request.getIsActive() != null) {
                account.setIsActive(request.getIsActive());
            }
            account.setIcon(request.getIcon());
            account.setColor(request.getColor());

            Account updatedAccount = accountRepository.save(account);
            AccountResponse response = convertToResponse(updatedAccount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update account: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Account> accountOpt = accountRepository.findById(id);
            
            if (accountOpt.isEmpty() || !accountOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Account account = accountOpt.get();
            
            // Soft delete by setting isActive to false instead of hard delete
            // This preserves referential integrity with transactions
            account.setIsActive(false);
            accountRepository.save(account);

            return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete account: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAccountById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Account> accountOpt = accountRepository.findById(id);
            
            if (accountOpt.isEmpty() || !accountOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            AccountResponse response = convertToResponse(accountOpt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch account: " + e.getMessage()));
        }
    }
}