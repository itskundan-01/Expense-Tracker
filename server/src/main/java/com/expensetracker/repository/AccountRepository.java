package com.expensetracker.repository;

import com.expensetracker.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    List<Account> findByUserIdAndIsActiveTrue(Long userId);
    
    Boolean existsByUserIdAndName(Long userId, String name);
}