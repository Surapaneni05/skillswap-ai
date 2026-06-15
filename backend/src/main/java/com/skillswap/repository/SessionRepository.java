package com.skillswap.repository;

import com.skillswap.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    List<Session> findByMentorIdOrderByDateAsc(Long mentorId);

    List<Session> findByLearnerIdOrderByDateAsc(Long learnerId);

    @Query("SELECT s FROM Session s WHERE (s.mentor.id = :userId OR s.learner.id = :userId) " +
           "ORDER BY s.date ASC, s.time ASC")
    List<Session> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Session s WHERE (s.mentor.id = :userId OR s.learner.id = :userId) " +
           "AND s.date >= :today AND s.status = 'SCHEDULED' ORDER BY s.date ASC, s.time ASC")
    List<Session> findUpcomingByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT s FROM Session s WHERE (s.mentor.id = :userId OR s.learner.id = :userId) " +
           "AND s.status = 'COMPLETED' ORDER BY s.date DESC")
    List<Session> findCompletedByUserId(@Param("userId") Long userId);

    Long countByStatus(Session.Status status);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentor.id = :userId AND s.status = 'COMPLETED'")
    Long countCompletedSessionsByMentor(@Param("userId") Long userId);
}
