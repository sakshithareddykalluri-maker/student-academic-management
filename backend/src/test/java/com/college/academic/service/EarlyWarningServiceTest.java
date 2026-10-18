package com.college.academic.service;

import com.college.academic.dto.EarlyWarningReportDTO;
import com.college.academic.entity.*;
import com.college.academic.repository.AttendanceRepository;
import com.college.academic.repository.MarksRepository;
import com.college.academic.repository.StudentRepository;
import com.college.academic.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EarlyWarningServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private MarksRepository marksRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private EarlyWarningService earlyWarningService;

    private Student testStudent;
    private Subject testSubject;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(earlyWarningService, "highRiskAttendanceThreshold", 75.0);
        ReflectionTestUtils.setField(earlyWarningService, "highRiskMarksThreshold", 40.0);
        ReflectionTestUtils.setField(earlyWarningService, "mediumRiskAttendanceThreshold", 85.0);
        ReflectionTestUtils.setField(earlyWarningService, "mediumRiskMarksThreshold", 60.0);

        User user = new User("test@college.edu", "password", Role.STUDENT);
        user.setId(10L);

        testStudent = new Student(user, "CS2023999", "Test Student", "Computer Science", 5, "1234567890", "2025-2026");
        testStudent.setId(1L);

        testSubject = new Subject("CS101", "Programming", "Computer Science", 4, null);
        testSubject.setId(1L);
    }

    @Test
    void testComputeStudentRisk_HighRisk_LowAttendance() {
        // Attendance: 6 out of 10 classes present = 60.0% (< 75%)
        List<Attendance> attendances = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            attendances.add(new Attendance(testStudent, testSubject, LocalDate.now().minusDays(i),
                    i < 6 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, null));
        }

        // Marks: 45 out of 50 = 90% (Good)
        List<Marks> marks = List.of(new Marks(testStudent, testSubject, "Mid-Term", 45.0, 50.0, null, LocalDate.now()));

        when(attendanceRepository.findByStudentId(1L)).thenReturn(attendances);
        when(marksRepository.findByStudentId(1L)).thenReturn(marks);
        when(subjectRepository.findByDepartment("Computer Science")).thenReturn(List.of(testSubject));

        EarlyWarningReportDTO report = earlyWarningService.computeStudentRisk(testStudent);

        assertNotNull(report);
        assertEquals(RiskLevel.HIGH_RISK, report.getRiskLevel());
        assertEquals(60.0, report.getOverallAttendancePercentage());
        assertEquals(90.0, report.getOverallMarksPercentage());
        assertFalse(report.getRiskReasons().isEmpty());
        assertTrue(report.getRiskReasons().get(0).contains("Critical Attendance Alert"));
        assertFalse(report.getSuggestions().isEmpty());
    }

    @Test
    void testComputeStudentRisk_HighRisk_LowMarks() {
        // Attendance: 9 out of 10 classes present = 90.0% (> 85%)
        List<Attendance> attendances = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            attendances.add(new Attendance(testStudent, testSubject, LocalDate.now().minusDays(i),
                    i < 9 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, null));
        }

        // Marks: 15 out of 50 = 30% (< 40%)
        List<Marks> marks = List.of(new Marks(testStudent, testSubject, "Mid-Term", 15.0, 50.0, null, LocalDate.now()));

        when(attendanceRepository.findByStudentId(1L)).thenReturn(attendances);
        when(marksRepository.findByStudentId(1L)).thenReturn(marks);
        when(subjectRepository.findByDepartment("Computer Science")).thenReturn(List.of(testSubject));

        EarlyWarningReportDTO report = earlyWarningService.computeStudentRisk(testStudent);

        assertNotNull(report);
        assertEquals(RiskLevel.HIGH_RISK, report.getRiskLevel());
        assertEquals(90.0, report.getOverallAttendancePercentage());
        assertEquals(30.0, report.getOverallMarksPercentage());
        assertTrue(report.getRiskReasons().stream().anyMatch(r -> r.contains("Critical Academic Alert")));
    }

    @Test
    void testComputeStudentRisk_MediumRisk() {
        // Attendance: 8 out of 10 classes = 80.0% (between 75% and 85%)
        List<Attendance> attendances = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            attendances.add(new Attendance(testStudent, testSubject, LocalDate.now().minusDays(i),
                    i < 8 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT, null));
        }

        // Marks: 35 out of 50 = 70% (> 60%)
        List<Marks> marks = List.of(new Marks(testStudent, testSubject, "Mid-Term", 35.0, 50.0, null, LocalDate.now()));

        when(attendanceRepository.findByStudentId(1L)).thenReturn(attendances);
        when(marksRepository.findByStudentId(1L)).thenReturn(marks);
        when(subjectRepository.findByDepartment("Computer Science")).thenReturn(List.of(testSubject));

        EarlyWarningReportDTO report = earlyWarningService.computeStudentRisk(testStudent);

        assertNotNull(report);
        assertEquals(RiskLevel.MEDIUM_RISK, report.getRiskLevel());
        assertEquals(80.0, report.getOverallAttendancePercentage());
        assertEquals(70.0, report.getOverallMarksPercentage());
    }

    @Test
    void testComputeStudentRisk_LowRisk() {
        // Attendance: 10 out of 10 classes = 100.0%
        List<Attendance> attendances = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            attendances.add(new Attendance(testStudent, testSubject, LocalDate.now().minusDays(i), AttendanceStatus.PRESENT, null));
        }

        // Marks: 45 out of 50 = 90%
        List<Marks> marks = List.of(new Marks(testStudent, testSubject, "Mid-Term", 45.0, 50.0, null, LocalDate.now()));

        when(attendanceRepository.findByStudentId(1L)).thenReturn(attendances);
        when(marksRepository.findByStudentId(1L)).thenReturn(marks);
        when(subjectRepository.findByDepartment("Computer Science")).thenReturn(List.of(testSubject));

        EarlyWarningReportDTO report = earlyWarningService.computeStudentRisk(testStudent);

        assertNotNull(report);
        assertEquals(RiskLevel.LOW_RISK, report.getRiskLevel());
        assertEquals(100.0, report.getOverallAttendancePercentage());
        assertEquals(90.0, report.getOverallMarksPercentage());
        assertTrue(report.getRiskReasons().get(0).contains("Good standing"));
    }
}
