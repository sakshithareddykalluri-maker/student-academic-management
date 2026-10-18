package com.college.academic.dto;

import com.college.academic.entity.RiskLevel;
import java.util.ArrayList;
import java.util.List;

public class EarlyWarningReportDTO {

    private Long studentId;
    private String rollNo;
    private String name;
    private String department;
    private Integer semester;
    private String email;

    private long totalClasses;
    private long attendedClasses;
    private double overallAttendancePercentage;

    private double totalMarksObtained;
    private double totalMaxMarks;
    private double overallMarksPercentage;

    private RiskLevel riskLevel;
    private String riskDisplayName;
    private String riskDescription;

    private List<String> riskReasons = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
    private List<SubjectPerformanceDTO> subjectPerformance = new ArrayList<>();

    public EarlyWarningReportDTO() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public double getOverallAttendancePercentage() {
        return overallAttendancePercentage;
    }

    public void setOverallAttendancePercentage(double overallAttendancePercentage) {
        this.overallAttendancePercentage = overallAttendancePercentage;
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

    public double getOverallMarksPercentage() {
        return overallMarksPercentage;
    }

    public void setOverallMarksPercentage(double overallMarksPercentage) {
        this.overallMarksPercentage = overallMarksPercentage;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
        if (riskLevel != null) {
            this.riskDisplayName = riskLevel.getDisplayName();
            this.riskDescription = riskLevel.getDescription();
        }
    }

    public String getRiskDisplayName() {
        return riskDisplayName;
    }

    public void setRiskDisplayName(String riskDisplayName) {
        this.riskDisplayName = riskDisplayName;
    }

    public String getRiskDescription() {
        return riskDescription;
    }

    public void setRiskDescription(String riskDescription) {
        this.riskDescription = riskDescription;
    }

    public List<String> getRiskReasons() {
        return riskReasons;
    }

    public void setRiskReasons(List<String> riskReasons) {
        this.riskReasons = riskReasons;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<SubjectPerformanceDTO> getSubjectPerformance() {
        return subjectPerformance;
    }

    public void setSubjectPerformance(List<SubjectPerformanceDTO> subjectPerformance) {
        this.subjectPerformance = subjectPerformance;
    }
}
