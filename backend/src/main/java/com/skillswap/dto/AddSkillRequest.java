package com.skillswap.dto;

import com.skillswap.entity.Skill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddSkillRequest {
    @NotBlank(message = "Skill name is required")
    private String skillName;

    @NotNull(message = "Category is required")
    private Skill.Category category;

    private String description;

    @NotNull(message = "Level is required")
    private Skill.Level level;

    private Integer yearsOfExperience = 0;

    @NotNull(message = "Skill type is required")
    private Skill.SkillType type;
}
