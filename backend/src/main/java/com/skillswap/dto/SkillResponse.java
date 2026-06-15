package com.skillswap.dto;

import com.skillswap.entity.Skill;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillResponse {
    private Long id;
    private String skillName;
    private Skill.Category category;
    private String description;
    private Skill.Level level;
    private Integer yearsOfExperience;
    private Skill.SkillType type;
    private LocalDateTime createdAt;
}
