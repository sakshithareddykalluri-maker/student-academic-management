import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import Modal from '../components/Modal';
import { facultyService } from '../services/facultyService';
import { dashboardService } from '../services/dashboardService';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  AlertTriangle,
  Plus,
  Eye,
  AlertCircle
} from 'lucide-react';

// Safely convert API responses into arrays
const toArray = (response, possibleKeys = []) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
  }

  return [];
};

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [riskReports, setRiskReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attendance management state
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isBulkAttendanceOpen, setIsBulkAttendanceOpen] = useState(false);
  const [bulkAttendanceList, setBulkAttendanceList] = useState([]);

  // Marks management state
  const [marksSubjectId, setMarksSubjectId] = useState('');
  const [marksHistory, setMarksHistory] = useState([]);
  const [isBulkMarksOpen, setIsBulkMarksOpen] = useState(false);
  const [bulkMarksData, setBulkMarksData] = useState({
    assessmentName: 'Quiz 2',
    maxMarks: 20,
    assessmentDate: new Date().toISOString().split('T')[0],
    scores: {}
  });

  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch initial dashboard data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        statsData,
        studentsData,
        subjectsData,
        reportsData
      ] = await Promise.all([
        dashboardService.getStats(),
        facultyService.getAssignedStudents(),
        facultyService.getAssignedSubjects(),
        facultyService.getAssignedReports()
      ]);

      setStats(
        statsData?.data && !Array.isArray(statsData.data)
          ? statsData.data
          : statsData
      );

      setAssignedStudents(
        toArray(studentsData, ['students', 'assignedStudents'])
      );

      const subjectsList = toArray(subjectsData, ['subjects']);
      setSubjects(subjectsList);

      // FIX: Reports response may be an object instead of an array
      const reportsList = toArray(reportsData, [
        'reports',
        'riskReports',
        'earlyWarningReports'
      ]);

      setRiskReports(reportsList);

      if (subjectsList.length > 0) {
        setSelectedSubjectId(String(subjectsList[0].id));
        setMarksSubjectId(String(subjectsList[0].id));
      }
    } catch (err) {
      console.error('Faculty dashboard loading error:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch attendance records when subject or date changes
  useEffect(() => {
    if (selectedSubjectId) {
      facultyService
        .getAttendanceHistory(selectedSubjectId, attendanceDate)
        .then((data) => {
          setAttendanceRecords(
            toArray(data, ['records', 'attendanceRecords'])
          );
        })
        .catch((err) => setError(err.message));
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedSubjectId, attendanceDate]);

  // Fetch marks history when subject changes
  useEffect(() => {
    if (marksSubjectId) {
      facultyService
        .getMarksHistory(marksSubjectId)
        .then((data) => {
          setMarksHistory(toArray(data, ['records', 'marksHistory']));
        })
        .catch((err) => setError(err.message));
    } else {
      setMarksHistory([]);
    }
  }, [marksSubjectId]);

  // Open Bulk Attendance Sheet
  const handleOpenBulkAttendance = () => {
    const list = assignedStudents.map((s) => {
      const existing = attendanceRecords.find(
        (r) => r.studentId === s.id
      );

      return {
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        status: existing ? existing.status : 'PRESENT'
      };
    });

    setBulkAttendanceList(list);
    setIsBulkAttendanceOpen(true);
  };

  const handleToggleAttendance = (studentId) => {
    setBulkAttendanceList((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId) {
          return {
            ...item,
            status: item.status === 'PRESENT' ? 'ABSENT' : 'PRESENT'
          };
        }

        return item;
      })
    );
  };

  const handleSaveBulkAttendance = async () => {
    try {
      await facultyService.recordBulkAttendance({
        subjectId: Number(selectedSubjectId),
        attendanceDate,
        records: bulkAttendanceList.map((item) => ({
          studentId: item.studentId,
          status: item.status
        }))
      });

      setIsBulkAttendanceOpen(false);

      const records = await facultyService.getAttendanceHistory(
        selectedSubjectId,
        attendanceDate
      );

      setAttendanceRecords(
        toArray(records, ['records', 'attendanceRecords'])
      );

      const reports = await facultyService.getAssignedReports();

      setRiskReports(
        toArray(reports, ['reports', 'riskReports', 'earlyWarningReports'])
      );

      const statsData = await dashboardService.getStats();

      setStats(
        statsData?.data && !Array.isArray(statsData.data)
          ? statsData.data
          : statsData
      );

      alert('Attendance recorded successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Bulk Marks Form
  const handleOpenBulkMarks = () => {
    const scores = {};

    assignedStudents.forEach((s) => {
      scores[s.id] = '';
    });

    setBulkMarksData({
      assessmentName: 'Mid-Term 2',
      maxMarks: 50,
      assessmentDate: new Date().toISOString().split('T')[0],
      scores
    });

    setIsBulkMarksOpen(true);
  };

  const handleSaveBulkMarks = async (e) => {
    e.preventDefault();

    try {
      const records = Object.entries(bulkMarksData.scores)
        .filter(([_, score]) => score !== '' && !isNaN(score))
        .map(([studentId, score]) => ({
          studentId: Number(studentId),
          marksObtained: Number(score)
        }));

      if (records.length === 0) {
        alert('Please enter at least one student mark.');
        return;
      }

      await facultyService.recordBulkMarks({
        subjectId: Number(marksSubjectId),
        assessmentName: bulkMarksData.assessmentName,
        maxMarks: Number(bulkMarksData.maxMarks),
        assessmentDate: bulkMarksData.assessmentDate,
        records
      });

      setIsBulkMarksOpen(false);

      const history = await facultyService.getMarksHistory(marksSubjectId);

      setMarksHistory(toArray(history, ['records', 'marksHistory']));

      const reports = await facultyService.getAssignedReports();

      setRiskReports(
        toArray(reports, ['reports', 'riskReports', 'earlyWarningReports'])
      );

      const statsData = await dashboardService.getStats();

      setStats(
        statsData?.data && !Array.isArray(statsData.data)
          ? statsData.data
          : statsData
      );

      alert('Marks recorded successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="main-content">
          <Navbar />
          <main className="page-body">
            <p>Loading Faculty Dashboard...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="main-content">
        <Navbar />

        <main className="page-body">
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
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  Faculty Teaching & Mentorship Portal
                </h2>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Manage attendance, assess academic performance, and monitor
                  early-warning indicators for your mentees
                </p>
              </div>

              <div className="stat-grid">
                <StatCard
                  label="Assigned Mentees"
                  value={stats.totalStudents ?? 0}
                  icon={<Users size={24} />}
                  color="blue"
                />

                <StatCard
                  label="Taught Subjects"
                  value={stats.totalSubjects ?? 0}
                  icon={<BookOpen size={24} />}
                  color="blue"
                />

                <StatCard
                  label="Class Avg Attendance"
                  value={`${stats.averageAttendance ?? 0}%`}
                  icon={<CalendarCheck size={24} />}
                  color="blue"
                />

                <StatCard
                  label="Class Avg Marks"
                  value={`${stats.averageMarks ?? 0}%`}
                  icon={<Award size={24} />}
                  color="blue"
                />

                <StatCard
                  label="High-Risk Mentees"
                  value={stats.highRiskCount ?? 0}
                  subtext="Urgent action required"
                  icon={<AlertCircle size={24} />}
                  color="red"
                />

                <StatCard
                  label="Medium-Risk Mentees"
                  value={stats.mediumRiskCount ?? 0}
                  subtext="Monitoring needed"
                  icon={<AlertTriangle size={24} />}
                  color="amber"
                />
              </div>

              {/* Mentee Risk Overview */}
              <div className="card">
                <div className="card-title">
                  <span>Assigned Mentee Academic Health</span>

                  <button
                    onClick={() => setActiveTab('early-warning')}
                    className="btn btn-outline btn-sm"
                  >
                    View Full Risk Analysis
                  </button>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Attendance</th>
                        <th>Marks Score</th>
                        <th>Risk Level</th>
                        <th>Status / Diagnostic Flag</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {riskReports.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                            No risk reports available.
                          </td>
                        </tr>
                      ) : (
                        riskReports.map((r) => {
                          const reasons = toArray(r.riskReasons);

                          return (
                            <tr key={r.studentId}>
                              <td style={{ fontWeight: 600 }}>{r.rollNo}</td>
                              <td>{r.name}</td>

                              <td
                                style={{
                                  fontWeight: 600,
                                  color:
                                    r.overallAttendancePercentage < 75
                                      ? 'var(--risk-high-badge)'
                                      : 'inherit'
                                }}
                              >
                                {r.overallAttendancePercentage ?? 0}%
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
                                {r.overallMarksPercentage ?? 0}%
                              </td>

                              <td><RiskBadge level={r.riskLevel} /></td>

                              <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {reasons[0] || 'Good standing'}
                              </td>

                              <td>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => setSelectedReport(r)}
                                >
                                  <Eye size={14} /> View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ASSIGNED STUDENTS TAB */}
          {activeTab === 'my-students' && (
            <div className="card">
              <div className="card-title">
                <span>My Assigned Students ({assignedStudents.length})</span>
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
                      <th>Academic Year</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedStudents.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>Sem {s.semester}</td>
                        <td>{s.contactNumber || 'N/A'}</td>
                        <td>{s.academicYear}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-title">
                <span>Attendance Management</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenBulkAttendance}
                >
                  <Plus size={16} /> Record Attendance Sheet
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '220px' }}>
                  <label className="form-label">Subject</label>

                  <select
                    className="form-select"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subjectCode} - {sub.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Date</label>

                  <input
                    type="date"
                    className="form-input"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Subject Code</th>
                      <th>Status</th>
                      <th>Recorded By</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No attendance records found for this date. Click
                          "Record Attendance Sheet" to take attendance.
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((r) => (
                        <tr key={r.id}>
                          <td>{r.attendanceDate}</td>
                          <td style={{ fontWeight: 600 }}>{r.studentRollNo}</td>
                          <td>{r.studentName}</td>
                          <td>{r.subjectCode}</td>
                          <td>
                            <span className={`badge ${r.status === 'PRESENT' ? 'badge-low-risk' : 'badge-high-risk'}`}>
                              {r.status}
                            </span>
                          </td>
                          <td>{r.recordedByName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MARKS & ASSESSMENTS TAB */}
          {activeTab === 'marks' && (
            <div className="card">
              <div className="card-title">
                <span>Assessment & Marks Entry</span>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenBulkMarks}
                >
                  <Plus size={16} /> Enter Examination Marks
                </button>
              </div>

              <div style={{ maxWidth: '300px', marginBottom: '1.25rem' }}>
                <label className="form-label">Select Subject</label>

                <select
                  className="form-select"
                  value={marksSubjectId}
                  onChange={(e) => setMarksSubjectId(e.target.value)}
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subjectCode} - {sub.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Assessment Name</th>
                      <th>Date</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Marks Obtained</th>
                      <th>Max Marks</th>
                      <th>Score %</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marksHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No assessment marks recorded for this subject yet.
                          Click "Enter Examination Marks" to add scores.
                        </td>
                      </tr>
                    ) : (
                      marksHistory.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.assessmentName}</td>
                          <td>{m.assessmentDate || 'N/A'}</td>
                          <td>{m.studentRollNo}</td>
                          <td>{m.studentName}</td>
                          <td style={{ fontWeight: 600 }}>{m.marksObtained}</td>
                          <td>{m.maxMarks}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  m.percentage < 40
                                    ? 'var(--risk-high-badge)'
                                    : m.percentage < 60
                                      ? 'var(--risk-med-badge)'
                                      : 'var(--risk-low-badge)'
                              }}
                            >
                              {m.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RISK ALERTS TAB */}
          {activeTab === 'early-warning' && (
            <div className="card">
              <div className="card-title">
                <span>Assigned Mentee Early-Warning Diagnostic</span>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Attendance</th>
                      <th>Marks Aggregate</th>
                      <th>Risk Classification</th>
                      <th>Identified Risk Reasons</th>
                      <th>Recommended Action</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {riskReports.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No early-warning reports available.
                        </td>
                      </tr>
                    ) : (
                      riskReports.map((r) => {
                        const reasons = toArray(r.riskReasons);
                        const suggestions = toArray(r.suggestions);

                        return (
                          <tr key={r.studentId}>
                            <td style={{ fontWeight: 600 }}>{r.rollNo}</td>
                            <td>{r.name}</td>
                            <td>{r.overallAttendancePercentage ?? 0}%</td>
                            <td>{r.overallMarksPercentage ?? 0}%</td>
                            <td><RiskBadge level={r.riskLevel} /></td>
                            <td style={{ fontSize: '0.85rem' }}>
                              {reasons[0] || 'No risk reasons'}
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                              {suggestions[0] || 'No suggestions'}
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: BULK ATTENDANCE SHEET */}
      <Modal
        isOpen={isBulkAttendanceOpen}
        onClose={() => setIsBulkAttendanceOpen(false)}
        title={`Attendance Sheet - Date: ${attendanceDate}`}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Toggle student attendance status between Present and Absent.
          Click Save to record all entries.
        </p>

        <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '1rem' }}>
          <table className="table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Toggle Action</th>
              </tr>
            </thead>

            <tbody>
              {bulkAttendanceList.map((item) => (
                <tr key={item.studentId}>
                  <td style={{ fontWeight: 600 }}>{item.rollNo}</td>
                  <td>{item.name}</td>
                  <td>
                    <span className={`badge ${item.status === 'PRESENT' ? 'badge-low-risk' : 'badge-high-risk'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${item.status === 'PRESENT' ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleToggleAttendance(item.studentId)}
                    >
                      Mark {item.status === 'PRESENT' ? 'Absent' : 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsBulkAttendanceOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveBulkAttendance}
          >
            Submit Attendance
          </button>
        </div>
      </Modal>

      {/* MODAL: BULK MARKS ENTRY */}
      <Modal
        isOpen={isBulkMarksOpen}
        onClose={() => setIsBulkMarksOpen(false)}
        title="Record Examination / Assessment Marks"
      >
        <form onSubmit={handleSaveBulkMarks}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Assessment Title</label>

              <input
                type="text"
                className="form-input"
                value={bulkMarksData.assessmentName}
                onChange={(e) => setBulkMarksData({
                  ...bulkMarksData,
                  assessmentName: e.target.value
                })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Maximum Marks</label>

              <input
                type="number"
                min="1"
                className="form-input"
                value={bulkMarksData.maxMarks}
                onChange={(e) => setBulkMarksData({
                  ...bulkMarksData,
                  maxMarks: Number(e.target.value)
                })}
                required
              />
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ width: '130px' }}>Marks Obtained</th>
                </tr>
              </thead>

              <tbody>
                {assignedStudents.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max={bulkMarksData.maxMarks}
                        step="0.5"
                        placeholder="0.0"
                        className="form-input"
                        style={{ padding: '0.35rem 0.5rem' }}
                        value={bulkMarksData.scores[s.id] ?? ''}
                        onChange={(e) => setBulkMarksData({
                          ...bulkMarksData,
                          scores: {
                            ...bulkMarksData.scores,
                            [s.id]: e.target.value
                          }
                        })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsBulkMarksOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Save Assessment Marks
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DIAGNOSTIC REPORT */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Academic Diagnostic: ${selectedReport.name} (${selectedReport.rollNo})`}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {selectedReport.department} &bull; Semester {selectedReport.semester}
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {selectedReport.email}
              </div>
            </div>

            <RiskBadge level={selectedReport.riskLevel} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Attendance Rate
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: selectedReport.overallAttendancePercentage < 75 ? 'var(--risk-high-badge)' : 'inherit' }}>
                {selectedReport.overallAttendancePercentage ?? 0}%
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                {selectedReport.attendedClasses ?? 0} / {selectedReport.totalClasses ?? 0} lectures attended
              </div>
            </div>

            <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Academic Marks Score
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: selectedReport.overallMarksPercentage < 40 ? 'var(--risk-high-badge)' : 'inherit' }}>
                {selectedReport.overallMarksPercentage ?? 0}%
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                {selectedReport.totalMarksObtained ?? 0} / {selectedReport.totalMaxMarks ?? 0} total marks
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--risk-high-badge)' }}>
              Diagnostic Reasons:
            </h4>

            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {toArray(selectedReport.riskReasons).length === 0 ? (
                <li>No diagnostic reasons available.</li>
              ) : (
                toArray(selectedReport.riskReasons).map((r, i) => (
                  <li key={i}>{r}</li>
                ))
              )}
            </ul>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Faculty Mentorship Intervention Suggestions:
            </h4>

            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {toArray(selectedReport.suggestions).length === 0 ? (
                <li>No suggestions available.</li>
              ) : (
                toArray(selectedReport.suggestions).map((s, i) => (
                  <li key={i}>{s}</li>
                ))
              )}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Subject Breakdown:
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
                  {toArray(selectedReport.subjectPerformance).map((sp) => (
                    <tr key={sp.subjectId}>
                      <td>{sp.subjectCode} - {sp.subjectName}</td>
                      <td>{sp.attendancePercentage}% ({sp.attendedClasses}/{sp.totalClasses})</td>
                      <td>{sp.marksPercentage}% ({sp.totalMarksObtained}/{sp.totalMaxMarks})</td>
                      <td>
                        <span className={`badge ${
                          sp.status === 'Critical'
                            ? 'badge-high-risk'
                            : sp.status?.includes('Low') || sp.status === 'Warning'
                              ? 'badge-medium-risk'
                              : 'badge-low-risk'
                        }`}>
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