package com.college.academic.dto;

import java.util.List;

public class DashboardStatsDTO {

    private long totalStudents;
    private long totalFaculty;
    private long totalSubjects;
    private long totalAttendanceRecords;
    private long totalMarksRecords;

    private long highRiskCount;
    private long mediumRiskCount;
    private long lowRiskCount;

    private double averageAttendance;
    private double averageMarks;

    private List<DepartmentStat> departmentStats;

    public static class DepartmentStat {
        private String department;
        private long studentCount;
        private long facultyCount;
        private double averageAttendance;
        private double averageMarks;
        private long highRiskCount;

        public DepartmentStat() {
        }

        public DepartmentStat(String department, long studentCount, long facultyCount, double averageAttendance, double averageMarks, long highRiskCount) {
            this.department = department;
            this.studentCount = studentCount;
            this.facultyCount = facultyCount;
            this.averageAttendance = averageAttendance;
            this.averageMarks = averageMarks;
            this.highRiskCount = highRiskCount;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }

        public long getStudentCount() {
            return studentCount;
        }

        public void setStudentCount(long studentCount) {
            this.studentCount = studentCount;
        }

        public long getFacultyCount() {
            return facultyCount;
        }

        public void setFacultyCount(long facultyCount) {
            this.facultyCount = facultyCount;
        }

        public double getAverageAttendance() {
            return averageAttendance;
        }

        public void setAverageAttendance(double averageAttendance) {
            this.averageAttendance = averageAttendance;
        }

        public double getAverageMarks() {
            return averageMarks;
        }

        public void setAverageMarks(double averageMarks) {
            this.averageMarks = averageMarks;
        }

        public long getHighRiskCount() {
            return highRiskCount;
        }

        public void setHighRiskCount(long highRiskCount) {
            this.highRiskCount = highRiskCount;
        }
    }

    public DashboardStatsDTO() {
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalAttendanceRecords() {
        return totalAttendanceRecords;
    }

    public void setTotalAttendanceRecords(long totalAttendanceRecords) {
        this.totalAttendanceRecords = totalAttendanceRecords;
    }

    public long getTotalMarksRecords() {
        return totalMarksRecords;
    }

    public void setTotalMarksRecords(long totalMarksRecords) {
        this.totalMarksRecords = totalMarksRecords;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public long getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(long mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public long getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(long lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public double getAverageAttendance() {
        return averageAttendance;
    }

    public void setAverageAttendance(double averageAttendance) {
        this.averageAttendance = averageAttendance;
    }

    public double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public List<DepartmentStat> getDepartmentStats() {
        return departmentStats;
    }

    public void setDepartmentStats(List<DepartmentStat> departmentStats) {
        this.departmentStats = departmentStats;
    }
}
