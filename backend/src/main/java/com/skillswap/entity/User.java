package com.skillswap.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String college;
    private String branch;
    private String year;
    private String location;
    private String profileImage;

    @Column(nullable = false)
    @Builder.Default
    private Integer credits = 100;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.STUDENT;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    private String verificationToken;
    private String resetPasswordToken;
    private LocalDateTime resetTokenExpiry;

    // Profile extras
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String achievements;
    private String certifications;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Skill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SkillRequest> sentRequests = new ArrayList<>();

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SkillRequest> receivedRequests = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Role {
        STUDENT, ADMIN
    }

    public int getProfileCompletionPercentage() {
        int score = 0;
        if (name != null && !name.isEmpty())
            score += 10;
        if (bio != null && !bio.isEmpty())
            score += 15;
        if (college != null && !college.isEmpty())
            score += 10;
        if (branch != null && !branch.isEmpty())
            score += 10;
        if (location != null && !location.isEmpty())
            score += 10;
        if (profileImage != null && !profileImage.isEmpty())
            score += 15;
        if (githubUrl != null && !githubUrl.isEmpty())
            score += 10;
        if (linkedinUrl != null && !linkedinUrl.isEmpty())
            score += 10;
        // if (skills != null && !skills.isEmpty()) score += 10;
        return score;
    }
}
