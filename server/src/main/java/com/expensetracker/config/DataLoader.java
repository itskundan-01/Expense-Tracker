package com.expensetracker.config;

import com.expensetracker.entity.User;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Account;
import com.expensetracker.service.UserService;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserService userService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (categoryRepository.count() > 0) {
            return; // Data already loaded
        }

        // Create a demo user
        User demoUser = new User("Demo", "User", "demo@example.com", "password123");
        User savedUser = userService.createUser(demoUser);

        // Create default categories
        createDefaultCategories(savedUser);
        
        // Create default accounts
        createDefaultAccounts(savedUser);

        System.out.println("Sample data loaded successfully!");
        System.out.println("Demo user created: demo@example.com / password123");
    }

    private void createDefaultCategories(User user) {
        // Expense categories
        createCategory("Food & Dining", "🍽️", "#FF6B6B", "expense", user);
        createCategory("Transportation", "🚗", "#4ECDC4", "expense", user);
        createCategory("Shopping", "🛍️", "#45B7D1", "expense", user);
        createCategory("Entertainment", "🎬", "#96CEB4", "expense", user);
        createCategory("Bills & Utilities", "⚡", "#FFEAA7", "expense", user);
        createCategory("Healthcare", "🏥", "#DDA0DD", "expense", user);
        createCategory("Education", "📚", "#98D8C8", "expense", user);

        // Income categories
        createCategory("Salary", "💼", "#6C5CE7", "income", user);
        createCategory("Freelance", "💻", "#A29BFE", "income", user);
        createCategory("Investment", "📈", "#FD79A8", "income", user);
    }

    private void createCategory(String name, String icon, String color, String type, User user) {
        Category category = new Category(name, type, user);
        category.setIcon(icon);
        category.setColor(color);
        categoryRepository.save(category);
    }

    private void createDefaultAccounts(User user) {
        createAccount("Checking Account", "checking", new BigDecimal("5000.00"), "USD", user);
        createAccount("Savings Account", "savings", new BigDecimal("15000.00"), "USD", user);
        createAccount("Credit Card", "credit", new BigDecimal("0.00"), "USD", user);
    }

    private void createAccount(String name, String type, BigDecimal balance, String currency, User user) {
        Account account = new Account(name, type, balance, user);
        account.setCurrency(currency);
        accountRepository.save(account);
    }
}