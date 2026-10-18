package com.college.academic.service;

import com.college.academic.dto.*;
import com.college.academic.entity.*;
import com.college.academic.exception.BadRequestException;
import com.college.academic.exception.ResourceNotFoundException;
import com.college.academic.exception.UnauthorizedException;
import com.college.academic.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyStudentAssignmentRepository assignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final EarlyWarningService earlyWarningService;
    private final AdminService adminService;

    public FacultyService(FacultyRepository facultyRepository,
                          StudentRepository studentRepository,
                          SubjectRepository subjectRepository,
                          FacultyStudentAssignmentRepository assignmentRepository,
                          AttendanceRepository attendanceRepository,
                          MarksRepository marksRepository,
                          EarlyWarningService earlyWarningService,
                          AdminService adminService) {
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.earlyWarningService = earlyWarningService;
        this.adminService = adminService;
    }

    public Faculty getFacultyForUser(User user) {
        return facultyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + user.getEmail()));
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getMyAssignedStudents(User facultyUser) {
        Faculty faculty = getFacultyForUser(facultyUser);
        List<Student> students = assignmentRepository.findStudentsByFacultyId(faculty.getId());
        return students.stream()
                .map(adminService::mapToStudentDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectDTO> getMySubjects(User facultyUser) {
        Faculty faculty = getFacultyForUser(facultyUser);
        return subjectRepository.findByFacultyId(faculty.getId()).stream()
                .map(adminService::mapToSubjectDTO)
                .collect(Collectors.toList());
    }

    // ==========================================
    // Attendance Recording
    // ==========================================

    @Transactional
    public AttendanceDTO recordAttendance(User facultyUser, AttendanceDTO dto) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + dto.getSubjectId()));

        verifyFacultyCanManageSubject(faculty, subject);

        // Check if attendance already exists for this date, if so update it
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndSubjectIdAndAttendanceDate(
                student.getId(), subject.getId(), dto.getAttendanceDate()
        );

        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setStatus(dto.getStatus());
            attendance.setRecordedBy(faculty);
        } else {
            attendance = new Attendance(student, subject, dto.getAttendanceDate(), dto.getStatus(), faculty);
        }

        attendance = attendanceRepository.save(attendance);
        return mapToAttendanceDTO(attendance);
    }

    @Transactional
    public List<AttendanceDTO> recordBulkAttendance(User facultyUser, BulkAttendanceRequest request) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        verifyFacultyCanManageSubject(faculty, subject);

        List<AttendanceDTO> result = new ArrayList<>();
        for (BulkAttendanceRequest.StudentAttendanceItem item : request.getRecords()) {
            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + item.getStudentId()));

            Optional<Attendance> existing = attendanceRepository.findByStudentIdAndSubjectIdAndAttendanceDate(
                    student.getId(), subject.getId(), request.getAttendanceDate()
            );

            Attendance attendance;
            if (existing.isPresent()) {
                attendance = existing.get();
                attendance.setStatus(item.getStatus());
                attendance.setRecordedBy(faculty);
            } else {
                attendance = new Attendance(student, subject, request.getAttendanceDate(), item.getStatus(), faculty);
            }
            attendance = attendanceRepository.save(attendance);
            result.add(mapToAttendanceDTO(attendance));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceHistory(User facultyUser, Long subjectId, LocalDate date) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + subjectId));

        verifyFacultyCanManageSubject(faculty, subject);

        List<Attendance> records;
        if (date != null) {
            records = attendanceRepository.findBySubjectIdAndAttendanceDate(subjectId, date);
        } else {
            records = attendanceRepository.findBySubjectId(subjectId);
        }

        return records.stream().map(this::mapToAttendanceDTO).collect(Collectors.toList());
    }

    // ==========================================
    // Marks Recording
    // ==========================================

    @Transactional
    public MarksDTO recordMarks(User facultyUser, MarksDTO dto) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + dto.getSubjectId()));

        verifyFacultyCanManageSubject(faculty, subject);

        if (dto.getMarksObtained() < 0 || dto.getMarksObtained() > dto.getMaxMarks()) {
            throw new BadRequestException("Marks obtained must be between 0 and " + dto.getMaxMarks());
        }

        Optional<Marks> existing = marksRepository.findByStudentIdAndSubjectIdAndAssessmentName(
                student.getId(), subject.getId(), dto.getAssessmentName().trim()
        );

        Marks marks;
        if (existing.isPresent()) {
            marks = existing.get();
            marks.setMarksObtained(dto.getMarksObtained());
            marks.setMaxMarks(dto.getMaxMarks());
            marks.setRecordedBy(faculty);
            if (dto.getAssessmentDate() != null) {
                marks.setAssessmentDate(dto.getAssessmentDate());
            }
        } else {
            marks = new Marks(
                    student,
                    subject,
                    dto.getAssessmentName().trim(),
                    dto.getMarksObtained(),
                    dto.getMaxMarks(),
                    faculty,
                    dto.getAssessmentDate() != null ? dto.getAssessmentDate() : LocalDate.now()
            );
        }

        marks = marksRepository.save(marks);
        return mapToMarksDTO(marks);
    }

    @Transactional
    public List<MarksDTO> recordBulkMarks(User facultyUser, BulkMarksRequest request) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        verifyFacultyCanManageSubject(faculty, subject);

        List<MarksDTO> result = new ArrayList<>();
        LocalDate date = request.getAssessmentDate() != null ? request.getAssessmentDate() : LocalDate.now();

        for (BulkMarksRequest.StudentMarksItem item : request.getRecords()) {
            if (item.getMarksObtained() < 0 || item.getMarksObtained() > request.getMaxMarks()) {
                throw new BadRequestException("Marks for student ID " + item.getStudentId() + " must be between 0 and " + request.getMaxMarks());
            }

            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + item.getStudentId()));

            Optional<Marks> existing = marksRepository.findByStudentIdAndSubjectIdAndAssessmentName(
                    student.getId(), subject.getId(), request.getAssessmentName().trim()
            );

            Marks marks;
            if (existing.isPresent()) {
                marks = existing.get();
                marks.setMarksObtained(item.getMarksObtained());
                marks.setMaxMarks(request.getMaxMarks());
                marks.setRecordedBy(faculty);
                marks.setAssessmentDate(date);
            } else {
                marks = new Marks(
                        student,
                        subject,
                        request.getAssessmentName().trim(),
                        item.getMarksObtained(),
                        request.getMaxMarks(),
                        faculty,
                        date
                );
            }
            marks = marksRepository.save(marks);
            result.add(mapToMarksDTO(marks));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<MarksDTO> getMarksHistory(User facultyUser, Long subjectId) {
        Faculty faculty = getFacultyForUser(facultyUser);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + subjectId));

        verifyFacultyCanManageSubject(faculty, subject);

        return marksRepository.findBySubjectId(subjectId).stream()
                .map(this::mapToMarksDTO)
                .collect(Collectors.toList());
    }

    // ==========================================
    // Assigned Students Early Warning Reports
    // ==========================================

    @Transactional(readOnly = true)
    public List<EarlyWarningReportDTO> getAssignedStudentsEarlyWarningReports(User facultyUser) {
        Faculty faculty = getFacultyForUser(facultyUser);
        List<Student> students = assignmentRepository.findStudentsByFacultyId(faculty.getId());

        return students.stream()
                .map(earlyWarningService::computeStudentRisk)
                .sorted((a, b) -> a.getRiskLevel().compareTo(b.getRiskLevel()))
                .collect(Collectors.toList());
    }

    // ==========================================
    // Security & Verification Helpers
    // ==========================================

    private void verifyFacultyCanManageSubject(Faculty faculty, Subject subject) {
        // Faculty can manage if assigned as instructor or same department
        if (subject.getFaculty() != null && !subject.getFaculty().getId().equals(faculty.getId())
                && !subject.getDepartment().equalsIgnoreCase(faculty.getDepartment())) {
            throw new UnauthorizedException("Faculty is not authorized to manage subject: " + subject.getSubjectCode());
        }
    }

    public AttendanceDTO mapToAttendanceDTO(Attendance a) {
        return new AttendanceDTO(
                a.getId(),
                a.getStudent().getId(),
                a.getStudent().getName(),
                a.getStudent().getRollNo(),
                a.getSubject().getId(),
                a.getSubject().getSubjectCode(),
                a.getSubject().getSubjectName(),
                a.getAttendanceDate(),
                a.getStatus(),
                a.getRecordedBy() != null ? a.getRecordedBy().getId() : null,
                a.getRecordedBy() != null ? a.getRecordedBy().getName() : "System"
        );
    }

    public MarksDTO mapToMarksDTO(Marks m) {
        return new MarksDTO(
                m.getId(),
                m.getStudent().getId(),
                m.getStudent().getName(),
                m.getStudent().getRollNo(),
                m.getSubject().getId(),
                m.getSubject().getSubjectCode(),
                m.getSubject().getSubjectName(),
                m.getAssessmentName(),
                m.getMarksObtained(),
                m.getMaxMarks(),
                m.getRecordedBy() != null ? m.getRecordedBy().getId() : null,
                m.getRecordedBy() != null ? m.getRecordedBy().getName() : "System",
                m.getAssessmentDate()
        );
    }
}
