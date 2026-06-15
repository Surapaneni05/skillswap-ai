package com.skillswap.dto;

import com.skillswap.entity.Session;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private UserResponse mentor;
    private UserResponse learner;
    private String skill;
    private LocalDate date;
    private LocalTime time;
    private Integer duration;
    private String meetingLink;
    private String notes;
    private Session.Status status;
    private LocalDateTime createdAt;
}
