package com.college.academic.service;

import com.college.academic.dto.DashboardStatsDTO;
import com.college.academic.dto.EarlyWarningReportDTO;
import com.college.academic.entity.Faculty;
import com.college.academic.entity.RiskLevel;
import com.college.academic.entity.Student;
import com.college.academic.entity.User;
import com.college.academic.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final EarlyWarningService earlyWarningService;
    private final FacultyStudentAssignmentRepository assignmentRepository;
    private final FacultyService facultyService;

    public DashboardService(StudentRepository studentRepository,
                            FacultyRepository facultyRepository,
                            SubjectRepository subjectRepository,
                            AttendanceRepository attendanceRepository,
                            MarksRepository marksRepository,
                            EarlyWarningService earlyWarningService,
                            FacultyStudentAssignmentRepository assignmentRepository,
                            FacultyService facultyService) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.earlyWarningService = earlyWarningService;
        this.assignmentRepository = assignmentRepository;
        this.facultyService = facultyService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getAdminDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalStudents(studentRepository.count());
        stats.setTotalFaculty(facultyRepository.count());
        stats.setTotalSubjects(subjectRepository.count());
        stats.setTotalAttendanceRecords(attendanceRepository.count());
        stats.setTotalMarksRecords(marksRepository.count());

        List<EarlyWarningReportDTO> allReports = earlyWarningService.generateAllReports(null, null);

        long highRisk = allReports.stream().filter(r -> r.getRiskLevel() == RiskLevel.HIGH_RISK).count();
        long medRisk = allReports.stream().filter(r -> r.getRiskLevel() == RiskLevel.MEDIUM_RISK).count();
        long lowRisk = allReports.stream().filter(r -> r.getRiskLevel() == RiskLevel.LOW_RISK).count();

        stats.setHighRiskCount(highRisk);
        stats.setMediumRiskCount(medRisk);
        stats.setLowRiskCount(lowRisk);

        double avgAtt = allReports.isEmpty() ? 0.0 :
                allReports.stream().mapToDouble(EarlyWarningReportDTO::getOverallAttendancePercentage).average().orElse(0.0);
        double avgMarks = allReports.isEmpty() ? 0.0 :
                allReports.stream().mapToDouble(EarlyWarningReportDTO::getOverallMarksPercentage).average().orElse(0.0);

        stats.setAverageAttendance(Math.round(avgAtt * 10.0) / 10.0);
        stats.setAverageMarks(Math.round(avgMarks * 10.0) / 10.0);

        // Group by department
        Map<String, List<EarlyWarningReportDTO>> byDept = allReports.stream()
                .collect(Collectors.groupingBy(EarlyWarningReportDTO::getDepartment));

        List<DashboardStatsDTO.DepartmentStat> deptStats = new ArrayList<>();
        for (Map.Entry<String, List<EarlyWarningReportDTO>> entry : byDept.entrySet()) {
            String dept = entry.getKey();
            List<EarlyWarningReportDTO> reports = entry.getValue();

            long studentCount = reports.size();
            long facultyCount = facultyRepository.findByDepartment(dept).size();
            double deptAvgAtt = reports.stream().mapToDouble(EarlyWarningReportDTO::getOverallAttendancePercentage).average().orElse(0.0);
            double deptAvgMarks = reports.stream().mapToDouble(EarlyWarningReportDTO::getOverallMarksPercentage).average().orElse(0.0);
            long deptHighRisk = reports.stream().filter(r -> r.getRiskLevel() == RiskLevel.HIGH_RISK).count();

            deptStats.add(new DashboardStatsDTO.DepartmentStat(
                    dept,
                    studentCount,
                    facultyCount,
                    Math.round(deptAvgAtt * 10.0) / 10.0,
                    Math.round(deptAvgMarks * 10.0) / 10.0,
                    deptHighRisk
            ));
        }

        stats.setDepartmentStats(deptStats);
        return stats;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getFacultyDashboardStats(User facultyUser) {
        Faculty faculty = facultyService.getFacultyForUser(facultyUser);
        List<Student> assignedStudents = assignmentRepository.findStudentsByFacultyId(faculty.getId());

        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalStudents(assignedStudents.size());
        stats.setTotalFaculty(1);
        stats.setTotalSubjects(subjectRepository.findByFacultyId(faculty.getId()).size());

        List<EarlyWarningReportDTO> reports = assignedStudents.stream()
                .map(earlyWarningService::computeStudentRisk)
                .collect(Collectors.toList());

        long highRisk = reports.stream().filter(r -> r.getRiskLevel() == RiskLevel.HIGH_RISK).count();
        long medRisk = reports.stream().filter(r -> r.getRiskLevel() == RiskLevel.MEDIUM_RISK).count();
        long lowRisk = reports.stream().filter(r -> r.getRiskLevel() == RiskLevel.LOW_RISK).count();

        stats.setHighRiskCount(highRisk);
        stats.setMediumRiskCount(medRisk);
        stats.setLowRiskCount(lowRisk);

        double avgAtt = reports.isEmpty() ? 0.0 :
                reports.stream().mapToDouble(EarlyWarningReportDTO::getOverallAttendancePercentage).average().orElse(0.0);
        double avgMarks = reports.isEmpty() ? 0.0 :
                reports.stream().mapToDouble(EarlyWarningReportDTO::getOverallMarksPercentage).average().orElse(0.0);

        stats.setAverageAttendance(Math.round(avgAtt * 10.0) / 10.0);
        stats.setAverageMarks(Math.round(avgMarks * 10.0) / 10.0);

        return stats;
    }
}
