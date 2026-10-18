package com.college.academic.controller;

import com.college.academic.dto.ApiResponse;
import com.college.academic.dto.AttendanceDTO;
import com.college.academic.dto.EarlyWarningReportDTO;
import com.college.academic.dto.MarksDTO;
import com.college.academic.dto.StudentDTO;
import com.college.academic.entity.User;
import com.college.academic.service.AuthService;
import com.college.academic.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
public class StudentController {

    private final StudentService studentService;
    private final AuthService authService;

    public StudentController(StudentService studentService, AuthService authService) {
        this.studentService = studentService;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentDTO>> getMyProfile() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        StudentDTO profile = studentService.getMyProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved", profile));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceDTO>>> getMyAttendance() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<AttendanceDTO> attendance = studentService.getMyAttendance(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Attendance records retrieved", attendance));
    }

    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getMyMarks() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        List<MarksDTO> marks = studentService.getMyMarks(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Marks records retrieved", marks));
    }

    @GetMapping("/early-warning")
    public ResponseEntity<ApiResponse<EarlyWarningReportDTO>> getMyEarlyWarningReport() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        EarlyWarningReportDTO report = studentService.getMyEarlyWarningReport(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Early-warning report retrieved", report));
    }
}
