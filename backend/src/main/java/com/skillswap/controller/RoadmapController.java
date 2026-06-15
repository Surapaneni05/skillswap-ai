package com.skillswap.controller;

import com.skillswap.dto.RoadmapRequest;
import com.skillswap.service.RoadmapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateRoadmap(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody RoadmapRequest request) {
        return ResponseEntity.ok(roadmapService.generateRoadmap(u.getUsername(), request));
    }
}
