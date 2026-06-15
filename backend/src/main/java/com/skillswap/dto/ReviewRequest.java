package com.skillswap.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
public class ReviewRequest {
    @NotNull private Long sessionId;
    @NotNull private Long revieweeId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String comment;
}
