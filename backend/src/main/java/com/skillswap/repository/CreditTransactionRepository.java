package com.skillswap.repository;

import com.skillswap.entity.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT SUM(t.amount) FROM CreditTransaction t WHERE t.user.id = :userId AND t.type = 'CREDIT'")
    Integer getTotalEarned(@Param("userId") Long userId);

    @Query("SELECT SUM(t.amount) FROM CreditTransaction t WHERE t.user.id = :userId AND t.type = 'DEBIT'")
    Integer getTotalSpent(@Param("userId") Long userId);
}
