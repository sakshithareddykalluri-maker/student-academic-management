package com.college.academic.controller;

import com.college.academic.dto.ApiResponse;
import com.college.academic.dto.DashboardStatsDTO;
import com.college.academic.entity.Role;
import com.college.academic.entity.User;
import com.college.academic.service.AuthService;
import com.college.academic.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    public DashboardController(DashboardService dashboardService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.authService = authService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        DashboardStatsDTO stats;

        if (currentUser.getRole() == Role.ADMIN) {
            stats = dashboardService.getAdminDashboardStats();
        } else if (currentUser.getRole() == Role.FACULTY) {
            stats = dashboardService.getFacultyDashboardStats(currentUser);
        } else {
            // Student gets overall college benchmarks
            stats = dashboardService.getAdminDashboardStats();
        }

        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }
}
