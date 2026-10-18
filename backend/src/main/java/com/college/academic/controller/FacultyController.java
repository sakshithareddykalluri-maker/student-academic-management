package com.college.academic.controller;

import com.college.academic.dto.*;
import com.college.academic.entity.User;
import com.college.academic.service.AuthService;
import com.college.academic.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
public class FacultyController {

    private final FacultyService facultyService;
    private final AuthService authService;

    public FacultyController(FacultyService facultyService, AuthService authService) {
        this.facultyService = facultyService;
        this.authService = authService;
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getAssignedStudents() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<StudentDTO> students = facultyService.getMyAssignedStudents(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Assigned students retrieved", students));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getAssignedSubjects() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<SubjectDTO> subjects = facultyService.getMySubjects(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Assigned subjects retrieved", subjects));
    }

    // ==========================================
    // Attendance Endpoints
    // ==========================================

    @PostMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceDTO>> recordAttendance(@Valid @RequestBody AttendanceDTO dto) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        AttendanceDTO saved = facultyService.recordAttendance(currentUser, dto);
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", saved));
    }

    @PostMapping("/attendance/bulk")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> recordBulkAttendance(@Valid @RequestBody BulkAttendanceRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<AttendanceDTO> saved = facultyService.recordBulkAttendance(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Bulk attendance recorded successfully", saved));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getAttendanceHistory(
            @RequestParam Long subjectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<AttendanceDTO> records = facultyService.getAttendanceHistory(currentUser, subjectId, date);
        return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved", records));
    }

    // ==========================================
    // Marks Endpoints
    // ==========================================

    @PostMapping("/marks")
    public ResponseEntity<ApiResponse<MarksDTO>> recordMarks(@Valid @RequestBody MarksDTO dto) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        MarksDTO saved = facultyService.recordMarks(currentUser, dto);
        return ResponseEntity.ok(ApiResponse.success("Marks recorded successfully", saved));
    }

    @PostMapping("/marks/bulk")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> recordBulkMarks(@Valid @RequestBody BulkMarksRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<MarksDTO> saved = facultyService.recordBulkMarks(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Bulk marks recorded successfully", saved));
    }

    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getMarksHistory(@RequestParam Long subjectId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<MarksDTO> records = facultyService.getMarksHistory(currentUser, subjectId);
        return ResponseEntity.ok(ApiResponse.success("Marks history retrieved", records));
    }

    // ==========================================
    // Early-Warning Reports
    // ==========================================

    @GetMapping("/early-warning/reports")
    public ResponseEntity<ApiResponse<List<EarlyWarningReportDTO>>> getAssignedEarlyWarningReports() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<EarlyWarningReportDTO> reports = facultyService.getAssignedStudentsEarlyWarningReports(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Early-warning reports for assigned students retrieved", reports));
    }
}
