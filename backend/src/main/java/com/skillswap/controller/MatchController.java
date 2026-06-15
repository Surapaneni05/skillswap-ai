package com.skillswap.controller;

import com.skillswap.dto.MatchResponse;
import com.skillswap.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMatches(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(matchingService.findMatches(u.getUsername()));
    }
}
