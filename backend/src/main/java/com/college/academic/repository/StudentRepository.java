package com.college.academic.repository;

import com.college.academic.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNo(String rollNo);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByUserEmail(String email);
    boolean existsByRollNo(String rollNo);
    List<Student> findByDepartment(String department);
    List<Student> findByDepartmentAndSemester(String department, Integer semester);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.rollNo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);

    @Query("SELECT DISTINCT s.department FROM Student s ORDER BY s.department")
    List<String> findDistinctDepartments();
}
