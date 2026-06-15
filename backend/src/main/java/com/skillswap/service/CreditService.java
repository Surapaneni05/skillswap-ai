package com.skillswap.service;

import com.skillswap.entity.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    @Transactional
    public void addCredits(User user, int amount, String description, Long refId, String refType) {
        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);

        CreditTransaction tx = CreditTransaction.builder()
                .user(user)
                .amount(amount)
                .type(CreditTransaction.TransactionType.CREDIT)
                .description(description)
                .referenceId(refId)
                .referenceType(refType)
                .build();
        creditTransactionRepository.save(tx);
    }

    @Transactional
    public void deductCredits(User user, int amount, String description, Long refId, String refType) {
        if (user.getCredits() < amount) {
            throw new com.skillswap.exception.BadRequestException("Insufficient credits");
        }
        user.setCredits(user.getCredits() - amount);
        userRepository.save(user);

        CreditTransaction tx = CreditTransaction.builder()
                .user(user)
                .amount(amount)
                .type(CreditTransaction.TransactionType.DEBIT)
                .description(description)
                .referenceId(refId)
                .referenceType(refType)
                .build();
        creditTransactionRepository.save(tx);
    }

    public java.util.List<CreditTransaction> getTransactions(Long userId) {
        return creditTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public java.util.Map<String, Integer> getCreditSummary(Long userId) {
        Integer earned = creditTransactionRepository.getTotalEarned(userId);
        Integer spent = creditTransactionRepository.getTotalSpent(userId);
        return java.util.Map.of(
            "earned", earned != null ? earned : 0,
            "spent", spent != null ? spent : 0
        );
    }
}
