package com.skillswap.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionRequest {
    @NotNull private Long mentorId;
    @NotBlank private String skill;
    @NotNull private LocalDate date;
    @NotNull private LocalTime time;
    @Builder.Default private Integer duration = 60;
    private String meetingLink;
    private String notes;
    private Long requestId;
}
