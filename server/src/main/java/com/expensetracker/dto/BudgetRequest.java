package com.expensetracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetRequest {
    
    @NotNull(message = "Budget amount is required")
    private BigDecimal amount;
    
    @NotNull(message = "Budget period is required")
    @Pattern(regexp = "^(daily|weekly|monthly|yearly)$", 
             message = "Budget period must be one of: daily, weekly, monthly, yearly")
    private String period;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "Category ID is required")
    private Long categoryId;
    
    private LocalDate endDate;
    private Integer alertThreshold;
    private Boolean isActive = true;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    // Constructors
    public BudgetRequest() {}

    public BudgetRequest(BigDecimal amount, String period, LocalDate startDate, Long categoryId) {
        this.amount = amount;
        this.period = period;
        this.startDate = startDate;
        this.categoryId = categoryId;
    }

    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
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

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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
}