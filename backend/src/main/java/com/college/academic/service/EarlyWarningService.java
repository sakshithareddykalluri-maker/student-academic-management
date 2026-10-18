package com.college.academic.service;

import com.college.academic.dto.EarlyWarningReportDTO;
import com.college.academic.dto.SubjectPerformanceDTO;
import com.college.academic.entity.*;
import com.college.academic.exception.ResourceNotFoundException;
import com.college.academic.repository.AttendanceRepository;
import com.college.academic.repository.MarksRepository;
import com.college.academic.repository.StudentRepository;
import com.college.academic.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EarlyWarningService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final SubjectRepository subjectRepository;

    @Value("${app.thresholds.high-risk-attendance:75.0}")
    private double highRiskAttendanceThreshold;

    @Value("${app.thresholds.high-risk-marks:40.0}")
    private double highRiskMarksThreshold;

    @Value("${app.thresholds.medium-risk-attendance:85.0}")
    private double mediumRiskAttendanceThreshold;

    @Value("${app.thresholds.medium-risk-marks:60.0}")
    private double mediumRiskMarksThreshold;

    public EarlyWarningService(StudentRepository studentRepository,
                               AttendanceRepository attendanceRepository,
                               MarksRepository marksRepository,
                               SubjectRepository subjectRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public EarlyWarningReportDTO generateStudentReport(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return computeStudentRisk(student);
    }

    @Transactional(readOnly = true)
    public List<EarlyWarningReportDTO> generateAllReports(String department, RiskLevel riskLevelFilter) {
        List<Student> students;
        if (department != null && !department.isBlank()) {
            students = studentRepository.findByDepartment(department.trim());
        } else {
            students = studentRepository.findAll();
        }

        return students.stream()
                .map(this::computeStudentRisk)
                .filter(report -> riskLevelFilter == null || report.getRiskLevel() == riskLevelFilter)
                .sorted((a, b) -> {
                    // Sort High Risk first, then Medium, then Low
                    int cmp = a.getRiskLevel().compareTo(b.getRiskLevel());
                    if (cmp != 0) return cmp;
                    return Double.compare(a.getOverallAttendancePercentage(), b.getOverallAttendancePercentage());
                })
                .collect(Collectors.toList());
    }

    public EarlyWarningReportDTO computeStudentRisk(Student student) {
        EarlyWarningReportDTO report = new EarlyWarningReportDTO();
        report.setStudentId(student.getId());
        report.setRollNo(student.getRollNo());
        report.setName(student.getName());
        report.setDepartment(student.getDepartment());
        report.setSemester(student.getSemester());
        report.setEmail(student.getUser() != null ? student.getUser().getEmail() : "");

        List<Attendance> attendances = attendanceRepository.findByStudentId(student.getId());
        List<Marks> marksList = marksRepository.findByStudentId(student.getId());

        // Calculate overall attendance
        long totalClasses = attendances.size();
        long attendedClasses = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();
        double overallAttPercentage = totalClasses > 0
                ? Math.round(((double) attendedClasses / totalClasses * 100.0) * 10.0) / 10.0
                : 100.0;

        report.setTotalClasses(totalClasses);
        report.setAttendedClasses(attendedClasses);
        report.setOverallAttendancePercentage(overallAttPercentage);

        // Calculate overall marks
        double totalMarksObtained = marksList.stream().mapToDouble(Marks::getMarksObtained).sum();
        double totalMaxMarks = marksList.stream().mapToDouble(Marks::getMaxMarks).sum();
        double overallMarksPercentage = totalMaxMarks > 0
                ? Math.round((totalMarksObtained / totalMaxMarks * 100.0) * 10.0) / 10.0
                : 100.0;

        report.setTotalMarksObtained(Math.round(totalMarksObtained * 10.0) / 10.0);
        report.setTotalMaxMarks(Math.round(totalMaxMarks * 10.0) / 10.0);
        report.setOverallMarksPercentage(overallMarksPercentage);

        // Subject-wise breakdown
        Set<Subject> subjects = new HashSet<>();
        attendances.forEach(a -> subjects.add(a.getSubject()));
        marksList.forEach(m -> subjects.add(m.getSubject()));

        // Also add department subjects if available
        List<Subject> deptSubjects = subjectRepository.findByDepartment(student.getDepartment());
        subjects.addAll(deptSubjects);

        List<SubjectPerformanceDTO> subjectPerformances = new ArrayList<>();
        List<String> criticalSubjects = new ArrayList<>();
        List<String> lowAttendanceSubjects = new ArrayList<>();
        List<String> lowMarksSubjects = new ArrayList<>();

        for (Subject sub : subjects) {
            long subTotalClasses = attendances.stream().filter(a -> a.getSubject().getId().equals(sub.getId())).count();
            long subAttended = attendances.stream().filter(a -> a.getSubject().getId().equals(sub.getId()) && a.getStatus() == AttendanceStatus.PRESENT).count();
            double subAttPct = subTotalClasses > 0
                    ? Math.round(((double) subAttended / subTotalClasses * 100.0) * 10.0) / 10.0
                    : 100.0;

            List<Marks> subMarks = marksList.stream().filter(m -> m.getSubject().getId().equals(sub.getId())).collect(Collectors.toList());
            double subMarksObt = subMarks.stream().mapToDouble(Marks::getMarksObtained).sum();
            double subMarksMax = subMarks.stream().mapToDouble(Marks::getMaxMarks).sum();
            double subMarksPct = subMarksMax > 0
                    ? Math.round((subMarksObt / subMarksMax * 100.0) * 10.0) / 10.0
                    : 100.0;

            String status = "Good";
            if (subTotalClasses > 0 && subAttPct < highRiskAttendanceThreshold && subMarksMax > 0 && subMarksPct < highRiskMarksThreshold) {
                status = "Critical";
                criticalSubjects.add(sub.getSubjectName());
            } else if (subTotalClasses > 0 && subAttPct < highRiskAttendanceThreshold) {
                status = "Low Attendance";
                lowAttendanceSubjects.add(sub.getSubjectName());
            } else if (subMarksMax > 0 && subMarksPct < highRiskMarksThreshold) {
                status = "Low Marks";
                lowMarksSubjects.add(sub.getSubjectName());
            } else if ((subTotalClasses > 0 && subAttPct < mediumRiskAttendanceThreshold) || (subMarksMax > 0 && subMarksPct < mediumRiskMarksThreshold)) {
                status = "Warning";
            }

            subjectPerformances.add(new SubjectPerformanceDTO(
                    sub.getId(),
                    sub.getSubjectCode(),
                    sub.getSubjectName(),
                    subTotalClasses,
                    subAttended,
                    subAttPct,
                    Math.round(subMarksObt * 10.0) / 10.0,
                    Math.round(subMarksMax * 10.0) / 10.0,
                    subMarksPct,
                    status
            ));
        }

        subjectPerformances.sort(Comparator.comparing(SubjectPerformanceDTO::getSubjectCode));
        report.setSubjectPerformance(subjectPerformances);

        // Deterministic Risk Level Evaluation
        List<String> reasons = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        boolean isHighRisk = false;
        boolean isMediumRisk = false;

        // If no records at all
        if (totalClasses == 0 && totalMaxMarks == 0) {
            report.setRiskLevel(RiskLevel.LOW_RISK);
            reasons.add("New student record: No attendance or examination marks recorded yet.");
            suggestions.add("Ensure attendance is recorded promptly as classes commence.");
            suggestions.add("Review the syllabus and schedule study milestones for the semester.");
            report.setRiskReasons(reasons);
            report.setSuggestions(suggestions);
            return report;
        }

        // High Risk Rule: Attendance < 75% OR Marks < 40%
        if ((totalClasses > 0 && overallAttPercentage < highRiskAttendanceThreshold) ||
            (totalMaxMarks > 0 && overallMarksPercentage < highRiskMarksThreshold)) {
            isHighRisk = true;
        }
        // Medium Risk Rule: Attendance < 85% OR Marks < 60%
        else if ((totalClasses > 0 && overallAttPercentage < mediumRiskAttendanceThreshold) ||
                 (totalMaxMarks > 0 && overallMarksPercentage < mediumRiskMarksThreshold)) {
            isMediumRisk = true;
        }

        if (isHighRisk) {
            report.setRiskLevel(RiskLevel.HIGH_RISK);

            if (totalClasses > 0 && overallAttPercentage < highRiskAttendanceThreshold) {
                reasons.add(String.format("Critical Attendance Alert: Overall attendance is %.1f%%, which is below the mandatory %.0f%% requirement.",
                        overallAttPercentage, highRiskAttendanceThreshold));
            }
            if (totalMaxMarks > 0 && overallMarksPercentage < highRiskMarksThreshold) {
                reasons.add(String.format("Critical Academic Alert: Overall marks score is %.1f%%, which is below the minimum passing threshold of %.0f%%.",
                        overallMarksPercentage, highRiskMarksThreshold));
            }
            if (!criticalSubjects.isEmpty()) {
                reasons.add("Severe deficit in both attendance and marks in: " + String.join(", ", criticalSubjects));
            }

            // High risk suggestions
            suggestions.add("Immediate academic counseling required with assigned faculty mentor.");
            suggestions.add("Attend all upcoming lectures consecutively without absence to recover attendance deficit.");
            suggestions.add("Schedule remedial/doubt-clearing sessions for low-scoring subjects.");
            suggestions.add("Request faculty permission for make-up assignments or compensatory laboratory sessions.");
            suggestions.add("Establish a daily structured study routine of at least 3-4 hours focusing on core subjects.");

        } else if (isMediumRisk) {
            report.setRiskLevel(RiskLevel.MEDIUM_RISK);

            if (totalClasses > 0 && overallAttPercentage < mediumRiskAttendanceThreshold) {
                reasons.add(String.format("Attendance Warning: Attendance is at %.1f%% (target is at least %.0f%% to maintain a safe buffer above 75%%).",
                        overallAttPercentage, mediumRiskAttendanceThreshold));
            }
            if (totalMaxMarks > 0 && overallMarksPercentage < mediumRiskMarksThreshold) {
                reasons.add(String.format("Academic Performance Warning: Aggregate marks are at %.1f%% (target is at least %.0f%% for good standing).",
                        overallMarksPercentage, mediumRiskMarksThreshold));
            }
            if (!lowAttendanceSubjects.isEmpty()) {
                reasons.add("Attendance needs improvement in: " + String.join(", ", lowAttendanceSubjects));
            }
            if (!lowMarksSubjects.isEmpty()) {
                reasons.add("Scores are below benchmark in: " + String.join(", ", lowMarksSubjects));
            }

            // Medium risk suggestions
            suggestions.add("Prioritize attendance in flagged subjects to avoid dropping into High Risk status.");
            suggestions.add("Consult subject teachers during office hours for guidance on weak topics.");
            suggestions.add("Form study groups with peers to prepare thoroughly for upcoming internal assessments.");
            suggestions.add("Review lecture notes and solved problems weekly.");

        } else {
            report.setRiskLevel(RiskLevel.LOW_RISK);
            reasons.add(String.format("Good standing: Attendance (%.1f%%) and academic performance (%.1f%%) exceed standard benchmarks.",
                    overallAttPercentage, overallMarksPercentage));

            suggestions.add("Maintain consistency in daily lecture and lab attendance.");
            suggestions.add("Participate actively in technical workshops, seminars, and extracurricular academic events.");
            suggestions.add("Aim for higher honors and consider helping peers through study circles.");
        }

        report.setRiskReasons(reasons);
        report.setSuggestions(suggestions);
        return report;
    }
}
