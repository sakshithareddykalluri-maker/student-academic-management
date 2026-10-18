package com.college.academic.service;

import com.college.academic.dto.*;
import com.college.academic.entity.*;
import com.college.academic.exception.BadRequestException;
import com.college.academic.exception.ResourceNotFoundException;
import com.college.academic.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyStudentAssignmentRepository assignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        StudentRepository studentRepository,
                        FacultyRepository facultyRepository,
                        SubjectRepository subjectRepository,
                        FacultyStudentAssignmentRepository assignmentRepository,
                        AttendanceRepository attendanceRepository,
                        MarksRepository marksRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.marksRepository = marksRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ==========================================
    // Student Management
    // ==========================================

    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("User email already exists: " + dto.getEmail());
        }
        if (studentRepository.existsByRollNo(dto.getRollNo())) {
            throw new BadRequestException("Roll number already exists: " + dto.getRollNo());
        }

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().isBlank())
                ? dto.getPassword()
                : "Student@123";

        User user = new User(dto.getEmail().trim(), passwordEncoder.encode(rawPassword), Role.STUDENT);
        user.setEnabled(dto.isEnabled());
        user = userRepository.save(user);

        Student student = new Student(
                user,
                dto.getRollNo().trim(),
                dto.getName().trim(),
                dto.getDepartment().trim(),
                dto.getSemester(),
                dto.getContactNumber(),
                dto.getAcademicYear() != null ? dto.getAcademicYear() : "2025-2026"
        );
        student = studentRepository.save(student);

        return mapToStudentDTO(student);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        // Check roll no uniqueness if changed
        if (!student.getRollNo().equalsIgnoreCase(dto.getRollNo().trim()) &&
                studentRepository.existsByRollNo(dto.getRollNo().trim())) {
            throw new BadRequestException("Roll number already exists: " + dto.getRollNo());
        }

        User user = student.getUser();
        if (!user.getEmail().equalsIgnoreCase(dto.getEmail().trim()) &&
                userRepository.existsByEmail(dto.getEmail().trim())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        user.setEmail(dto.getEmail().trim());
        user.setEnabled(dto.isEnabled());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        userRepository.save(user);

        student.setName(dto.getName().trim());
        student.setRollNo(dto.getRollNo().trim());
        student.setDepartment(dto.getDepartment().trim());
        student.setSemester(dto.getSemester());
        student.setContactNumber(dto.getContactNumber());
        if (dto.getAcademicYear() != null) {
            student.setAcademicYear(dto.getAcademicYear());
        }

        student = studentRepository.save(student);
        return mapToStudentDTO(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        // Delete assignments
        List<FacultyStudentAssignment> assignments = assignmentRepository.findByStudentId(id);
        assignmentRepository.deleteAll(assignments);

        // Delete marks
        List<Marks> marks = marksRepository.findByStudentId(id);
        marksRepository.deleteAll(marks);

        // Delete attendance
        List<Attendance> attendances = attendanceRepository.findByStudentId(id);
        attendanceRepository.deleteAll(attendances);

        // Delete student and linked user
        User user = student.getUser();
        studentRepository.delete(student);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToStudentDTO(student);
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents(String search, String department) {
        List<Student> students;
        if (search != null && !search.isBlank()) {
            students = studentRepository.searchStudents(search.trim());
        } else if (department != null && !department.isBlank()) {
            students = studentRepository.findByDepartment(department.trim());
        } else {
            students = studentRepository.findAll();
        }
        return students.stream().map(this::mapToStudentDTO).collect(Collectors.toList());
    }

    // ==========================================
    // Faculty Management
    // ==========================================

    @Transactional
    public FacultyDTO createFaculty(FacultyDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }
        if (facultyRepository.existsByFacultyId(dto.getFacultyId())) {
            throw new BadRequestException("Faculty ID already exists: " + dto.getFacultyId());
        }

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().isBlank())
                ? dto.getPassword()
                : "Faculty@123";

        User user = new User(dto.getEmail().trim(), passwordEncoder.encode(rawPassword), Role.FACULTY);
        user.setEnabled(dto.isEnabled());
        user = userRepository.save(user);

        Faculty faculty = new Faculty(
                user,
                dto.getFacultyId().trim(),
                dto.getName().trim(),
                dto.getDepartment().trim(),
                dto.getDesignation().trim(),
                dto.getContactNumber()
        );
        faculty = facultyRepository.save(faculty);

        return mapToFacultyDTO(faculty);
    }

    @Transactional
    public FacultyDTO updateFaculty(Long id, FacultyDTO dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        if (!faculty.getFacultyId().equalsIgnoreCase(dto.getFacultyId().trim()) &&
                facultyRepository.existsByFacultyId(dto.getFacultyId().trim())) {
            throw new BadRequestException("Faculty ID already exists: " + dto.getFacultyId());
        }

        User user = faculty.getUser();
        if (!user.getEmail().equalsIgnoreCase(dto.getEmail().trim()) &&
                userRepository.existsByEmail(dto.getEmail().trim())) {
            throw new BadRequestException("Email already exists: " + dto.getEmail());
        }

        user.setEmail(dto.getEmail().trim());
        user.setEnabled(dto.isEnabled());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        userRepository.save(user);

        faculty.setName(dto.getName().trim());
        faculty.setFacultyId(dto.getFacultyId().trim());
        faculty.setDepartment(dto.getDepartment().trim());
        faculty.setDesignation(dto.getDesignation().trim());
        faculty.setContactNumber(dto.getContactNumber());

        faculty = facultyRepository.save(faculty);
        return mapToFacultyDTO(faculty);
    }

    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        // Unlink from subjects
        List<Subject> subjects = subjectRepository.findByFacultyId(id);
        for (Subject sub : subjects) {
            sub.setFaculty(null);
            subjectRepository.save(sub);
        }

        // Delete assignments
        List<FacultyStudentAssignment> assignments = assignmentRepository.findByFacultyId(id);
        assignmentRepository.deleteAll(assignments);

        User user = faculty.getUser();
        facultyRepository.delete(faculty);
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Transactional(readOnly = true)
    public FacultyDTO getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));
        return mapToFacultyDTO(faculty);
    }

    @Transactional(readOnly = true)
    public List<FacultyDTO> getAllFaculty(String search, String department) {
        List<Faculty> faculties;
        if (search != null && !search.isBlank()) {
            faculties = facultyRepository.searchFaculty(search.trim());
        } else if (department != null && !department.isBlank()) {
            faculties = facultyRepository.findByDepartment(department.trim());
        } else {
            faculties = facultyRepository.findAll();
        }
        return faculties.stream().map(this::mapToFacultyDTO).collect(Collectors.toList());
    }

    // ==========================================
    // Subject Management
    // ==========================================

    @Transactional
    public SubjectDTO createSubject(SubjectDTO dto) {
        if (subjectRepository.existsBySubjectCode(dto.getSubjectCode())) {
            throw new BadRequestException("Subject code already exists: " + dto.getSubjectCode());
        }

        Faculty faculty = null;
        if (dto.getFacultyId() != null) {
            faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));
        }

        Subject subject = new Subject(
                dto.getSubjectCode().trim().toUpperCase(),
                dto.getSubjectName().trim(),
                dto.getDepartment().trim(),
                dto.getCredits(),
                faculty
        );
        subject = subjectRepository.save(subject);
        return mapToSubjectDTO(subject);
    }

    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        if (!subject.getSubjectCode().equalsIgnoreCase(dto.getSubjectCode().trim()) &&
                subjectRepository.existsBySubjectCode(dto.getSubjectCode().trim().toUpperCase())) {
            throw new BadRequestException("Subject code already exists: " + dto.getSubjectCode());
        }

        Faculty faculty = null;
        if (dto.getFacultyId() != null) {
            faculty = facultyRepository.findById(dto.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));
        }

        subject.setSubjectCode(dto.getSubjectCode().trim().toUpperCase());
        subject.setSubjectName(dto.getSubjectName().trim());
        subject.setDepartment(dto.getDepartment().trim());
        subject.setCredits(dto.getCredits());
        subject.setFaculty(faculty);

        subject = subjectRepository.save(subject);
        return mapToSubjectDTO(subject);
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        // Delete associated marks & attendance
        List<Marks> marks = marksRepository.findBySubjectId(id);
        marksRepository.deleteAll(marks);

        List<Attendance> attendances = attendanceRepository.findBySubjectId(id);
        attendanceRepository.deleteAll(attendances);

        subjectRepository.delete(subject);
    }

    @Transactional(readOnly = true)
    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));
        return mapToSubjectDTO(subject);
    }

    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToSubjectDTO)
                .collect(Collectors.toList());
    }

    // ==========================================
    // Faculty-Student Assignments
    // ==========================================

    @Transactional
    public AssignmentDTO assignStudentToFaculty(AssignmentDTO dto) {
        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));

        if (assignmentRepository.existsByFacultyIdAndStudentId(faculty.getId(), student.getId())) {
            throw new BadRequestException("Student " + student.getName() + " is already assigned to Faculty " + faculty.getName());
        }

        FacultyStudentAssignment assignment = new FacultyStudentAssignment(
                faculty,
                student,
                dto.getAcademicYear() != null ? dto.getAcademicYear() : "2025-2026",
                dto.getAssignedDate() != null ? dto.getAssignedDate() : LocalDate.now()
        );
        assignment = assignmentRepository.save(assignment);
        return mapToAssignmentDTO(assignment);
    }

    @Transactional
    public void removeAssignment(Long assignmentId) {
        FacultyStudentAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));
        assignmentRepository.delete(assignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDTO> getAssignmentsByFaculty(Long facultyId) {
        return assignmentRepository.findByFacultyId(facultyId).stream()
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctDepartments() {
        return studentRepository.findDistinctDepartments();
    }

    // ==========================================
    // Mapping Helpers
    // ==========================================

    public StudentDTO mapToStudentDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setRollNo(student.getRollNo());
        dto.setName(student.getName());
        dto.setDepartment(student.getDepartment());
        dto.setSemester(student.getSemester());
        dto.setContactNumber(student.getContactNumber());
        dto.setAcademicYear(student.getAcademicYear());
        if (student.getUser() != null) {
            dto.setEmail(student.getUser().getEmail());
            dto.setEnabled(student.getUser().isEnabled());
            dto.setUserId(student.getUser().getId());
        }
        return dto;
    }

    public FacultyDTO mapToFacultyDTO(Faculty faculty) {
        FacultyDTO dto = new FacultyDTO();
        dto.setId(faculty.getId());
        dto.setFacultyId(faculty.getFacultyId());
        dto.setName(faculty.getName());
        dto.setDepartment(faculty.getDepartment());
        dto.setDesignation(faculty.getDesignation());
        dto.setContactNumber(faculty.getContactNumber());
        if (faculty.getUser() != null) {
            dto.setEmail(faculty.getUser().getEmail());
            dto.setEnabled(faculty.getUser().isEnabled());
            dto.setUserId(faculty.getUser().getId());
        }
        return dto;
    }

    public SubjectDTO mapToSubjectDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setSubjectCode(subject.getSubjectCode());
        dto.setSubjectName(subject.getSubjectName());
        dto.setDepartment(subject.getDepartment());
        dto.setCredits(subject.getCredits());
        if (subject.getFaculty() != null) {
            dto.setFacultyId(subject.getFaculty().getId());
            dto.setFacultyName(subject.getFaculty().getName());
            dto.setFacultyCode(subject.getFaculty().getFacultyId());
        }
        return dto;
    }

    public AssignmentDTO mapToAssignmentDTO(FacultyStudentAssignment a) {
        AssignmentDTO dto = new AssignmentDTO();
        dto.setId(a.getId());
        dto.setFacultyId(a.getFaculty().getId());
        dto.setFacultyName(a.getFaculty().getName());
        dto.setFacultyCode(a.getFaculty().getFacultyId());
        dto.setStudentId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getName());
        dto.setStudentRollNo(a.getStudent().getRollNo());
        dto.setStudentDepartment(a.getStudent().getDepartment());
        dto.setAcademicYear(a.getAcademicYear());
        dto.setAssignedDate(a.getAssignedDate());
        return dto;
    }
}
