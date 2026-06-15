package com.skillswap.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private UserResponse user;
    private Double matchScore;
    private String matchLabel;
    private String commonOfferedSkill;
    private String commonWantedSkill;
    private Double skillCompatibility;
    private Double experienceSimilarity;
    private Double interestMatch;
    private Double ratingScore;
}
