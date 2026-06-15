package com.skillswap.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String skillName;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Level level;

    @Column(nullable = false)
    @Builder.Default
    private Integer yearsOfExperience = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SkillType type = SkillType.OFFERED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Level {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }

    public enum Category {
        PROGRAMMING, AI_ML, DATA_SCIENCE, CLOUD, CYBERSECURITY,
        UI_UX, BUSINESS, COMMUNICATION, LANGUAGES, OTHERS
    }

    public enum SkillType {
        OFFERED, WANTED
    }
}
