package com.college.academic.repository;

import com.college.academic.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByFacultyId(String facultyId);
    Optional<Faculty> findByUserId(Long userId);
    Optional<Faculty> findByUserEmail(String email);
    boolean existsByFacultyId(String facultyId);
    List<Faculty> findByDepartment(String department);

    @Query("SELECT f FROM Faculty f WHERE " +
           "LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.facultyId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.department) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faculty> searchFaculty(@Param("query") String query);
}
