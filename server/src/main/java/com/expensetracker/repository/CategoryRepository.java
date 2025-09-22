package com.expensetracker.repository;

import com.expensetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByUserIdAndIsActiveTrue(Long userId);
    
    List<Category> findByUserIdAndTypeAndIsActiveTrue(Long userId, String type);
    
    Boolean existsByUserIdAndName(Long userId, String name);
}