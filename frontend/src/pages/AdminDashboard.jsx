import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import Modal from '../components/Modal';
import { adminService } from '../services/adminService';
import { dashboardService } from '../services/dashboardService';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [riskReports, setRiskReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [reportRiskFilter, setReportRiskFilter] = useState('');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    rollNo: '',
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    semester: 5,
    contactNumber: '',
    academicYear: '2025-2026'
  });

  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    facultyId: '',
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    contactNumber: ''
  });

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    subjectCode: '',
    subjectName: '',
    department: 'Computer Science',
    credits: 4,
    facultyId: ''
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    facultyId: '',
    studentId: '',
    academicYear: '2025-2026'
  });

  const [selectedReport, setSelectedReport] = useState(null);

  // Helper to handle Axios responses and backend response envelopes
  const normalizeResponse = (response) => {
    const body = response?.data ?? response;
    return body?.data ?? body;
  };

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard statistics first
      const statsResponse = await dashboardService.getStats();
      const statsData = normalizeResponse(statsResponse);

      setStats(statsData);

      // Departments are fetched separately so a department API failure
      // does not prevent the dashboard statistics from loading.
      try {
        const deptsResponse = await adminService.getDepartments();
        const deptsData = normalizeResponse(deptsResponse);

        setDepartments(
          Array.isArray(deptsData) ? deptsData : []
        );
      } catch (deptError) {
        console.error('Failed to load departments:', deptError);
        setDepartments([]);
      }

    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(
        err.message || 'Failed to load dashboard statistics.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const response = await adminService.getStudents(
        studentSearch,
        studentDeptFilter
      );

      const data = normalizeResponse(response);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.message || 'Failed to load students.');
    }
  };

  // Fetch Faculty
  const fetchFaculty = async () => {
    try {
      const response = await adminService.getFaculty(facultySearch);

      const data = normalizeResponse(response);
      setFaculty(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load faculty:', err);
      setError(err.message || 'Failed to load faculty.');
    }
  };

  // Fetch Subjects
  const fetchSubjects = async () => {
    try {
      const response = await adminService.getSubjects();

      const data = normalizeResponse(response);
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError(err.message || 'Failed to load subjects.');
    }
  };

  // Fetch Assignments
  const fetchAssignments = async () => {
    try {
      const response = await adminService.getAssignments();

      const data = normalizeResponse(response);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError(err.message || 'Failed to load assignments.');
    }
  };

  // Fetch Risk Reports
  const fetchRiskReports = async () => {
    try {
      const response = await adminService.getRiskReports(
        studentDeptFilter,
        reportRiskFilter
      );

      const data = normalizeResponse(response);
      setRiskReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load risk reports:', err);
      setError(err.message || 'Failed to load risk reports.');
    }
  };

  // Initial Dashboard Load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Load data based on selected tab
  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }

    if (activeTab === 'faculty') {
      fetchFaculty();
    }

    if (activeTab === 'subjects') {
      fetchSubjects();
      fetchFaculty();
    }

    if (activeTab === 'assignments') {
      fetchAssignments();
      fetchFaculty();
      fetchStudents();
    }

    if (activeTab === 'early-warning' || activeTab === 'dashboard') {
      fetchRiskReports();
    }
  }, [
    activeTab,
    studentSearch,
    studentDeptFilter,
    facultySearch,
    reportRiskFilter
  ]);

  // Handle Student Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        await adminService.updateStudent(
          editingStudent.id,
          studentForm
        );
      } else {
        await adminService.createStudent(studentForm);
      }

      setIsStudentModalOpen(false);
      setEditingStudent(null);

      fetchStudents();
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Faculty Submit
  const handleFacultySubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFaculty) {
        await adminService.updateFaculty(
          editingFaculty.id,
          facultyForm
        );
      } else {
        await adminService.createFaculty(facultyForm);
      }

      setIsFacultyModalOpen(false);
      setEditingFaculty(null);

      fetchFaculty();
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Subject Submit
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...subjectForm,
        facultyId: subjectForm.facultyId
          ? Number(subjectForm.facultyId)
          : null
      };

      if (editingSubject) {
        await adminService.updateSubject(
          editingSubject.id,
          payload
        );
      } else {
        await adminService.createSubject(payload);
      }

      setIsSubjectModalOpen(false);
      setEditingSubject(null);

      fetchSubjects();
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Assignment Submit
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();

    try {
      await adminService.createAssignment({
        facultyId: Number(assignForm.facultyId),
        studentId: Number(assignForm.studentId),
        academicYear: assignForm.academicYear
      });

      setIsAssignModalOpen(false);
      fetchAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="main-content">
        <Navbar />

        <main className="page-body">

          {/* ERROR MESSAGE */}
          {error && (
            <div
              style={{
                background: 'var(--risk-high-bg)',
                border: '1px solid var(--risk-high-border)',
                color: 'var(--risk-high-text)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem'
              }}
            >
              {error}

              <button
                className="btn btn-outline btn-sm"
                style={{ marginLeft: '1rem' }}
                onClick={() => {
                  setError('');
                  fetchDashboardData();
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* DASHBOARD LOADING */}
          {activeTab === 'dashboard' && loading && (
            <div className="card">
              <h2>Loading Dashboard...</h2>
              <p>
                Please wait while dashboard statistics are loaded.
              </p>
            </div>
          )}

          {/* DASHBOARD EMPTY STATE */}
          {activeTab === 'dashboard' &&
            !loading &&
            !stats &&
            !error && (
              <div className="card">
                <h2>Dashboard data is unavailable</h2>
                <p>Unable to display dashboard statistics.</p>

                <button
                  className="btn btn-primary"
                  onClick={() => fetchDashboardData()}
                >
                  Retry
                </button>
              </div>
            )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && !loading && stats && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700
                  }}
                >
                  Institutional Overview
                </h2>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                  }}
                >
                  Centralized academic administration, risk analytics,
                  and early-warning monitoring
                </p>
              </div>

              {/* STATISTICS CARDS */}
              <div className="stat-grid">
                <StatCard
                  label="Total Students"
                  value={stats.totalStudents}
                  icon={<Users size={24} />}
                  color="blue"
                />

                <StatCard
                  label="Total Faculty"
                  value={stats.totalFaculty}
                  icon={<GraduationCap size={24} />}
                  color="blue"
                />

                <StatCard
                  label="Subjects Active"
                  value={stats.totalSubjects}
                  icon={<BookOpen size={24} />}
                  color="blue"
                />

                <StatCard
                  label="High Risk Students"
                  value={stats.highRiskCount}
                  subtext="Attendance < 75% or Marks < 40%"
                  icon={<AlertCircle size={24} />}
                  color="red"
                />

                <StatCard
                  label="Medium Risk Students"
                  value={stats.mediumRiskCount}
                  subtext="Attendance < 85% or Marks < 60%"
                  icon={<AlertTriangle size={24} />}
                  color="amber"
                />

                <StatCard
                  label="Low Risk Students"
                  value={stats.lowRiskCount}
                  subtext="Good Standing"
                  icon={<CheckCircle size={24} />}
                  color="green"
                />
              </div>

              {/* DEPARTMENT BREAKDOWN */}
              <div
                className="card"
                style={{ marginBottom: '1.5rem' }}
              >
                <div className="card-title">
                  <span>Departmental Performance Overview</span>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Enrolled Students</th>
                        <th>Faculty Members</th>
                        <th>Avg Attendance</th>
                        <th>Avg Marks</th>
                        <th>High Risk Count</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.departmentStats?.map((dept) => (
                        <tr key={dept.department}>
                          <td style={{ fontWeight: 600 }}>
                            {dept.department}
                          </td>

                          <td>{dept.studentCount}</td>
                          <td>{dept.facultyCount}</td>

                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  dept.averageAttendance < 75
                                    ? 'var(--risk-high-badge)'
                                    : 'inherit'
                              }}
                            >
                              {dept.averageAttendance}%
                            </span>
                          </td>

                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  dept.averageMarks < 40
                                    ? 'var(--risk-high-badge)'
                                    : 'inherit'
                              }}
                            >
                              {dept.averageMarks}%
                            </span>
                          </td>

                          <td>
                            {dept.highRiskCount > 0 ? (
                              <span className="badge badge-high-risk">
                                {dept.highRiskCount} Students
                              </span>
                            ) : (
                              <span className="badge badge-low-risk">
                                0
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HIGH-PRIORITY EARLY WARNING ALERTS */}
              <div className="card">
                <div className="card-title">
                  <span>High-Priority Early-Warning Alerts</span>

                  <button
                    onClick={() => setActiveTab('early-warning')}
                    className="btn btn-outline btn-sm"
                  >
                    View Full Report
                  </button>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Roll No</th>
                        <th>Department</th>
                        <th>Attendance</th>
                        <th>Marks</th>
                        <th>Risk Level</th>
                        <th>Primary Factor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {riskReports
                        .filter((r) => r.riskLevel === 'HIGH_RISK')
                        .slice(0, 5)
                        .map((r) => (
                          <tr key={r.studentId}>
                            <td style={{ fontWeight: 600 }}>
                              {r.name}
                            </td>

                            <td>{r.rollNo}</td>
                            <td>{r.department}</td>

                            <td
                              style={{
                                color:
                                  r.overallAttendancePercentage < 75
                                    ? 'var(--risk-high-badge)'
                                    : 'inherit',
                                fontWeight: 600
                              }}
                            >
                              {r.overallAttendancePercentage}%
                            </td>

                            <td
                              style={{
                                color:
                                  r.overallMarksPercentage < 40
                                    ? 'var(--risk-high-badge)'
                                    : 'inherit',
                                fontWeight: 600
                              }}
                            >
                              {r.overallMarksPercentage}%
                            </td>

                            <td>
                              <RiskBadge level={r.riskLevel} />
                            </td>

                            <td
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)'
                              }}
                            >
                              {r.riskReasons?.[0] ||
                                'Academic intervention required'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="card">
              <div className="card-title">
                <span>Student Directory</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingStudent(null);

                    setStudentForm({
                      rollNo: '',
                      name: '',
                      email: '',
                      password: '',
                      department: 'Computer Science',
                      semester: 5,
                      contactNumber: '',
                      academicYear: '2025-2026'
                    });

                    setIsStudentModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Student
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                    minWidth: '240px'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name, roll no..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />

                  <Search
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-light)'
                    }}
                  />
                </div>

                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>

                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>
                          {s.rollNo}
                        </td>

                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>Sem {s.semester}</td>
                        <td>{s.contactNumber || 'N/A'}</td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem'
                            }}
                          >
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setEditingStudent(s);
                                setStudentForm({
                                  ...s,
                                  password: ''
                                });
                                setIsStudentModalOpen(true);
                              }}
                              title="Edit Student"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Are you sure you want to delete student ${s.name}?`
                                  )
                                ) {
                                  await adminService.deleteStudent(s.id);
                                  fetchStudents();
                                  fetchDashboardData();
                                }
                              }}
                              title="Delete Student"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FACULTY TAB */}
          {activeTab === 'faculty' && (
            <div className="card">
              <div className="card-title">
                <span>Faculty Directory</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingFaculty(null);

                    setFacultyForm({
                      facultyId: '',
                      name: '',
                      email: '',
                      password: '',
                      department: 'Computer Science',
                      designation: 'Assistant Professor',
                      contactNumber: ''
                    });

                    setIsFacultyModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Faculty
                </button>
              </div>

              <div
                style={{
                  position: 'relative',
                  maxWidth: '350px',
                  marginBottom: '1.25rem'
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search faculty..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />

                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)'
                  }}
                />
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Employee Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {faculty.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 600 }}>
                          {f.facultyId}
                        </td>

                        <td>{f.name}</td>
                        <td>{f.email}</td>
                        <td>{f.department}</td>
                        <td>{f.designation}</td>
                        <td>{f.contactNumber || 'N/A'}</td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem'
                            }}
                          >
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setEditingFaculty(f);
                                setFacultyForm({
                                  ...f,
                                  password: ''
                                });
                                setIsFacultyModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (confirm(`Delete faculty ${f.name}?`)) {
                                  await adminService.deleteFaculty(f.id);
                                  fetchFaculty();
                                  fetchDashboardData();
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="card">
              <div className="card-title">
                <span>Course & Subject Catalog</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingSubject(null);

                    setSubjectForm({
                      subjectCode: '',
                      subjectName: '',
                      department: 'Computer Science',
                      credits: 4,
                      facultyId: ''
                    });

                    setIsSubjectModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Add Subject
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject Code</th>
                      <th>Course Title</th>
                      <th>Department</th>
                      <th>Credits</th>
                      <th>Assigned Instructor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600 }}>
                          {sub.subjectCode}
                        </td>

                        <td>{sub.subjectName}</td>
                        <td>{sub.department}</td>
                        <td>{sub.credits} Credits</td>

                        <td>
                          {sub.facultyName
                            ? `${sub.facultyName} (${sub.facultyCode})`
                            : 'Unassigned'}
                        </td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.5rem'
                            }}
                          >
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setEditingSubject(sub);

                                setSubjectForm({
                                  subjectCode: sub.subjectCode,
                                  subjectName: sub.subjectName,
                                  department: sub.department,
                                  credits: sub.credits,
                                  facultyId: sub.facultyId || ''
                                });

                                setIsSubjectModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Delete subject ${sub.subjectName}?`
                                  )
                                ) {
                                  await adminService.deleteSubject(sub.id);
                                  fetchSubjects();
                                  fetchDashboardData();
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="card">
              <div className="card-title">
                <span>Faculty - Student Mentorship Assignments</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setAssignForm({
                      facultyId: '',
                      studentId: '',
                      academicYear: '2025-2026'
                    });

                    setIsAssignModalOpen(true);
                  }}
                >
                  <Plus size={16} /> Assign Student
                </button>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Faculty Mentor</th>
                      <th>Faculty ID</th>
                      <th>Student Name</th>
                      <th>Roll No</th>
                      <th>Department</th>
                      <th>Academic Year</th>
                      <th>Assigned Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>
                          {a.facultyName}
                        </td>

                        <td>{a.facultyCode}</td>
                        <td>{a.studentName}</td>
                        <td>{a.studentRollNo}</td>
                        <td>{a.studentDepartment}</td>
                        <td>{a.academicYear}</td>
                        <td>{a.assignedDate}</td>

                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              if (confirm('Remove mentorship assignment?')) {
                                await adminService.deleteAssignment(a.id);
                                fetchAssignments();
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EARLY-WARNING REPORTS TAB */}
          {activeTab === 'early-warning' && (
            <div className="card">
              <div className="card-title">
                <span>Rule-Based Academic Early-Warning Reports</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={reportRiskFilter}
                  onChange={(e) => setReportRiskFilter(e.target.value)}
                >
                  <option value="">All Risk Levels</option>
                  <option value="HIGH_RISK">
                    High Risk (&lt; 75% Attendance OR &lt; 40% Marks)
                  </option>
                  <option value="MEDIUM_RISK">
                    Medium Risk (&lt; 85% Attendance OR &lt; 60% Marks)
                  </option>
                  <option value="LOW_RISK">
                    Low Risk (Good Standing)
                  </option>
                </select>

                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                >
                  <option value="">All Departments</option>

                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Attendance</th>
                      <th>Marks Score</th>
                      <th>Risk Classification</th>
                      <th>Risk Diagnostic</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {riskReports.map((r) => (
                      <tr key={r.studentId}>
                        <td style={{ fontWeight: 600 }}>
                          {r.rollNo}
                        </td>

                        <td>{r.name}</td>
                        <td>
                          {r.department} (Sem {r.semester})
                        </td>

                        <td
                          style={{
                            fontWeight: 600,
                            color:
                              r.overallAttendancePercentage < 75
                                ? 'var(--risk-high-badge)'
                                : 'inherit'
                          }}
                        >
                          {r.overallAttendancePercentage}% (
                          {r.attendedClasses}/{r.totalClasses} classes)
                        </td>

                        <td
                          style={{
                            fontWeight: 600,
                            color:
                              r.overallMarksPercentage < 40
                                ? 'var(--risk-high-badge)'
                                : 'inherit'
                          }}
                        >
                          {r.overallMarksPercentage}% (
                          {r.totalMarksObtained}/{r.totalMaxMarks})
                        </td>

                        <td>
                          <RiskBadge level={r.riskLevel} />
                        </td>

                        <td
                          style={{
                            maxWidth: '280px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {r.riskReasons?.[0] || 'No academic flags'}
                        </td>

                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedReport(r)}
                          >
                            <Eye size={14} /> Diagnostic
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT STUDENT */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={
          editingStudent
            ? 'Edit Student Profile'
            : 'Register New Student'
        }
      >
        <form onSubmit={handleStudentSubmit}>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input
              type="text"
              className="form-input"
              value={studentForm.rollNo}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  rollNo: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  name: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College Email</label>
            <input
              type="email"
              className="form-input"
              value={studentForm.email}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  email: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password{' '}
              {editingStudent && (
                <span style={{ color: 'var(--text-muted)' }}>
                  (leave blank to keep current)
                </span>
              )}
            </label>

            <input
              type="password"
              className="form-input"
              value={studentForm.password}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  password: e.target.value
                })
              }
              placeholder={
                editingStudent
                  ? '••••••••'
                  : 'Enter initial password'
              }
              required={!editingStudent}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div className="form-group">
              <label className="form-label">Department</label>

              <select
                className="form-select"
                value={studentForm.department}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    department: e.target.value
                  })
                }
              >
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Mechanical Engineering">
                  Mechanical Engineering
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>

              <input
                type="number"
                min="1"
                max="8"
                className="form-input"
                value={studentForm.semester}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    semester: Number(e.target.value)
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>

            <input
              type="text"
              className="form-input"
              value={studentForm.contactNumber}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  contactNumber: e.target.value
                })
              }
            />
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '1rem 0 0',
              borderTop: 'none'
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsStudentModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT FACULTY */}
      <Modal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        title={
          editingFaculty
            ? 'Edit Faculty Member'
            : 'Register New Faculty'
        }
      >
        <form onSubmit={handleFacultySubmit}>
          <div className="form-group">
            <label className="form-label">
              Employee Code / Faculty ID
            </label>

            <input
              type="text"
              className="form-input"
              value={facultyForm.facultyId}
              onChange={(e) =>
                setFacultyForm({
                  ...facultyForm,
                  facultyId: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>

            <input
              type="text"
              className="form-input"
              value={facultyForm.name}
              onChange={(e) =>
                setFacultyForm({
                  ...facultyForm,
                  name: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-input"
              value={facultyForm.email}
              onChange={(e) =>
                setFacultyForm({
                  ...facultyForm,
                  email: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password{' '}
              {editingFaculty && (
                <span style={{ color: 'var(--text-muted)' }}>
                  (leave blank to keep current)
                </span>
              )}
            </label>

            <input
              type="password"
              className="form-input"
              value={facultyForm.password}
              onChange={(e) =>
                setFacultyForm({
                  ...facultyForm,
                  password: e.target.value
                })
              }
              required={!editingFaculty}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div className="form-group">
              <label className="form-label">Department</label>

              <select
                className="form-select"
                value={facultyForm.department}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    department: e.target.value
                  })
                }
              >
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Information Technology">
                  Information Technology
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>

              <input
                type="text"
                className="form-input"
                value={facultyForm.designation}
                onChange={(e) =>
                  setFacultyForm({
                    ...facultyForm,
                    designation: e.target.value
                  })
                }
                required
              />
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '1rem 0 0',
              borderTop: 'none'
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsFacultyModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT SUBJECT */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubjectSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>

            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS305"
              value={subjectForm.subjectCode}
              onChange={(e) =>
                setSubjectForm({
                  ...subjectForm,
                  subjectCode: e.target.value
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Title</label>

            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud Computing"
              value={subjectForm.subjectName}
              onChange={(e) =>
                setSubjectForm({
                  ...subjectForm,
                  subjectName: e.target.value
                })
              }
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div className="form-group">
              <label className="form-label">Department</label>

              <select
                className="form-select"
                value={subjectForm.department}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    department: e.target.value
                  })
                }
              >
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Credits</label>

              <input
                type="number"
                min="1"
                max="6"
                className="form-input"
                value={subjectForm.credits}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    credits: Number(e.target.value)
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Instructor</label>

            <select
              className="form-select"
              value={subjectForm.facultyId}
              onChange={(e) =>
                setSubjectForm({
                  ...subjectForm,
                  facultyId: e.target.value
                })
              }
            >
              <option value="">Unassigned</option>

              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.facultyId}) - {f.department}
                </option>
              ))}
            </select>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '1rem 0 0',
              borderTop: 'none'
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsSubjectModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              {editingSubject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ASSIGN STUDENT TO FACULTY */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Student to Faculty Mentor"
      >
        <form onSubmit={handleAssignmentSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Faculty Mentor
            </label>

            <select
              className="form-select"
              value={assignForm.facultyId}
              onChange={(e) =>
                setAssignForm({
                  ...assignForm,
                  facultyId: e.target.value
                })
              }
              required
            >
              <option value="">-- Choose Faculty --</option>

              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Student</label>

            <select
              className="form-select"
              value={assignForm.studentId}
              onChange={(e) =>
                setAssignForm({
                  ...assignForm,
                  studentId: e.target.value
                })
              }
              required
            >
              <option value="">-- Choose Student --</option>

              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Year</label>

            <input
              type="text"
              className="form-input"
              value={assignForm.academicYear}
              onChange={(e) =>
                setAssignForm({
                  ...assignForm,
                  academicYear: e.target.value
                })
              }
              required
            />
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '1rem 0 0',
              borderTop: 'none'
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EARLY WARNING DIAGNOSTIC REPORT */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Diagnostic Academic Report: ${selectedReport.name} (${selectedReport.rollNo})`}
        >
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>
                {selectedReport.department} &bull; Semester {selectedReport.semester}
              </div>

              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                {selectedReport.email}
              </div>
            </div>

            <RiskBadge level={selectedReport.riskLevel} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div
              style={{
                background: 'var(--bg-muted)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}
              >
                Aggregate Attendance
              </div>

              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color:
                    selectedReport.overallAttendancePercentage < 75
                      ? 'var(--risk-high-badge)'
                      : 'inherit'
                }}
              >
                {selectedReport.overallAttendancePercentage}%
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-light)'
                }}
              >
                {selectedReport.attendedClasses} attended / {selectedReport.totalClasses} total
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-muted)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}
              >
                Aggregate Marks Score
              </div>

              <div
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color:
                    selectedReport.overallMarksPercentage < 40
                      ? 'var(--risk-high-badge)'
                      : 'inherit'
                }}
              >
                {selectedReport.overallMarksPercentage}%
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-light)'
                }}
              >
                {selectedReport.totalMarksObtained} / {selectedReport.totalMaxMarks} total marks
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--risk-high-badge)'
              }}
            >
              Identified Risk Factors:
            </h4>

            <ul
              style={{
                paddingLeft: '1.2rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              {(selectedReport.riskReasons || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--primary)'
              }}
            >
              Tailored Improvement Suggestions:
            </h4>

            <ul
              style={{
                paddingLeft: '1.2rem',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              {(selectedReport.suggestions || []).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}
            >
              Subject-wise Breakdown:
            </h4>

            <div className="table-container">
              <table className="table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attendance</th>
                    <th>Marks</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {(selectedReport.subjectPerformance || []).map((sp) => (
                    <tr key={sp.subjectId}>
                      <td>
                        {sp.subjectCode} - {sp.subjectName}
                      </td>

                      <td>
                        {sp.attendancePercentage}% (
                        {sp.attendedClasses}/{sp.totalClasses})
                      </td>

                      <td>
                        {sp.marksPercentage}% (
                        {sp.totalMarksObtained}/{sp.totalMaxMarks})
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            sp.status === 'Critical'
                              ? 'badge-high-risk'
                              : sp.status.includes('Low') || sp.status === 'Warning'
                                ? 'badge-medium-risk'
                                : 'badge-low-risk'
                          }`}
                        >
                          {sp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}