package com.skillswap.controller;

import com.skillswap.dto.*;
import com.skillswap.service.SkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/me")
    public ResponseEntity<List<SkillResponse>> getMySkills(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(skillService.getMySkills(u.getUsername()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillResponse>> getUserSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(skillService.getSkillsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<SkillResponse> addSkill(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody AddSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(skillService.addSkill(u.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> updateSkill(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable Long id,
            @Valid @RequestBody AddSkillRequest request) {
        return ResponseEntity.ok(skillService.updateSkill(u.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable Long id) {
        skillService.deleteSkill(u.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
