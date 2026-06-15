package com.skillswap.controller;

import com.skillswap.entity.CreditTransaction;
import com.skillswap.repository.UserRepository;
import com.skillswap.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Integer>> getCreditSummary(@AuthenticationPrincipal UserDetails u) {
        var user = userRepository.findByEmail(u.getUsername()).orElseThrow();
        return ResponseEntity.ok(creditService.getCreditSummary(user.getId()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<CreditTransaction>> getTransactions(@AuthenticationPrincipal UserDetails u) {
        var user = userRepository.findByEmail(u.getUsername()).orElseThrow();
        return ResponseEntity.ok(creditService.getTransactions(user.getId()));
    }
}
