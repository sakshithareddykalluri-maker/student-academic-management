package com.college.academic.dto;

import com.college.academic.entity.Role;

public class UserResponse {

    private Long id;
    private String email;
    private Role role;
    private boolean enabled;
    private Long profileId; // Student ID or Faculty ID if applicable
    private String name;
    private String identifier; // Roll No or Faculty ID Code
    private String department;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, Role role, boolean enabled, Long profileId, String name, String identifier, String department) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.enabled = enabled;
        this.profileId = profileId;
        this.name = name;
        this.identifier = identifier;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
