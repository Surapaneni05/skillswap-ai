package com.skillswap.dto;

import com.skillswap.entity.SkillRequest;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwapRequestResponse {
    private Long id;
    private UserResponse sender;
    private UserResponse receiver;
    private String message;
    private SkillRequest.Status status;
    private String offeredSkill;
    private String wantedSkill;
    private LocalDateTime createdAt;
}
