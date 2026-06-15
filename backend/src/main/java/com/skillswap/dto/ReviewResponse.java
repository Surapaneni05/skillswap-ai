package com.skillswap.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long sessionId;
    private UserResponse reviewer;
    private UserResponse reviewee;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
