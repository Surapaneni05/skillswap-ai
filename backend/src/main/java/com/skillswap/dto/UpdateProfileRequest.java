package com.skillswap.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String college;
    private String branch;
    private String year;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String achievements;
    private String certifications;
}
