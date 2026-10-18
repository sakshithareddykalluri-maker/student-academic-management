package com.college.academic.config;

import com.college.academic.entity.*;
import com.college.academic.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyStudentAssignmentRepository assignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
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

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized. Skipping seed data.");
            return;
        }

        logger.info("Initializing demo seed data for Smart Academic System...");

        // ==========================================
        // 1. Admin User
        // ==========================================
        User adminUser = new User("admin@college.edu", passwordEncoder.encode("Admin@123"), Role.ADMIN);
        userRepository.save(adminUser);
        logger.info("Admin created: admin@college.edu / Admin@123");

        // ==========================================
        // 2. Faculty Users
        // ==========================================
        User fac1User = new User("dr.sharma@college.edu", passwordEncoder.encode("Faculty@123"), Role.FACULTY);
        fac1User = userRepository.save(fac1User);
        Faculty fac1 = new Faculty(fac1User, "FAC-001", "Dr. Rajesh Sharma", "Computer Science", "Professor", "+91 9876543210");
        fac1 = facultyRepository.save(fac1);

        User fac2User = new User("prof.patel@college.edu", passwordEncoder.encode("Faculty@123"), Role.FACULTY);
        fac2User = userRepository.save(fac2User);
        Faculty fac2 = new Faculty(fac2User, "FAC-002", "Prof. Anita Patel", "Computer Science", "Associate Professor", "+91 9876543211");
        fac2 = facultyRepository.save(fac2);

        User fac3User = new User("dr.verma@college.edu", passwordEncoder.encode("Faculty@123"), Role.FACULTY);
        fac3User = userRepository.save(fac3User);
        Faculty fac3 = new Faculty(fac3User, "FAC-003", "Dr. Suresh Verma", "Electronics", "Assistant Professor", "+91 9876543212");
        fac3 = facultyRepository.save(fac3);

        logger.info("Faculty created: dr.sharma@college.edu, prof.patel@college.edu, dr.verma@college.edu / Faculty@123");

        // ==========================================
        // 3. Subjects
        // ==========================================
        Subject sub1 = new Subject("CS301", "Data Structures & Algorithms", "Computer Science", 4, fac1);
        Subject sub2 = new Subject("CS302", "Database Management Systems", "Computer Science", 4, fac2);
        Subject sub3 = new Subject("CS303", "Computer Networks", "Computer Science", 3, fac1);
        Subject sub4 = new Subject("CS304", "Software Engineering", "Computer Science", 3, fac2);
        Subject sub5 = new Subject("EC301", "Digital Signal Processing", "Electronics", 4, fac3);
        Subject sub6 = new Subject("EC302", "Microprocessors & Microcontrollers", "Electronics", 4, fac3);

        sub1 = subjectRepository.save(sub1);
        sub2 = subjectRepository.save(sub2);
        sub3 = subjectRepository.save(sub3);
        sub4 = subjectRepository.save(sub4);
        sub5 = subjectRepository.save(sub5);
        sub6 = subjectRepository.save(sub6);

        // ==========================================
        // 4. Students
        // ==========================================
        List<Student> students = new ArrayList<>();

        // High Risk Students
        students.add(createStudent("rahul.kumar@college.edu", "Rahul Kumar", "CS2023001", "Computer Science", 5, "+91 9123456780"));
        students.add(createStudent("priya.singh@college.edu", "Priya Singh", "CS2023002", "Computer Science", 5, "+91 9123456781"));
        students.add(createStudent("amit.sharma@college.edu", "Amit Sharma", "CS2023003", "Computer Science", 5, "+91 9123456782"));
        students.add(createStudent("manish.tiwari@college.edu", "Manish Tiwari", "EC2023001", "Electronics", 5, "+91 9123456783"));

        // Medium Risk Students
        students.add(createStudent("neha.gupta@college.edu", "Neha Gupta", "CS2023004", "Computer Science", 5, "+91 9123456784"));
        students.add(createStudent("vikram.mehta@college.edu", "Vikram Mehta", "CS2023005", "Computer Science", 5, "+91 9123456785"));
        students.add(createStudent("pooja.reddy@college.edu", "Pooja Reddy", "CS2023006", "Computer Science", 5, "+91 9123456786"));

        // Low Risk Students
        students.add(createStudent("arjun.nair@college.edu", "Arjun Nair", "CS2023007", "Computer Science", 5, "+91 9123456787"));
        students.add(createStudent("ananya.sen@college.edu", "Ananya Sen", "CS2023008", "Computer Science", 5, "+91 9123456788"));
        students.add(createStudent("rohit.verma@college.edu", "Rohit Verma", "CS2023009", "Computer Science", 5, "+91 9123456789"));
        students.add(createStudent("sneha.patil@college.edu", "Sneha Patil", "CS2023010", "Computer Science", 5, "+91 9123456790"));
        students.add(createStudent("kavita.joshi@college.edu", "Kavita Joshi", "EC2023002", "Electronics", 5, "+91 9123456791"));

        // ==========================================
        // 5. Faculty - Student Assignments
        // ==========================================
        for (int i = 0; i < 7; i++) {
            assignmentRepository.save(new FacultyStudentAssignment(fac1, students.get(i), "2025-2026", LocalDate.now().minusMonths(3)));
        }
        for (int i = 3; i < 11; i++) {
            assignmentRepository.save(new FacultyStudentAssignment(fac2, students.get(i), "2025-2026", LocalDate.now().minusMonths(3)));
        }
        assignmentRepository.save(new FacultyStudentAssignment(fac3, students.get(3), "2025-2026", LocalDate.now().minusMonths(3)));
        assignmentRepository.save(new FacultyStudentAssignment(fac3, students.get(11), "2025-2026", LocalDate.now().minusMonths(3)));

        // ==========================================
        // 6. Attendance & Marks Generation
        // ==========================================
        LocalDate startDate = LocalDate.now().minusDays(30);

        for (Student student : students) {
            String roll = student.getRollNo();
            Subject targetSubject = student.getDepartment().equals("Electronics") ? sub5 : sub1;
            Subject secSubject = student.getDepartment().equals("Electronics") ? sub6 : sub2;

            // Determine attendance rate and marks score target based on student persona
            double attRate;
            double marksRate;

            if (roll.equals("CS2023001") || roll.equals("EC2023001")) {
                // High Risk: very poor attendance (55%) and failing marks (32%)
                attRate = 0.55;
                marksRate = 0.32;
            } else if (roll.equals("CS2023002")) {
                // High Risk: acceptable attendance (80%) but failing marks (34%)
                attRate = 0.80;
                marksRate = 0.34;
            } else if (roll.equals("CS2023003")) {
                // High Risk: critical attendance (62%) and borderline marks (42%)
                attRate = 0.62;
                marksRate = 0.42;
            } else if (roll.equals("CS2023004")) {
                // Medium Risk: attendance 78%, marks 52%
                attRate = 0.78;
                marksRate = 0.52;
            } else if (roll.equals("CS2023005")) {
                // Medium Risk: attendance 82%, marks 56%
                attRate = 0.82;
                marksRate = 0.56;
            } else if (roll.equals("CS2023006")) {
                // Medium Risk: attendance 80%, marks 58%
                attRate = 0.80;
                marksRate = 0.58;
            } else {
                // Low Risk: attendance 90-95%, marks 80-90%
                attRate = 0.92;
                marksRate = 0.85;
            }

            // Generate 20 lecture dates
            for (int d = 0; d < 20; d++) {
                LocalDate date = startDate.plusDays(d);
                if (date.getDayOfWeek().getValue() >= 6) continue; // Skip weekends

                // Subject 1 attendance
                boolean isPresent1 = (d % 10) < (attRate * 10);
                attendanceRepository.save(new Attendance(
                        student,
                        targetSubject,
                        date,
                        isPresent1 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
                        targetSubject.getFaculty()
                ));

                // Subject 2 attendance
                boolean isPresent2 = ((d + 3) % 10) < (attRate * 10);
                attendanceRepository.save(new Attendance(
                        student,
                        secSubject,
                        date,
                        isPresent2 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
                        secSubject.getFaculty()
                ));
            }

            // Generate Marks for 3 assessments
            // Assessment 1: Mid-Term Examination (Max 50)
            double score1 = Math.round(50.0 * marksRate * 10.0) / 10.0;
            marksRepository.save(new Marks(student, targetSubject, "Mid-Term Examination", score1, 50.0, targetSubject.getFaculty(), startDate.plusDays(10)));

            // Assessment 2: Quiz 1 (Max 20)
            double score2 = Math.round(20.0 * marksRate * 10.0) / 10.0;
            marksRepository.save(new Marks(student, targetSubject, "Quiz 1", score2, 20.0, targetSubject.getFaculty(), startDate.plusDays(15)));

            // Assessment 3: Assignment 1 (Max 30)
            double score3 = Math.round(30.0 * (marksRate + 0.05 > 1.0 ? 1.0 : marksRate + 0.05) * 10.0) / 10.0;
            marksRepository.save(new Marks(student, targetSubject, "Assignment 1", score3, 30.0, targetSubject.getFaculty(), startDate.plusDays(22)));

            // Subject 2 Marks
            marksRepository.save(new Marks(student, secSubject, "Mid-Term Examination", score1, 50.0, secSubject.getFaculty(), startDate.plusDays(12)));
            marksRepository.save(new Marks(student, secSubject, "Quiz 1", score2, 20.0, secSubject.getFaculty(), startDate.plusDays(18)));
        }

        logger.info("Demo data seeding completed successfully! Total students created: {}", students.size());
    }

    private Student createStudent(String email, String name, String rollNo, String department, int semester, String contact) {
        User user = new User(email, passwordEncoder.encode("Student@123"), Role.STUDENT);
        user = userRepository.save(user);

        Student student = new Student(user, rollNo, name, department, semester, contact, "2025-2026");
        return studentRepository.save(student);
    }
}
