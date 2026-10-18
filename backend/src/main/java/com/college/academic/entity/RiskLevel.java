package com.college.academic.entity;

public enum RiskLevel {
    HIGH_RISK("High Risk", "Immediate intervention and corrective action required"),
    MEDIUM_RISK("Medium Risk", "Academic performance monitoring and support needed"),
    LOW_RISK("Low Risk", "Satisfactory academic performance and attendance");

    private final String displayName;
    private final String description;

    RiskLevel(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
