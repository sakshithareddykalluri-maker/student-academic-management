package com.college.academic.controller;

import com.college.academic.dto.*;
import com.college.academic.entity.RiskLevel;
import com.college.academic.service.AdminService;
import com.college.academic.service.EarlyWarningService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final EarlyWarningService earlyWarningService;

    public AdminController(AdminService adminService, EarlyWarningService earlyWarningService) {
        this.adminService = adminService;
        this.earlyWarningService = earlyWarningService;
    }

    // ==========================================
    // Student Endpoints
    // ==========================================

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentDTO>>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department) {
        List<StudentDTO> students = adminService.getAllStudents(search, department);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> getStudentById(@PathVariable Long id) {
        StudentDTO student = adminService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved", student));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentDTO>> createStudent(@Valid @RequestBody StudentDTO dto) {
        StudentDTO created = adminService.createStudent(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Student created successfully", created));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentDTO>> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDTO dto) {
        StudentDTO updated = adminService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student removed successfully"));
    }

    // ==========================================
    // Faculty Endpoints
    // ==========================================

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<FacultyDTO>>> getAllFaculty(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department) {
        List<FacultyDTO> faculty = adminService.getAllFaculty(search, department);
        return ResponseEntity.ok(ApiResponse.success("Faculty retrieved", faculty));
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<FacultyDTO>> getFacultyById(@PathVariable Long id) {
        FacultyDTO faculty = adminService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty retrieved", faculty));
    }

    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<FacultyDTO>> createFaculty(@Valid @RequestBody FacultyDTO dto) {
        FacultyDTO created = adminService.createFaculty(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Faculty created successfully", created));
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<FacultyDTO>> updateFaculty(@PathVariable Long id, @Valid @RequestBody FacultyDTO dto) {
        FacultyDTO updated = adminService.updateFaculty(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Faculty updated successfully", updated));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        adminService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty removed successfully"));
    }

    // ==========================================
    // Subject Endpoints
    // ==========================================

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getAllSubjects() {
        List<SubjectDTO> subjects = adminService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", subjects));
    }

    @GetMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> getSubjectById(@PathVariable Long id) {
        SubjectDTO subject = adminService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved", subject));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<SubjectDTO>> createSubject(@Valid @RequestBody SubjectDTO dto) {
        SubjectDTO created = adminService.createSubject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subject created successfully", created));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectDTO dto) {
        SubjectDTO updated = adminService.updateSubject(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", updated));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        adminService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject removed successfully"));
    }

    // ==========================================
    // Assignment Endpoints
    // ==========================================

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDTO>>> getAllAssignments() {
        List<AssignmentDTO> assignments = adminService.getAllAssignments();
        return ResponseEntity.ok(ApiResponse.success("Assignments retrieved", assignments));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentDTO>> assignStudentToFaculty(@Valid @RequestBody AssignmentDTO dto) {
        AssignmentDTO created = adminService.assignStudentToFaculty(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Student assigned to faculty successfully", created));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<Void>> removeAssignment(@PathVariable Long id) {
        adminService.removeAssignment(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment removed successfully"));
    }

    // ==========================================
    // Early-Warning & Risk Reports
    // ==========================================

    @GetMapping("/early-warning/reports")
    public ResponseEntity<ApiResponse<List<EarlyWarningReportDTO>>> getRiskReports(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) RiskLevel riskLevel) {
        List<EarlyWarningReportDTO> reports = earlyWarningService.generateAllReports(department, riskLevel);
        return ResponseEntity.ok(ApiResponse.success("Risk reports retrieved", reports));
    }

    @GetMapping("/early-warning/student/{studentId}")
    public ResponseEntity<ApiResponse<EarlyWarningReportDTO>> getStudentRiskReport(@PathVariable Long studentId) {
        EarlyWarningReportDTO report = earlyWarningService.generateStudentReport(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student risk report retrieved", report));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        List<String> departments = adminService.getDistinctDepartments();
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", departments));
    }
}
