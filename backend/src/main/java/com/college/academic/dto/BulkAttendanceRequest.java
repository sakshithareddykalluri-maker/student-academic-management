package com.college.academic.dto;

import com.college.academic.entity.AttendanceStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class BulkAttendanceRequest {

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotEmpty(message = "Attendance items list cannot be empty")
    private List<StudentAttendanceItem> records;

    public static class StudentAttendanceItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Attendance status is required")
        private AttendanceStatus status;

        public StudentAttendanceItem() {
        }

        public StudentAttendanceItem(Long studentId, AttendanceStatus status) {
            this.studentId = studentId;
            this.status = status;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public AttendanceStatus getStatus() {
            return status;
        }

        public void setStatus(AttendanceStatus status) {
            this.status = status;
        }
    }

    public BulkAttendanceRequest() {
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<StudentAttendanceItem> getRecords() {
        return records;
    }

    public void setRecords(List<StudentAttendanceItem> records) {
        this.records = records;
    }
}
