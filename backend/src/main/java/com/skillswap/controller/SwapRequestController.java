package com.skillswap.controller;

import com.skillswap.dto.*;
import com.skillswap.entity.SkillRequest;
import com.skillswap.service.SwapRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class SwapRequestController {

    private final SwapRequestService swapRequestService;

    @PostMapping
    public ResponseEntity<SwapRequestResponse> sendRequest(
            @AuthenticationPrincipal UserDetails u,
            @RequestBody Map<String, Object> body) {
        Long receiverId = Long.parseLong(body.get("receiverId").toString());
        String message = (String) body.getOrDefault("message", "");
        String offeredSkill = (String) body.getOrDefault("offeredSkill", "");
        String wantedSkill = (String) body.getOrDefault("wantedSkill", "");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(swapRequestService.sendRequest(u.getUsername(), receiverId, message, offeredSkill, wantedSkill));
    }

    @GetMapping
    public ResponseEntity<List<SwapRequestResponse>> getMyRequests(@AuthenticationPrincipal UserDetails u) {
        return ResponseEntity.ok(swapRequestService.getMyRequests(u.getUsername()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SwapRequestResponse> updateStatus(
            @AuthenticationPrincipal UserDetails u,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        SkillRequest.Status status = SkillRequest.Status.valueOf(body.get("status"));
        return ResponseEntity.ok(swapRequestService.updateStatus(u.getUsername(), id, status));
    }
}
