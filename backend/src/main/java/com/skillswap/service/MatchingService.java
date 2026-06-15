package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.*;
import com.skillswap.exception.*;
import com.skillswap.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserService userService;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<MatchResponse> findMatches(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Skill> myOfferedSkills = skillRepository.findByUserIdAndType(currentUser.getId(), Skill.SkillType.OFFERED);
        List<Skill> myWantedSkills  = skillRepository.findByUserIdAndType(currentUser.getId(), Skill.SkillType.WANTED);

        Set<String> myOfferedNames = myOfferedSkills.stream()
                .map(s -> s.getSkillName().toLowerCase()).collect(Collectors.toSet());
        Set<String> myWantedNames  = myWantedSkills.stream()
                .map(s -> s.getSkillName().toLowerCase()).collect(Collectors.toSet());

        List<User> candidates = userRepository.findAllActiveUsersExcept(currentUser.getId());

        return candidates.stream()
                .map(candidate -> computeMatch(candidate, myOfferedNames, myWantedNames))
                .filter(m -> m.getMatchScore() > 0)
                .sorted(Comparator.comparingDouble(MatchResponse::getMatchScore).reversed())
                .limit(50)
                .collect(Collectors.toList());
    }

    private MatchResponse computeMatch(User candidate, Set<String> myOfferedNames, Set<String> myWantedNames) {
        List<Skill> theirSkills = skillRepository.findByUserId(candidate.getId());
        Set<String> theirOfferedNames = theirSkills.stream()
                .filter(s -> s.getType() == Skill.SkillType.OFFERED)
                .map(s -> s.getSkillName().toLowerCase()).collect(Collectors.toSet());
        Set<String> theirWantedNames = theirSkills.stream()
                .filter(s -> s.getType() == Skill.SkillType.WANTED)
                .map(s -> s.getSkillName().toLowerCase()).collect(Collectors.toSet());

        // Skill compatibility: bidirectional
        Set<String> theyOfferWhatIWant = new HashSet<>(theirOfferedNames);
        theyOfferWhatIWant.retainAll(myWantedNames);

        Set<String> iOfferWhatTheyWant = new HashSet<>(myOfferedNames);
        iOfferWhatTheyWant.retainAll(theirWantedNames);

        double bidirectional  = theyOfferWhatIWant.size() + iOfferWhatTheyWant.size();
        double totalPossible  = Math.max(1, myWantedNames.size() + theirWantedNames.size());
        double skillCompat    = Math.min(1.0, bidirectional / totalPossible);

        // Experience similarity
        double avgExp    = theirSkills.stream().mapToInt(Skill::getYearsOfExperience).average().orElse(0);
        double expScore  = 1.0 - Math.min(1.0, Math.abs(avgExp - 2.0) / 5.0);

        // Rating score (normalized 0-1)
        double ratingScore = candidate.getRating() / 5.0;

        // Weighted final score
        double score = (skillCompat * 0.55) + (expScore * 0.20) + (ratingScore * 0.10) + 0.15;
        score = Math.min(1.0, score);

        String matchLabel = score >= 0.85 ? "Highly Recommended" :
                            score >= 0.65 ? "Good Match" :
                            score >= 0.45 ? "Potential Match" : "Low Match";

        return MatchResponse.builder()
                .user(userService.mapToUserResponse(candidate, true))
                .matchScore((double) Math.round(score * 100.0))
                .matchLabel(matchLabel)
                .commonOfferedSkill(theyOfferWhatIWant.isEmpty() ? null : theyOfferWhatIWant.iterator().next())
                .commonWantedSkill(iOfferWhatTheyWant.isEmpty() ? null : iOfferWhatTheyWant.iterator().next())
                .skillCompatibility((double) Math.round(skillCompat * 100.0))
                .ratingScore((double) Math.round(ratingScore * 100.0))
                .build();
    }
}
