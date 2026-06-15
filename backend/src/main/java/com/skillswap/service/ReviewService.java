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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final CreditService creditService;
    private final NotificationService notificationService;

    @Transactional
    public ReviewResponse createReview(String reviewerEmail, ReviewRequest request) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (reviewRepository.existsBySessionIdAndReviewerId(request.getSessionId(), reviewer.getId())) {
            throw new BadRequestException("You have already reviewed this session");
        }

        Review review = Review.builder()
                .session(session)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        review = reviewRepository.save(review);

        // Update reviewee average rating
        Double avgRating = reviewRepository.getAverageRating(reviewee.getId());
        Long reviewCount = reviewRepository.getReviewCount(reviewee.getId());
        reviewee.setRating(avgRating != null ? avgRating : 0.0);
        reviewee.setRatingCount(reviewCount != null ? reviewCount.intValue() : 0);
        userRepository.save(reviewee);

        // Bonus credits for 5-star review
        if (request.getRating() == 5) {
            creditService.addCredits(reviewee, 10, "5-star review bonus from " + reviewer.getName(),
                    review.getId(), "REVIEW");
            notificationService.createNotification(reviewee, "⭐ 5-Star Review Bonus!",
                    reviewer.getName() + " gave you a 5-star rating! +10 credits earned.",
                    Notification.NotificationType.CREDIT_EARNED, "/credits");
        }

        notificationService.createNotification(reviewee, "New Review Received",
                reviewer.getName() + " left you a " + request.getRating() + "-star review.",
                Notification.NotificationType.REVIEW_RECEIVED, "/reviews");

        return mapToResponse(review);
    }

    public List<ReviewResponse> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .sessionId(review.getSession().getId())
                .reviewer(mapUserSimple(review.getReviewer()))
                .reviewee(mapUserSimple(review.getReviewee()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private UserResponse mapUserSimple(User user) {
        return UserResponse.builder()
                .id(user.getId()).name(user.getName())
                .profileImage(user.getProfileImage()).rating(user.getRating())
                .build();
    }
}
