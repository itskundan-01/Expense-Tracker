package com.expensetracker.repository;

import com.expensetracker.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
    
    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);
    
    List<Transaction> findByUserIdAndTypeOrderByTransactionDateDesc(Long userId, String type);
    
    List<Transaction> findByUserIdAndCategoryIdOrderByTransactionDateDesc(Long userId, Long categoryId);
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND " +
           "t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                             @Param("startDate") LocalDate startDate, 
                                             @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal getTotalByUserAndType(@Param("userId") Long userId, @Param("type") String type);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND " +
           "t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalByUserAndTypeAndDateRange(@Param("userId") Long userId, 
                                               @Param("type") String type,
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId AND " +
           "t.type = 'expense' AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal getSpentByCategoryAndDateRange(@Param("userId") Long userId,
                                            @Param("categoryId") Long categoryId,
                                            @Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);
}