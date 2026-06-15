package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.*;
import com.skillswap.exception.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CreditService creditService;
    private final NotificationService notificationService;

    @Transactional
    public SessionResponse bookSession(String learnerEmail, SessionRequest request) {
        User learner = userRepository.findByEmail(learnerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));

        if (learner.getCredits() < 20) {
            throw new BadRequestException("Insufficient credits. You need 20 credits to book a session.");
        }

        Session session = Session.builder()
                .mentor(mentor)
                .learner(learner)
                .skill(request.getSkill())
                .date(request.getDate())
                .time(request.getTime())
                .duration(request.getDuration() != null ? request.getDuration() : 60)
                .meetingLink(request.getMeetingLink())
                .notes(request.getNotes())
                .status(Session.Status.SCHEDULED)
                .build();

        session = sessionRepository.save(session);

        notificationService.createNotification(mentor, "New Session Booked",
                learner.getName() + " has booked a session with you for " + request.getSkill(),
                Notification.NotificationType.SESSION_REMINDER, "/sessions");

        return mapToResponse(session);
    }

    public List<SessionResponse> getMySessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return sessionRepository.findAllByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SessionResponse> getUpcomingSessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return sessionRepository.findUpcomingByUserId(user.getId(), LocalDate.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionResponse completeSession(String email, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getMentor().getEmail().equals(email)) {
            throw new UnauthorizedException("Only the mentor can complete a session");
        }

        session.setStatus(Session.Status.COMPLETED);
        session = sessionRepository.save(session);

        creditService.deductCredits(session.getLearner(), 20,
                "Session with " + session.getMentor().getName(), sessionId, "SESSION");
        creditService.addCredits(session.getMentor(), 20,
                "Session with " + session.getLearner().getName(), sessionId, "SESSION");

        notificationService.createNotification(session.getLearner(), "Session Completed",
                "Your session with " + session.getMentor().getName() + " has been completed. Please leave a review!",
                Notification.NotificationType.SESSION_COMPLETED, "/reviews");
        notificationService.createNotification(session.getMentor(), "Credits Earned +20",
                "You earned 20 credits for completing a session with " + session.getLearner().getName(),
                Notification.NotificationType.CREDIT_EARNED, "/credits");

        return mapToResponse(session);
    }

    @Transactional
    public SessionResponse cancelSession(String email, Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        boolean isMentor = session.getMentor().getEmail().equals(email);
        boolean isLearner = session.getLearner().getEmail().equals(email);

        if (!isMentor && !isLearner) throw new UnauthorizedException("Not authorized");

        session.setStatus(Session.Status.CANCELLED);
        return mapToResponse(sessionRepository.save(session));
    }

    private SessionResponse mapToResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .mentor(mapUserSimple(session.getMentor()))
                .learner(mapUserSimple(session.getLearner()))
                .skill(session.getSkill())
                .date(session.getDate())
                .time(session.getTime())
                .duration(session.getDuration())
                .meetingLink(session.getMeetingLink())
                .notes(session.getNotes())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .build();
    }

    private UserResponse mapUserSimple(User user) {
        return UserResponse.builder()
                .id(user.getId()).name(user.getName())
                .email(user.getEmail()).profileImage(user.getProfileImage())
                .rating(user.getRating()).credits(user.getCredits())
                .build();
    }
}
