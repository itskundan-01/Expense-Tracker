package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.TransactionRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.entity.*;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.AccountRepository;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.TransactionService;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AccountRepository accountRepository;

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

    private TransactionResponse convertToResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setDescription(transaction.getDescription());
        response.setAmount(transaction.getAmount());
        response.setType(transaction.getType());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setNotes(transaction.getNotes());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setUpdatedAt(transaction.getUpdatedAt());

        if (transaction.getCategory() != null) {
            response.setCategoryId(transaction.getCategory().getId());
            response.setCategoryName(transaction.getCategory().getName());
            response.setCategoryIcon(transaction.getCategory().getIcon());
            response.setCategoryColor(transaction.getCategory().getColor());
        }

        if (transaction.getAccount() != null) {
            response.setAccountId(transaction.getAccount().getId());
            response.setAccountName(transaction.getAccount().getName());
        }

        return response;
    }

    @GetMapping
    public ResponseEntity<?> getAllTransactions(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Transaction> transactions = transactionService.getTransactionsByUser(user, pageable);
            
            List<TransactionResponse> responseList = transactions.getContent().stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", responseList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve transactions"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Transaction> transactionOpt = transactionService.getTransactionById(id);
            
            if (transactionOpt.isEmpty() || !transactionOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            TransactionResponse response = convertToResponse(transactionOpt.get());
            return ResponseEntity.ok(ApiResponse.success("Transaction retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve transaction"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @Valid @RequestBody TransactionRequest request,
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

            // Validate account if provided
            Account account = null;
            if (request.getAccountId() != null) {
                Optional<Account> accountOpt = accountRepository.findById(request.getAccountId());
                if (accountOpt.isEmpty() || !accountOpt.get().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid account"));
                }
                account = accountOpt.get();
            }

            Transaction transaction = new Transaction(
                    request.getDescription(),
                    request.getAmount(),
                    request.getType(),
                    request.getTransactionDate(),
                    user,
                    categoryOpt.get()
            );
            transaction.setAccount(account);
            transaction.setNotes(request.getNotes());

            Transaction savedTransaction = transactionService.createTransaction(transaction);
            
            // Update account balance based on transaction type
            if (account != null) {
                if ("income".equalsIgnoreCase(request.getType())) {
                    // Income increases balance
                    account.setBalance(account.getBalance().add(request.getAmount()));
                } else {
                    // Expense decreases balance
                    account.setBalance(account.getBalance().subtract(request.getAmount()));
                }
                accountRepository.save(account);
            }
            
            TransactionResponse response = convertToResponse(savedTransaction);

            return ResponseEntity.ok(ApiResponse.success("Transaction created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create transaction"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Transaction> transactionOpt = transactionService.getTransactionById(id);
            
            if (transactionOpt.isEmpty() || !transactionOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            // Validate category
            Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
            if (categoryOpt.isEmpty() || !categoryOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid category"));
            }

            // Validate account if provided
            Account newAccount = null;
            if (request.getAccountId() != null) {
                Optional<Account> accountOpt = accountRepository.findById(request.getAccountId());
                if (accountOpt.isEmpty() || !accountOpt.get().getUser().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid account"));
                }
                newAccount = accountOpt.get();
            }

            Transaction transaction = transactionOpt.get();
            
            // Reverse the old transaction's effect on the old account
            Account oldAccount = transaction.getAccount();
            if (oldAccount != null) {
                if ("income".equalsIgnoreCase(transaction.getType())) {
                    oldAccount.setBalance(oldAccount.getBalance().subtract(transaction.getAmount()));
                } else {
                    oldAccount.setBalance(oldAccount.getBalance().add(transaction.getAmount()));
                }
                accountRepository.save(oldAccount);
            }
            
            transaction.setDescription(request.getDescription());
            transaction.setAmount(request.getAmount());
            transaction.setType(request.getType());
            transaction.setCategory(categoryOpt.get());
            transaction.setAccount(newAccount);
            transaction.setTransactionDate(request.getTransactionDate());
            transaction.setNotes(request.getNotes());

            Transaction updatedTransaction = transactionService.updateTransaction(transaction);
            
            // Apply the new transaction's effect on the new account
            if (newAccount != null) {
                if ("income".equalsIgnoreCase(request.getType())) {
                    newAccount.setBalance(newAccount.getBalance().add(request.getAmount()));
                } else {
                    newAccount.setBalance(newAccount.getBalance().subtract(request.getAmount()));
                }
                accountRepository.save(newAccount);
            }
            
            TransactionResponse response = convertToResponse(updatedTransaction);

            return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update transaction"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }

        try {
            Optional<Transaction> transactionOpt = transactionService.getTransactionById(id);
            
            if (transactionOpt.isEmpty() || !transactionOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.notFound().build();
            }

            Transaction transaction = transactionOpt.get();
            
            // Reverse the balance change if account was associated
            if (transaction.getAccount() != null) {
                Account account = transaction.getAccount();
                if ("income".equalsIgnoreCase(transaction.getType())) {
                    // Deleting income decreases balance
                    account.setBalance(account.getBalance().subtract(transaction.getAmount()));
                } else {
                    // Deleting expense increases balance
                    account.setBalance(account.getBalance().add(transaction.getAmount()));
                }
                accountRepository.save(account);
            }

            transactionService.deleteTransaction(id);
            return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete transaction"));
        }
    }
}