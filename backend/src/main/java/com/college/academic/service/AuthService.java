package com.college.academic.service;

import com.college.academic.dto.LoginRequest;
import com.college.academic.dto.UserResponse;
import com.college.academic.entity.Faculty;
import com.college.academic.entity.Role;
import com.college.academic.entity.Student;
import com.college.academic.entity.User;
import com.college.academic.exception.BadRequestException;
import com.college.academic.exception.UnauthorizedException;
import com.college.academic.repository.FacultyRepository;
import com.college.academic.repository.StudentRepository;
import com.college.academic.repository.UserRepository;
import com.college.academic.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       SecurityContextRepository securityContextRepository,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new BadRequestException("Email and password are required");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return buildUserResponse(user);
    }

    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        SecurityContextHolder.clearContext();
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    @Transactional(readOnly = true)
    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("User is not authenticated");
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getUser();
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + email));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUserResponse() {
        User user = getCurrentAuthenticatedUser();
        return buildUserResponse(user);
    }

    private UserResponse buildUserResponse(User user) {
        Long profileId = null;
        String name = user.getEmail();
        String identifier = "";
        String department = "";

        if (user.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                profileId = student.getId();
                name = student.getName();
                identifier = student.getRollNo();
                department = student.getDepartment();
            }
        } else if (user.getRole() == Role.FACULTY) {
            Optional<Faculty> facultyOpt = facultyRepository.findByUserId(user.getId());
            if (facultyOpt.isPresent()) {
                Faculty faculty = facultyOpt.get();
                profileId = faculty.getId();
                name = faculty.getName();
                identifier = faculty.getFacultyId();
                department = faculty.getDepartment();
            }
        } else if (user.getRole() == Role.ADMIN) {
            name = "System Administrator";
            identifier = "ADMIN-01";
            department = "Administration";
        }

        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                profileId,
                name,
                identifier,
                department
        );
    }
}
