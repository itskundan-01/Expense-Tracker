package com.expensetracker.service;

import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactionsByUser(User user) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
    }

    public Page<Transaction> getTransactionsByUser(User user, Pageable pageable) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId(), pageable);
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public List<Transaction> getTransactionsByDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserIdAndDateRange(user.getId(), startDate, endDate);
    }

    public List<Transaction> getTransactionsByType(User user, String type) {
        return transactionRepository.findByUserIdAndTypeOrderByTransactionDateDesc(user.getId(), type);
    }

    public BigDecimal getTotalIncomeByUser(User user) {
        BigDecimal total = transactionRepository.getTotalByUserAndType(user.getId(), "income");
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalExpensesByUser(User user) {
        BigDecimal total = transactionRepository.getTotalByUserAndType(user.getId(), "expense");
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getNetBalance(User user) {
        BigDecimal income = getTotalIncomeByUser(user);
        BigDecimal expenses = getTotalExpensesByUser(user);
        return income.subtract(expenses);
    }

    public BigDecimal getTotalByUserAndTypeAndDateRange(User user, String type, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.getTotalByUserAndTypeAndDateRange(
                user.getId(), type, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getSpentByCategoryAndDateRange(User user, Long categoryId, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.getSpentByCategoryAndDateRange(
                user.getId(), categoryId, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public List<Transaction> getTransactionsByCategory(User user, Long categoryId) {
        return transactionRepository.findByUserIdAndCategoryIdOrderByTransactionDateDesc(user.getId(), categoryId);
    }
}