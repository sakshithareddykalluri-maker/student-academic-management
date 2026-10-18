package com.college.academic.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", indexes = {
    @Index(name = "idx_marks_student", columnList = "student_id"),
    @Index(name = "idx_marks_subject", columnList = "subject_id")
})
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @NotBlank
    @Column(name = "assessment_name", nullable = false, length = 100)
    private String assessmentName;

    @NotNull
    @DecimalMin(value = "0.0")
    @Column(name = "marks_obtained", nullable = false)
    private Double marksObtained;

    @NotNull
    @DecimalMin(value = "1.0")
    @Column(name = "max_marks", nullable = false)
    private Double maxMarks;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recorded_by")
    private Faculty recordedBy;

    @Column(name = "assessment_date")
    private LocalDate assessmentDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Marks() {
    }

    public Marks(Student student, Subject subject, String assessmentName, Double marksObtained, Double maxMarks, Faculty recordedBy, LocalDate assessmentDate) {
        this.student = student;
        this.subject = subject;
        this.assessmentName = assessmentName;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.recordedBy = recordedBy;
        this.assessmentDate = assessmentDate != null ? assessmentDate : LocalDate.now();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.assessmentDate == null) {
            this.assessmentDate = LocalDate.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public Faculty getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(Faculty recordedBy) {
        this.recordedBy = recordedBy;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
