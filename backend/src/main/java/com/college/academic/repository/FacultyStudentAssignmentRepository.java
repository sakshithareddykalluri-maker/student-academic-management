package com.college.academic.repository;

import com.college.academic.entity.FacultyStudentAssignment;
import com.college.academic.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyStudentAssignmentRepository extends JpaRepository<FacultyStudentAssignment, Long> {
    List<FacultyStudentAssignment> findByFacultyId(Long facultyId);
    List<FacultyStudentAssignment> findByStudentId(Long studentId);
    boolean existsByFacultyIdAndStudentId(Long facultyId, Long studentId);
    Optional<FacultyStudentAssignment> findByFacultyIdAndStudentIdAndAcademicYear(Long facultyId, Long studentId, String academicYear);

    @Query("SELECT a.student FROM FacultyStudentAssignment a WHERE a.faculty.id = :facultyId")
    List<Student> findStudentsByFacultyId(@Param("facultyId") Long facultyId);

    void deleteByFacultyIdAndStudentId(Long facultyId, Long studentId);
}
