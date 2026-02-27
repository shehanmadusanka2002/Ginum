package com.example.GinumApps.controller;

import com.example.GinumApps.dto.ProjectSummaryDto;
import com.example.GinumApps.model.Project;
import com.example.GinumApps.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies/{companyId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<List<ProjectSummaryDto>> getProjectsByCompany(@PathVariable Integer companyId) {
        List<Project> projects = projectRepository.findByCompany_CompanyId(companyId);
        List<ProjectSummaryDto> dtoList = projects.stream()
                .map(p -> ProjectSummaryDto.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .code(p.getCode())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }
}
