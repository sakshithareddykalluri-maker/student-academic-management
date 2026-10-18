import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RiskBadge from '../components/RiskBadge';
import { studentService } from '../services/studentService';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

// Safely extract arrays from API responses
const getArray = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.records)) return response.records;

  return [];
};

// Safely extract the main data object from API responses
const getData = (response) => {
  if (
    response &&
    typeof response === 'object' &&
    !Array.isArray(response) &&
    response.data !== undefined
  ) {
    return response.data;
  }

  return response;
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch student profile, attendance, marks, and early warning
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');

      const [profileData, ewData, attData, marksData] =
        await Promise.all([
          studentService.getMyProfile(),
          studentService.getMyEarlyWarning(),
          studentService.getMyAttendance(),
          studentService.getMyMarks(),
        ]);

      // Profile API returns student details inside data
      const profileInfo = getData(profileData);
      setProfile(profileInfo);

      // Early warning API may also return data inside data
      const warningInfo = getData(ewData);

      if (warningInfo && typeof warningInfo === 'object') {
        setEarlyWarning({
          ...warningInfo,
          riskReasons: getArray(warningInfo.riskReasons),
          suggestions: getArray(warningInfo.suggestions),
          subjectPerformance: getArray(
            warningInfo.subjectPerformance
          ),
        });
      } else {
        setEarlyWarning(null);
      }

      // Attendance and marks responses
      setAttendanceList(getArray(attData));
      setMarksList(getArray(marksData));
    } catch (err) {
      console.error('Student dashboard error:', err);
      setError(
        err.message || 'Unable to load student dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p style={{ color: 'var(--text-muted)' }}>
          Loading student academic profile...
        </p>
      </div>
    );
  }

  // Safe defaults for early-warning fields
  const riskReasons = getArray(earlyWarning?.riskReasons);
  const suggestions = getArray(earlyWarning?.suggestions);
  const subjectPerformance = getArray(
    earlyWarning?.subjectPerformance
  );

  const isHighRisk = earlyWarning?.riskLevel === 'HIGH_RISK';
  const isMedRisk = earlyWarning?.riskLevel === 'MEDIUM_RISK';

  const attendancePercentage =
    Number(earlyWarning?.overallAttendancePercentage) || 0;

  const marksPercentage =
    Number(earlyWarning?.overallMarksPercentage) || 0;

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
                marginBottom: '1.5rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Student Profile Header */}
          {profile && (
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                background:
                  'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GraduationCap size={24} />
                    </div>

                    <div>
                      <h2
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 700,
                        }}
                      >
                        {profile.name || 'Student'}
                      </h2>

                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                        }}
                      >
                        Roll No:{' '}
                        <strong style={{ color: 'var(--text-main)' }}>
                          {profile.identifier ||
                            profile.rollNo ||
                            'N/A'}
                        </strong>{' '}
                        &bull; {profile.email || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      Department:{' '}
                      <strong>{profile.department || 'N/A'}</strong>
                    </div>

                    <div>
                      Semester:{' '}
                      <strong>{profile.semester || 'N/A'}</strong>
                    </div>

                    <div>
                      Academic Year:{' '}
                      <strong>{profile.academicYear || 'N/A'}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Current Academic Standing
                  </div>

                  {earlyWarning && (
                    <RiskBadge level={earlyWarning.riskLevel} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Early Warning Risk Banner */}
          {earlyWarning && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid',
                background: isHighRisk
                  ? 'var(--risk-high-bg)'
                  : isMedRisk
                    ? 'var(--risk-med-bg)'
                    : 'var(--risk-low-bg)',
                borderColor: isHighRisk
                  ? 'var(--risk-high-border)'
                  : isMedRisk
                    ? 'var(--risk-med-border)'
                    : 'var(--risk-low-border)',
                color: isHighRisk
                  ? 'var(--risk-high-text)'
                  : isMedRisk
                    ? 'var(--risk-med-text)'
                    : 'var(--risk-low-text)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                {isHighRisk ? (
                  <AlertCircle size={24} />
                ) : isMedRisk ? (
                  <AlertTriangle size={24} />
                ) : (
                  <CheckCircle size={24} />
                )}

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {earlyWarning.riskDisplayName || 'Academic Standing'}
                  {earlyWarning.riskDescription
                    ? `: ${earlyWarning.riskDescription}`
                    : ''}
                </h3>
              </div>

              <div
                style={{
                  fontSize: '0.9rem',
                  marginBottom: '0.75rem',
                }}
              >
                {riskReasons.length === 0 ? (
                  <p>No risk reasons available.</p>
                ) : (
                  riskReasons.map((reason, i) => (
                    <p key={i} style={{ marginBottom: '0.25rem' }}>
                      &bull; {reason}
                    </p>
                  ))
                )}
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  marginTop: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Lightbulb size={16} />
                  <span>
                    Personalized Action Plan & Suggestions:
                  </span>
                </div>

                {suggestions.length === 0 ? (
                  <p style={{ fontSize: '0.85rem' }}>
                    No personalized suggestions available.
                  </p>
                ) : (
                  <ul
                    style={{
                      paddingLeft: '1.2rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {suggestions.map((s, i) => (
                      <li key={i} style={{ marginBottom: '0.2rem' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* DASHBOARD OVERVIEW TAB */}
          {activeTab === 'dashboard' && (
            <>
              {/* Overall Progress Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Attendance Card */}
                <div className="card">
                  <div className="card-title">
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <CalendarCheck
                        size={20}
                        className="text-primary"
                      />
                      Overall Attendance
                    </span>

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color:
                          attendancePercentage < 75
                            ? 'var(--risk-high-badge)'
                            : 'var(--risk-low-badge)',
                      }}
                    >
                      {earlyWarning
                        ? `${attendancePercentage}%`
                        : 'N/A'}
                    </span>
                  </div>

                  <div
                    className="progress-bar"
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <div
                      className={`progress-fill ${
                        attendancePercentage < 75
                          ? 'red'
                          : attendancePercentage < 85
                            ? 'amber'
                            : 'green'
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(attendancePercentage, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      {earlyWarning
                        ? `${earlyWarning.attendedClasses ?? 0} attended / ${
                            earlyWarning.totalClasses ?? 0
                          } held`
                        : 'Attendance data unavailable'}
                    </span>

                    <span>
                      Mandatory Threshold: <strong>75%</strong>
                    </span>
                  </div>
                </div>

                {/* Examination Marks Card */}
                <div className="card">
                  <div className="card-title">
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Award size={20} className="text-primary" />
                      Examination Aggregate
                    </span>

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        color:
                          marksPercentage < 40
                            ? 'var(--risk-high-badge)'
                            : 'var(--risk-low-badge)',
                      }}
                    >
                      {earlyWarning
                        ? `${marksPercentage}%`
                        : 'N/A'}
                    </span>
                  </div>

                  <div
                    className="progress-bar"
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <div
                      className={`progress-fill ${
                        marksPercentage < 40
                          ? 'red'
                          : marksPercentage < 60
                            ? 'amber'
                            : 'green'
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(marksPercentage, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      {earlyWarning
                        ? `${earlyWarning.totalMarksObtained ?? 0} / ${
                            earlyWarning.totalMaxMarks ?? 0
                          } total marks`
                        : 'Marks data unavailable'}
                    </span>

                    <span>
                      Minimum Passing: <strong>40%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject-Wise Academic Breakdown */}
              <div className="card">
                <div className="card-title">
                  <span>Subject-Wise Academic Performance</span>
                </div>

                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Attendance</th>
                        <th>Marks Obtained</th>
                        <th>Performance Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {subjectPerformance.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              textAlign: 'center',
                              padding: '1rem',
                            }}
                          >
                            No subject-wise academic performance data
                            available.
                          </td>
                        </tr>
                      ) : (
                        subjectPerformance.map((sub, index) => (
                          <tr key={sub.subjectId ?? index}>
                            <td style={{ fontWeight: 600 }}>
                              {sub.subjectCode || 'N/A'}
                            </td>

                            <td>{sub.subjectName || 'N/A'}</td>

                            {/* Subject Attendance */}
                            <td>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                }}
                              >
                                <span
                                  style={{
                                    width: '45px',
                                    fontWeight: 600,
                                    color:
                                      Number(sub.attendancePercentage) < 75
                                        ? 'var(--risk-high-badge)'
                                        : 'inherit',
                                  }}
                                >
                                  {sub.attendancePercentage ?? 0}%
                                </span>

                                <div
                                  className="progress-bar"
                                  style={{ width: '90px' }}
                                >
                                  <div
                                    className={`progress-fill ${
                                      Number(sub.attendancePercentage) < 75
                                        ? 'red'
                                        : Number(sub.attendancePercentage) < 85
                                          ? 'amber'
                                          : 'green'
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          Number(sub.attendancePercentage) || 0,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  ({sub.attendedClasses ?? 0}/
                                  {sub.totalClasses ?? 0})
                                </span>
                              </div>
                            </td>

                            {/* Subject Marks */}
                            <td>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                }}
                              >
                                <span
                                  style={{
                                    width: '45px',
                                    fontWeight: 600,
                                    color:
                                      Number(sub.marksPercentage) < 40
                                        ? 'var(--risk-high-badge)'
                                        : 'inherit',
                                  }}
                                >
                                  {sub.marksPercentage ?? 0}%
                                </span>

                                <div
                                  className="progress-bar"
                                  style={{ width: '90px' }}
                                >
                                  <div
                                    className={`progress-fill ${
                                      Number(sub.marksPercentage) < 40
                                        ? 'red'
                                        : Number(sub.marksPercentage) < 60
                                          ? 'amber'
                                          : 'green'
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          Number(sub.marksPercentage) || 0,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  ({sub.totalMarksObtained ?? 0}/
                                  {sub.totalMaxMarks ?? 0})
                                </span>
                              </div>
                            </td>

                            {/* Performance Status */}
                            <td>
                              <span
                                className={`badge ${
                                  sub.status === 'Critical'
                                    ? 'badge-high-risk'
                                    : String(sub.status || '').includes('Low') ||
                                        sub.status === 'Warning'
                                      ? 'badge-medium-risk'
                                      : 'badge-low-risk'
                                }`}
                              >
                                {sub.status || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="card">
              <div className="card-title">
                <span>My Attendance Record History</span>

                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Total Lectures: <strong>{attendanceList.length}</strong>
                </span>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Attendance Status</th>
                      <th>Recorded By Faculty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={{
                            textAlign: 'center',
                            padding: '1rem',
                          }}
                        >
                          No attendance records available.
                        </td>
                      </tr>
                    ) : (
                      attendanceList.map((a, index) => (
                        <tr key={a.id ?? index}>
                          <td>{a.attendanceDate || 'N/A'}</td>

                          <td style={{ fontWeight: 600 }}>
                            {a.subjectCode || 'N/A'}
                          </td>

                          <td>{a.subjectName || 'N/A'}</td>

                          <td>
                            <span
                              className={`badge ${
                                a.status === 'PRESENT'
                                  ? 'badge-low-risk'
                                  : 'badge-high-risk'
                              }`}
                            >
                              {a.status || 'N/A'}
                            </span>
                          </td>

                          <td>{a.recordedByName || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MARKS TAB */}
          {activeTab === 'marks' && (
            <div className="card">
              <div className="card-title">
                <span>My Examination & Assessment Scores</span>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Assessment Name</th>
                      <th>Date</th>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Score Obtained</th>
                      <th>Maximum Marks</th>
                      <th>Score Percentage</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marksList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: 'center',
                            padding: '1rem',
                          }}
                        >
                          No examination marks available.
                        </td>
                      </tr>
                    ) : (
                      marksList.map((m, index) => (
                        <tr key={m.id ?? index}>
                          <td style={{ fontWeight: 600 }}>
                            {m.assessmentName || 'N/A'}
                          </td>

                          <td>{m.assessmentDate || 'N/A'}</td>

                          <td>{m.subjectCode || 'N/A'}</td>

                          <td>{m.subjectName || 'N/A'}</td>

                          <td style={{ fontWeight: 600 }}>
                            {m.marksObtained ?? 'N/A'}
                          </td>

                          <td>{m.maxMarks ?? 'N/A'}</td>

                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  Number(m.percentage) < 40
                                    ? 'var(--risk-high-badge)'
                                    : Number(m.percentage) < 60
                                      ? 'var(--risk-med-badge)'
                                      : 'var(--risk-low-badge)',
                              }}
                            >
                              {m.percentage ?? 'N/A'}
                              {m.percentage != null ? '%' : ''}
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

          {/* EARLY WARNING TAB */}
          {activeTab === 'early-warning' && earlyWarning && (
            <div className="card">
              <div className="card-title">
                <span>Personalized Academic Diagnostic & Roadmap</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Status Classification */}
                <div
                  style={{
                    background: 'var(--bg-muted)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Status Classification
                  </div>

                  <div style={{ margin: '0.5rem 0' }}>
                    <RiskBadge level={earlyWarning.riskLevel} />
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {earlyWarning.riskDescription ||
                      'No risk description available.'}
                  </p>
                </div>

                {/* Attendance Deficit / Buffer */}
                <div
                  style={{
                    background: 'var(--bg-muted)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Attendance Deficit / Buffer
                  </div>

                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      margin: '0.25rem 0',
                    }}
                  >
                    {attendancePercentage >= 75 ? (
                      <span style={{ color: 'var(--risk-low-badge)' }}>
                        +
                        {(attendancePercentage - 75).toFixed(1)}
                        % safe buffer
                      </span>
                    ) : (
                      <span style={{ color: 'var(--risk-high-badge)' }}>
                        -
                        {(75 - attendancePercentage).toFixed(1)}
                        % below required
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-light)',
                    }}
                  >
                    Threshold requirement is 75% attendance
                  </p>
                </div>

                {/* Marks Deficit / Buffer */}
                <div
                  style={{
                    background: 'var(--bg-muted)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Marks Deficit / Buffer
                  </div>

                  <div
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 700,
                      margin: '0.25rem 0',
                    }}
                  >
                    {marksPercentage >= 40 ? (
                      <span style={{ color: 'var(--risk-low-badge)' }}>
                        +{(marksPercentage - 40).toFixed(1)}
                        % above passing
                      </span>
                    ) : (
                      <span style={{ color: 'var(--risk-high-badge)' }}>
                        -{(40 - marksPercentage).toFixed(1)}
                        % below passing
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-light)',
                    }}
                  >
                    Minimum passing threshold is 40% marks
                  </p>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'var(--primary)',
                  }}
                >
                  Actionable Steps to Improve Academic Standing:
                </h4>

                {suggestions.length === 0 ? (
                  <p>No personalized action steps available.</p>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          background: 'var(--bg-muted)',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </div>

                        <div
                          style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-main)',
                            paddingTop: '0.1rem',
                          }}
                        >
                          {suggestion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}