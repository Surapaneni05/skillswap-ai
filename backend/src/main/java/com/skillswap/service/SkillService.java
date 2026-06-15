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
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public List<SkillResponse> getSkillsByUser(Long userId) {
        return skillRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SkillResponse> getMySkills(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return skillRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillResponse addSkill(String email, AddSkillRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Skill skill = Skill.builder()
                .skillName(request.getSkillName())
                .category(request.getCategory())
                .description(request.getDescription())
                .level(request.getLevel())
                .yearsOfExperience(request.getYearsOfExperience() != null ? request.getYearsOfExperience() : 0)
                .type(request.getType())
                .user(user)
                .build();

        return mapToResponse(skillRepository.save(skill));
    }

    @Transactional
    public SkillResponse updateSkill(String email, Long skillId, AddSkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        if (!skill.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("Not authorized to update this skill");
        }

        skill.setSkillName(request.getSkillName());
        skill.setCategory(request.getCategory());
        skill.setDescription(request.getDescription());
        skill.setLevel(request.getLevel());
        skill.setYearsOfExperience(request.getYearsOfExperience());
        skill.setType(request.getType());

        return mapToResponse(skillRepository.save(skill));
    }

    @Transactional
    public void deleteSkill(String email, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));

        if (!skill.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("Not authorized to delete this skill");
        }
        skillRepository.delete(skill);
    }

    private SkillResponse mapToResponse(Skill skill) {
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
