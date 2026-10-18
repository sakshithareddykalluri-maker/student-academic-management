package com.college.academic.dto;

import com.college.academic.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AttendanceDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String studentRollNo;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private String subjectCode;
    private String subjectName;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    private Long recordedById;
    private String recordedByName;

    public AttendanceDTO() {
    }

    public AttendanceDTO(Long id, Long studentId, String studentName, String studentRollNo,
                         Long subjectId, String subjectCode, String subjectName,
                         LocalDate attendanceDate, AttendanceStatus status,
                         Long recordedById, String recordedByName) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentRollNo = studentRollNo;
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.recordedById = recordedById;
        this.recordedByName = recordedByName;
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

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
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
}
