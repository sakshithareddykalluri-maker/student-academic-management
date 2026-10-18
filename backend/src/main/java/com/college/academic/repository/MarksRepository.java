package com.college.academic.repository;

import com.college.academic.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findByStudentIdOrderByAssessmentDateDesc(Long studentId);
    List<Marks> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    List<Marks> findBySubjectId(Long subjectId);
    Optional<Marks> findByStudentIdAndSubjectIdAndAssessmentName(Long studentId, Long subjectId, String assessmentName);
}
