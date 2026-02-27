package com.example.GinumApps.controller;

import com.example.GinumApps.dto.CompanyResponseDto;
import com.example.GinumApps.model.Company;
import com.example.GinumApps.repository.CompanyRepository;
import com.example.GinumApps.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final CompanyRepository companyRepository;

    // 1. Get all approved companies
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyResponseDto>> getAllApprovedCompanies() {
        List<CompanyResponseDto> approvedCompanies = companyService.getAllCompanies()
                .stream()
                .filter(company -> company.getStatus() != null && company.getStatus()) // status = true
                .collect(Collectors.toList());
        return ResponseEntity.ok(approvedCompanies);
    }

    // 2. Get all pending company requests (status = false or null)
    @GetMapping("/requests")
    public ResponseEntity<List<CompanyResponseDto>> getPendingCompanyRequests() {
        List<CompanyResponseDto> pendingCompanies = companyService.getAllCompanies()
                .stream()
                .filter(company -> company.getStatus() == null || !company.getStatus()) // status = false
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendingCompanies);
    }

    // 3. Approve a company
    @PutMapping("/companies/{companyId}/approve")
    public ResponseEntity<Map<String, String>> approveCompany(@PathVariable Integer companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

        company.setStatus(true); // Approve the company
        companyRepository.save(company);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Company approved successfully.");
        return ResponseEntity.ok(response);
    }

    // 4. Dashboard Stats
    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        long totalCompanies = companyRepository.count();
        long approvedCount = companyRepository.findAll().stream()
                .filter(c -> c.getStatus() != null && c.getStatus()).count();
        long pendingCount = totalCompanies - approvedCount;

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCompanies", totalCompanies);
        stats.put("approvedCompanies", approvedCount);
        stats.put("pendingRequests", pendingCount);

        return ResponseEntity.ok(stats);
    }
}
