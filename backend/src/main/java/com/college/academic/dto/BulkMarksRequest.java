package com.college.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class BulkMarksRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotBlank(message = "Assessment name is required")
    private String assessmentName;

    @NotNull(message = "Max marks is required")
    @DecimalMin(value = "1.0", message = "Max marks must be greater than zero")
    private Double maxMarks;

    private LocalDate assessmentDate;

    @NotEmpty(message = "Marks records cannot be empty")
    private List<StudentMarksItem> records;

    public static class StudentMarksItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Marks obtained is required")
        @DecimalMin(value = "0.0", message = "Marks cannot be negative")
        private Double marksObtained;

        public StudentMarksItem() {
        }

        public StudentMarksItem(Long studentId, Double marksObtained) {
            this.studentId = studentId;
            this.marksObtained = marksObtained;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public Double getMarksObtained() {
            return marksObtained;
        }

        public void setMarksObtained(Double marksObtained) {
            this.marksObtained = marksObtained;
        }
    }

    public BulkMarksRequest() {
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }

    public List<StudentMarksItem> getRecords() {
        return records;
    }

    public void setRecords(List<StudentMarksItem> records) {
        this.records = records;
    }
}
