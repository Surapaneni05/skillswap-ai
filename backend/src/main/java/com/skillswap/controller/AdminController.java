package com.skillswap.controller;

import com.skillswap.entity.User;
import com.skillswap.repository.*;
import com.skillswap.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final SkillRepository skillRepository;
    private final UserService userService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countActiveUsers();
        long totalSessions = sessionRepository.count();
        long completedSessions = sessionRepository.countByStatus(com.skillswap.entity.Session.Status.COMPLETED);
        long totalSkills = skillRepository.count();

        return ResponseEntity.ok(Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "totalSessions", totalSessions,
            "completedSessions", completedSessions,
            "totalSkills", totalSkills
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<?>> getAllUsers() {
        return ResponseEntity.ok(
            userRepository.findAll().stream()
                .map(u -> userService.mapToUserResponse(u, false))
                .toList()
        );
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<String> blockUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok("User blocked successfully");
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<String> unblockUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok("User unblocked successfully");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/top-skills")
    public ResponseEntity<List<Object[]>> getTopSkills() {
        return ResponseEntity.ok(skillRepository.findTopSkills());
    }
}
