package com.college.academic.service;

import com.college.academic.dto.AttendanceDTO;
import com.college.academic.dto.EarlyWarningReportDTO;
import com.college.academic.dto.MarksDTO;
import com.college.academic.dto.StudentDTO;
import com.college.academic.entity.Attendance;
import com.college.academic.entity.Marks;
import com.college.academic.entity.Student;
import com.college.academic.entity.User;
import com.college.academic.exception.ResourceNotFoundException;
import com.college.academic.repository.AttendanceRepository;
import com.college.academic.repository.MarksRepository;
import com.college.academic.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final EarlyWarningService earlyWarningService;
    private final AdminService adminService;
    private final FacultyService facultyService;

    public StudentService(StudentRepository studentRepository,
                          AttendanceRepository attendanceRepository,
                          MarksRepository marksRepository,
                          EarlyWarningService earlyWarningService,
                          AdminService adminService,
                          FacultyService facultyService) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.earlyWarningService = earlyWarningService;
        this.adminService = adminService;
        this.facultyService = facultyService;
    }

    public Student getStudentForUser(User user) {
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + user.getEmail()));
    }

    @Transactional(readOnly = true)
    public StudentDTO getMyProfile(User studentUser) {
        Student student = getStudentForUser(studentUser);
        return adminService.mapToStudentDTO(student);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getMyAttendance(User studentUser) {
        Student student = getStudentForUser(studentUser);
        List<Attendance> records = attendanceRepository.findByStudentIdOrderByAttendanceDateDesc(student.getId());
        return records.stream().map(facultyService::mapToAttendanceDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarksDTO> getMyMarks(User studentUser) {
        Student student = getStudentForUser(studentUser);
        List<Marks> records = marksRepository.findByStudentIdOrderByAssessmentDateDesc(student.getId());
        return records.stream().map(facultyService::mapToMarksDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EarlyWarningReportDTO getMyEarlyWarningReport(User studentUser) {
        Student student = getStudentForUser(studentUser);
        return earlyWarningService.computeStudentRisk(student);
    }
}
