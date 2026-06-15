package com.skillswap.repository;

import com.skillswap.entity.SkillRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRequestRepository extends JpaRepository<SkillRequest, Long> {

    List<SkillRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<SkillRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    @Query("SELECT r FROM SkillRequest r WHERE (r.sender.id = :userId OR r.receiver.id = :userId) " +
           "ORDER BY r.createdAt DESC")
    List<SkillRequest> findAllByUserId(@Param("userId") Long userId);

    Optional<SkillRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    List<SkillRequest> findByReceiverIdAndStatus(Long receiverId, SkillRequest.Status status);

    Long countByStatus(SkillRequest.Status status);
}
