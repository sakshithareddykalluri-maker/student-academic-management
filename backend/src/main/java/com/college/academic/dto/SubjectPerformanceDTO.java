package com.college.academic.dto;

public class SubjectPerformanceDTO {

    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private long totalClasses;
    private long attendedClasses;
    private double attendancePercentage;

    private double totalMarksObtained;
    private double totalMaxMarks;
    private double marksPercentage;

    private String status; // "Critical", "Warning", "Good", "Not Available"

    public SubjectPerformanceDTO() {
    }

    public SubjectPerformanceDTO(Long subjectId, String subjectCode, String subjectName,
                                 long totalClasses, long attendedClasses, double attendancePercentage,
                                 double totalMarksObtained, double totalMaxMarks, double marksPercentage,
                                 String status) {
        this.subjectId = subjectId;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.totalClasses = totalClasses;
        this.attendedClasses = attendedClasses;
        this.attendancePercentage = attendancePercentage;
        this.totalMarksObtained = totalMarksObtained;
        this.totalMaxMarks = totalMaxMarks;
        this.marksPercentage = marksPercentage;
        this.status = status;
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

    public long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public long getAttendedClasses() {
        return attendedClasses;
    }

    public void setAttendedClasses(long attendedClasses) {
        this.attendedClasses = attendedClasses;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public double getTotalMarksObtained() {
        return totalMarksObtained;
    }

    public void setTotalMarksObtained(double totalMarksObtained) {
        this.totalMarksObtained = totalMarksObtained;
    }

    public double getTotalMaxMarks() {
        return totalMaxMarks;
    }

    public void setTotalMaxMarks(double totalMaxMarks) {
        this.totalMaxMarks = totalMaxMarks;
    }

    public double getMarksPercentage() {
        return marksPercentage;
    }

    public void setMarksPercentage(double marksPercentage) {
        this.marksPercentage = marksPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
