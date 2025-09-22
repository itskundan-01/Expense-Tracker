package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummary {
    
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private int totalTransactions;
    private List<CategorySpending> categorySpending;
    private List<MonthlyData> monthlyData;

    // Constructors
    public DashboardSummary() {}

    public DashboardSummary(BigDecimal totalIncome, BigDecimal totalExpenses, 
                           BigDecimal netBalance, int totalTransactions) {
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netBalance = netBalance;
        this.totalTransactions = totalTransactions;
    }

    // Inner classes
    public static class CategorySpending {
        private Long categoryId;
        private String categoryName;
        private String categoryColor;
        private String categoryIcon;
        private BigDecimal amount;
        private String type;

        // Constructors
        public CategorySpending() {}

        public CategorySpending(Long categoryId, String categoryName, String categoryColor, 
                               String categoryIcon, BigDecimal amount, String type) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.categoryColor = categoryColor;
            this.categoryIcon = categoryIcon;
            this.amount = amount;
            this.type = type;
        }

        // Getters and setters
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public String getCategoryColor() { return categoryColor; }
        public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }
        
        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    public static class MonthlyData {
        private int month;
        private int year;
        private BigDecimal income;
        private BigDecimal expenses;

        // Constructors
        public MonthlyData() {}

        public MonthlyData(int month, int year, BigDecimal income, BigDecimal expenses) {
            this.month = month;
            this.year = year;
            this.income = income;
            this.expenses = expenses;
        }

        // Getters and setters
        public int getMonth() { return month; }
        public void setMonth(int month) { this.month = month; }
        
        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }
        
        public BigDecimal getIncome() { return income; }
        public void setIncome(BigDecimal income) { this.income = income; }
        
        public BigDecimal getExpenses() { return expenses; }
        public void setExpenses(BigDecimal expenses) { this.expenses = expenses; }
    }

    // Main class getters and setters
    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }

    public int getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(int totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public List<CategorySpending> getCategorySpending() {
        return categorySpending;
    }

    public void setCategorySpending(List<CategorySpending> categorySpending) {
        this.categorySpending = categorySpending;
    }

    public List<MonthlyData> getMonthlyData() {
        return monthlyData;
    }

    public void setMonthlyData(List<MonthlyData> monthlyData) {
        this.monthlyData = monthlyData;
    }
}