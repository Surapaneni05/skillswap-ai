package com.skillswap.controller;

import com.skillswap.dto.*;
import com.skillswap.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails u,
            @RequestBody Map<String, Object> body) {
        Long receiverId = Long.parseLong(body.get("receiverId").toString());
        String content = (String) body.get("content");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(u.getUsername(), receiverId, content));
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversation(u.getUsername(), userId));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserResponse>> getContacts(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(messageService.getConversationList(u.getUsername()));
    }
}
