package com.skillswap.dto;

import com.skillswap.entity.Message;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderImage;
    private Long receiverId;
    private String content;
    private Message.MessageType type;
    private Boolean isRead;
    private String fileUrl;
    private String fileName;
    private LocalDateTime createdAt;
}
