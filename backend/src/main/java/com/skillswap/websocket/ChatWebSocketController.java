package com.skillswap.websocket;

import com.skillswap.dto.MessageResponse;
import com.skillswap.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, Object> payload, Principal principal) {
        Long receiverId = Long.parseLong(payload.get("receiverId").toString());
        String content = (String) payload.get("content");

        MessageResponse message = messageService.sendMessage(principal.getName(), receiverId, content);

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
            receiverId.toString(), "/queue/messages", message
        );

        // Send back to sender for confirmation
        messagingTemplate.convertAndSendToUser(
            principal.getName(), "/queue/messages", message
        );
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload Map<String, Object> payload, Principal principal) {
        Long receiverId = Long.parseLong(payload.get("receiverId").toString());
        messagingTemplate.convertAndSendToUser(
            receiverId.toString(), "/queue/typing",
            Map.of("userId", principal.getName(), "isTyping", payload.get("isTyping"))
        );
    }
}
