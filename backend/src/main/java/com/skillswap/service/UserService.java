package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.*;
import com.skillswap.exception.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user, true);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user, true);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String query) {
        List<User> users;
        if (query != null && !query.isBlank()) {
            users = userRepository.searchUsers(query);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(u -> mapToUserResponse(u, false)).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getCollege() != null) user.setCollege(request.getCollege());
        if (request.getBranch() != null) user.setBranch(request.getBranch());
        if (request.getYear() != null) user.setYear(request.getYear());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getPortfolioUrl() != null) user.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getAchievements() != null) user.setAchievements(request.getAchievements());
        if (request.getCertifications() != null) user.setCertifications(request.getCertifications());

        return mapToUserResponse(userRepository.save(user), true);
    }

    @Transactional
    public String uploadProfileImage(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String uploadDir = "uploads/profiles/";
        Files.createDirectories(Paths.get(uploadDir));
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());

        user.setProfileImage("/uploads/profiles/" + fileName);
        userRepository.save(user);
        return user.getProfileImage();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getLeaderboard() {
        return userRepository.findTopMentors().stream()
                .limit(20)
                .map(u -> mapToUserResponse(u, false))
                .collect(Collectors.toList());
    }

    public UserResponse mapToUserResponse(User user, boolean includeSkills) {
        List<SkillResponse> skills = null;
        if (includeSkills) {
            skills = skillRepository.findByUserId(user.getId()).stream()
                    .map(this::mapSkillToResponse)
                    .collect(Collectors.toList());
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .college(user.getCollege())
                .branch(user.getBranch())
                .year(user.getYear())
                .location(user.getLocation())
                .profileImage(user.getProfileImage())
                .credits(user.getCredits())
                .rating(user.getRating())
                .ratingCount(user.getRatingCount())
                .role(user.getRole())
                .isVerified(user.getIsVerified())
                .isActive(user.getIsActive())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .achievements(user.getAchievements())
                .certifications(user.getCertifications())
                .profileCompletion(user.getProfileCompletionPercentage())
                .skills(skills)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private SkillResponse mapSkillToResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .skillName(skill.getSkillName())
                .category(skill.getCategory())
                .description(skill.getDescription())
                .level(skill.getLevel())
                .yearsOfExperience(skill.getYearsOfExperience())
                .type(skill.getType())
                .createdAt(skill.getCreatedAt())
                .build();
    }
}
