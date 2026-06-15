package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.*;
import com.skillswap.exception.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(String senderEmail, Long receiverId, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = Message.builder()
                .sender(sender).receiver(receiver)
                .content(content)
                .type(Message.MessageType.TEXT)
                .isRead(false)
                .build();

        return mapToResponse(messageRepository.save(message));
    }

    public List<MessageResponse> getConversation(String email, Long otherId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        messageRepository.markMessagesAsRead(otherId, user.getId());
        return messageRepository.findConversation(user.getId(), otherId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getConversationList(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Long> partnerIds = messageRepository.findConversationPartnerIds(user.getId());
        return partnerIds.stream()
                .map(id -> userRepository.findById(id).orElse(null))
                .filter(u -> u != null)
                .map(u -> UserResponse.builder()
                        .id(u.getId()).name(u.getName())
                        .profileImage(u.getProfileImage())
                        .email(u.getEmail()).build())
                .collect(Collectors.toList());
    }

    private MessageResponse mapToResponse(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getName())
                .senderImage(msg.getSender().getProfileImage())
                .receiverId(msg.getReceiver().getId())
                .content(msg.getContent())
                .type(msg.getType())
                .isRead(msg.getIsRead())
                .fileUrl(msg.getFileUrl())
                .fileName(msg.getFileName())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
