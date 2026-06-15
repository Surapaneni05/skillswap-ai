package com.skillswap.repository;

import com.skillswap.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByResetPasswordToken(String token);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.id != :userId")
    List<User> findAllActiveUsersExcept(@Param("userId") Long userId);

    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.college) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.isActive = true ORDER BY u.rating DESC, u.ratingCount DESC")
    List<User> findTopMentors();

    List<User> findByRole(User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    Long countActiveUsers();
}
