package com.skillswap.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class RoadmapRequest {
    @NotBlank private String targetRole;
    @NotBlank private String currentSkills;
    private String experienceLevel;
    private String timeAvailable;
}
