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
public class SwapRequestService {

    private final SkillRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public SwapRequestResponse sendRequest(String senderEmail, Long receiverId, String message,
                                           String offeredSkill, String wantedSkill) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        if (requestRepository.findBySenderIdAndReceiverId(sender.getId(), receiverId).isPresent()) {
            throw new BadRequestException("Request already sent to this user");
        }

        SkillRequest request = SkillRequest.builder()
                .sender(sender).receiver(receiver)
                .message(message).offeredSkill(offeredSkill)
                .wantedSkill(wantedSkill)
                .status(SkillRequest.Status.PENDING)
                .build();

        request = requestRepository.save(request);

        notificationService.createNotification(receiver, "New Skill Swap Request",
                sender.getName() + " wants to swap skills with you!",
                Notification.NotificationType.NEW_MATCH, "/matches");

        return mapToResponse(request);
    }

    @Transactional
    public SwapRequestResponse updateStatus(String email, Long requestId, SkillRequest.Status status) {
        SkillRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        boolean isReceiver = request.getReceiver().getEmail().equals(email);
        boolean isSender = request.getSender().getEmail().equals(email);

        if (!isReceiver && !isSender) {
            throw new UnauthorizedException("Not authorized");
        }

        request.setStatus(status);
        request = requestRepository.save(request);

        if (status == SkillRequest.Status.ACCEPTED) {
            notificationService.createNotification(request.getSender(), "Request Accepted! 🎉",
                    request.getReceiver().getName() + " accepted your skill swap request!",
                    Notification.NotificationType.REQUEST_ACCEPTED, "/sessions");
        }

        return mapToResponse(request);
    }

    public List<SwapRequestResponse> getMyRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return requestRepository.findAllByUserId(user.getId()).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private SwapRequestResponse mapToResponse(SkillRequest request) {
        return SwapRequestResponse.builder()
                .id(request.getId())
                .sender(mapUserSimple(request.getSender()))
                .receiver(mapUserSimple(request.getReceiver()))
                .message(request.getMessage())
                .status(request.getStatus())
                .offeredSkill(request.getOfferedSkill())
                .wantedSkill(request.getWantedSkill())
                .createdAt(request.getCreatedAt())
                .build();
    }

    private UserResponse mapUserSimple(User user) {
        return UserResponse.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).profileImage(user.getProfileImage())
                .rating(user.getRating()).build();
    }
}
