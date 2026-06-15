package com.skillswap.dto;

import com.skillswap.entity.User;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String college;
    private String branch;
    private String year;
    private String location;
    private String profileImage;
    private Integer credits;
    private Double rating;
    private Integer ratingCount;
    private User.Role role;
    private Boolean isVerified;
    private Boolean isActive;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String achievements;
    private String certifications;
    private Integer profileCompletion;
    private List<SkillResponse> skills;
    private LocalDateTime createdAt;
}
