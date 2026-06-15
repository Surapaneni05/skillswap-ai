package com.skillswap.controller;

import com.skillswap.dto.*;
import com.skillswap.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> bookSession(
            @AuthenticationPrincipal UserDetails u,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sessionService.bookSession(u.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getMySessions(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(sessionService.getMySessions(u.getUsername()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SessionResponse>> getUpcoming(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(sessionService.getUpcomingSessions(u.getUsername()));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<SessionResponse> completeSession(
            @AuthenticationPrincipal UserDetails u, @PathVariable Long id) {
        return ResponseEntity.ok(sessionService.completeSession(u.getUsername(), id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<SessionResponse> cancelSession(
            @AuthenticationPrincipal UserDetails u, @PathVariable Long id) {
        return ResponseEntity.ok(sessionService.cancelSession(u.getUsername(), id));
    }
}
