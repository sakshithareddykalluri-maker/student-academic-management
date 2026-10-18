package com.college.academic.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MarksDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String studentRollNo;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectCode;
    private String subjectName;

    @NotBlank(message = "Assessment name is required")
    private String assessmentName;

    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.0", message = "Marks obtained cannot be negative")
    private Double marksObtained;

    @NotNull(message = "Max marks is required")
    @DecimalMin(value = "1.0", message = "Max marks must be greater than zero")
    private Double maxMarks;

    private Double percentage;
    private Long recordedById;
    private String recordedByName;
    private LocalDate assessmentDate;

    public MarksDTO() {
    }

    public MarksDTO(Long id, Long studentId, String studentName, String studentRollNo,
                    Long subjectId, String subjectCode, String subjectName,
                    String assessmentName, Double marksObtained, Double maxMarks,
                    Long recordedById, String recordedByName, LocalDate assessmentDate) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentRollNo = studentRollNo;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.assessmentName = assessmentName;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.recordedById = recordedById;
        this.recordedByName = recordedByName;
        this.assessmentDate = assessmentDate;
        if (maxMarks != null && maxMarks > 0 && marksObtained != null) {
            this.percentage = Math.round((marksObtained / maxMarks * 100.0) * 100.0) / 100.0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNo() {
        return studentRollNo;
    }

    public void setStudentRollNo(String studentRollNo) {
        this.studentRollNo = studentRollNo;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
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
        if (this.maxMarks != null && this.maxMarks > 0 && marksObtained != null) {
            this.percentage = Math.round((marksObtained / this.maxMarks * 100.0) * 100.0) / 100.0;
        }
    }

    public Double getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Double maxMarks) {
        this.maxMarks = maxMarks;
        if (maxMarks != null && maxMarks > 0 && this.marksObtained != null) {
            this.percentage = Math.round((this.marksObtained / maxMarks * 100.0) * 100.0) / 100.0;
        }
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Long getRecordedById() {
        return recordedById;
    }

    public void setRecordedById(Long recordedById) {
        this.recordedById = recordedById;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public void setRecordedByName(String recordedByName) {
        this.recordedByName = recordedByName;
    }

    public LocalDate getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(LocalDate assessmentDate) {
        this.assessmentDate = assessmentDate;
    }
}
