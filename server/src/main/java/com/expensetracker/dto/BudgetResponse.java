package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BudgetResponse {
    
    private Long id;
    private BigDecimal amount;
    private BigDecimal spent;
    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer alertThreshold;
    private Boolean isActive;
    private String notes;
    
    // Category information
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public BudgetResponse() {}

    public BudgetResponse(Long id, BigDecimal amount, String period, LocalDate startDate) {
        this.id = id;
        this.amount = amount;
        this.period = period;
        this.startDate = startDate;
    }

    // Helper methods for calculated fields
    public BigDecimal getRemainingAmount() {
        if (amount == null || spent == null) {
            return amount;
        }
        return amount.subtract(spent);
    }

    public BigDecimal getPercentageSpent() {
        if (amount == null || spent == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return spent.divide(amount, 2, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal("100"));
    }

    public Boolean isOverBudget() {
        if (amount == null || spent == null) {
            return false;
        }
        return spent.compareTo(amount) > 0;
    }

    public Boolean shouldAlert() {
        if (alertThreshold == null || amount == null || spent == null) {
            return false;
        }
        BigDecimal thresholdAmount = amount.multiply(new BigDecimal(alertThreshold)).divide(new BigDecimal("100"));
        return spent.compareTo(thresholdAmount) >= 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(Integer alertThreshold) {
        this.alertThreshold = alertThreshold;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryIcon() {
        return categoryIcon;
    }

    public void setCategoryIcon(String categoryIcon) {
        this.categoryIcon = categoryIcon;
    }

    public String getCategoryColor() {
        return categoryColor;
    }

    public void setCategoryColor(String categoryColor) {
        this.categoryColor = categoryColor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}