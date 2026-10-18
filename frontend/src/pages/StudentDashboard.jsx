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
  Check
} from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [profileData, ewData, attData, marksData] = await Promise.all([
        studentService.getMyProfile(),
        studentService.getMyEarlyWarning(),
        studentService.getMyAttendance(),
        studentService.getMyMarks()
      ]);
      setProfile(profileData);
      setEarlyWarning(ewData);
      setAttendanceList(attData);
      setMarksList(marksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading student academic profile...</p>
      </div>
    );
  }

  const isHighRisk = earlyWarning?.riskLevel === 'HIGH_RISK';
  const isMedRisk = earlyWarning?.riskLevel === 'MEDIUM_RISK';

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="main-content">
        <Navbar />

        <main className="page-body">
          {error && (
            <div style={{
              background: 'var(--risk-high-bg)',
              border: '1px solid var(--risk-high-border)',
              color: 'var(--risk-high-text)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          {/* Student Profile Header */}
          {profile && (
            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{profile.name}</h2>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Roll No: <strong style={{ color: 'var(--text-main)' }}>{profile.rollNo}</strong> &bull; {profile.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <div>Department: <strong>{profile.department}</strong></div>
                    <div>Semester: <strong>{profile.semester}</strong></div>
                    <div>Academic Year: <strong>{profile.academicYear}</strong></div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Academic Standing</div>
                  {earlyWarning && <RiskBadge level={earlyWarning.riskLevel} />}
                </div>
              </div>
            </div>
          )}

          {/* Early Warning Risk Banner */}
          {earlyWarning && (
            <div style={{
              padding: '1.25rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid',
              background: isHighRisk ? 'var(--risk-high-bg)' : isMedRisk ? 'var(--risk-med-bg)' : 'var(--risk-low-bg)',
              borderColor: isHighRisk ? 'var(--risk-high-border)' : isMedRisk ? 'var(--risk-med-border)' : 'var(--risk-low-border)',
              color: isHighRisk ? 'var(--risk-high-text)' : isMedRisk ? 'var(--risk-med-text)' : 'var(--risk-low-text)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {isHighRisk ? <AlertCircle size={24} /> : isMedRisk ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {earlyWarning.riskDisplayName}: {earlyWarning.riskDescription}
                </h3>
              </div>

              <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {earlyWarning.riskReasons.map((reason, i) => (
                  <p key={i} style={{ marginBottom: '0.25rem' }}>&bull; {reason}</p>
                ))}
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                marginTop: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Lightbulb size={16} />
                  <span>Personalized Action Plan & Suggestions:</span>
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                  {earlyWarning.suggestions.map((s, i) => (
                    <li key={i} style={{ marginBottom: '0.2rem' }}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* DASHBOARD OVERVIEW TAB */}
          {activeTab === 'dashboard' && earlyWarning && (
            <>
              {/* Overall Progress Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card">
                  <div className="card-title">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarCheck size={20} className="text-primary" /> Overall Attendance
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      color: earlyWarning.overallAttendancePercentage < 75 ? 'var(--risk-high-badge)' : 'var(--risk-low-badge)'
                    }}>
                      {earlyWarning.overallAttendancePercentage}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                    <div
                      className={`progress-fill ${earlyWarning.overallAttendancePercentage < 75 ? 'red' : earlyWarning.overallAttendancePercentage < 85 ? 'amber' : 'green'}`}
                      style={{ width: `${Math.min(earlyWarning.overallAttendancePercentage, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{earlyWarning.attendedClasses} attended / {earlyWarning.totalClasses} held</span>
                    <span>Mandatory Threshold: <strong>75%</strong></span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={20} className="text-primary" /> Examination Aggregate
                    </span>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      color: earlyWarning.overallMarksPercentage < 40 ? 'var(--risk-high-badge)' : 'var(--risk-low-badge)'
                    }}>
                      {earlyWarning.overallMarksPercentage}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                    <div
                      className={`progress-fill ${earlyWarning.overallMarksPercentage < 40 ? 'red' : earlyWarning.overallMarksPercentage < 60 ? 'amber' : 'green'}`}
                      style={{ width: `${Math.min(earlyWarning.overallMarksPercentage, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{earlyWarning.totalMarksObtained} / {earlyWarning.totalMaxMarks} total marks</span>
                    <span>Minimum Passing: <strong>40%</strong></span>
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
                      {earlyWarning.subjectPerformance?.map((sub) => (
                        <tr key={sub.subjectId}>
                          <td style={{ fontWeight: 600 }}>{sub.subjectCode}</td>
                          <td>{sub.subjectName}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{
                                width: '45px',
                                fontWeight: 600,
                                color: sub.attendancePercentage < 75 ? 'var(--risk-high-badge)' : 'inherit'
                              }}>
                                {sub.attendancePercentage}%
                              </span>
                              <div className="progress-bar" style={{ width: '90px' }}>
                                <div
                                  className={`progress-fill ${sub.attendancePercentage < 75 ? 'red' : sub.attendancePercentage < 85 ? 'amber' : 'green'}`}
                                  style={{ width: `${Math.min(sub.attendancePercentage, 100)}%` }}
                                />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ({sub.attendedClasses}/{sub.totalClasses})
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span style={{
                                width: '45px',
                                fontWeight: 600,
                                color: sub.marksPercentage < 40 ? 'var(--risk-high-badge)' : 'inherit'
                              }}>
                                {sub.marksPercentage}%
                              </span>
                              <div className="progress-bar" style={{ width: '90px' }}>
                                <div
                                  className={`progress-fill ${sub.marksPercentage < 40 ? 'red' : sub.marksPercentage < 60 ? 'amber' : 'green'}`}
                                  style={{ width: `${Math.min(sub.marksPercentage, 100)}%` }}
                                />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ({sub.totalMarksObtained}/{sub.totalMaxMarks})
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              sub.status === 'Critical' ? 'badge-high-risk' :
                              sub.status.includes('Low') || sub.status === 'Warning' ? 'badge-medium-risk' : 'badge-low-risk'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
                    {attendanceList.map((a) => (
                      <tr key={a.id}>
                        <td>{a.attendanceDate}</td>
                        <td style={{ fontWeight: 600 }}>{a.subjectCode}</td>
                        <td>{a.subjectName}</td>
                        <td>
                          <span className={`badge ${a.status === 'PRESENT' ? 'badge-low-risk' : 'badge-high-risk'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>{a.recordedByName}</td>
                      </tr>
                    ))}
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
                    {marksList.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.assessmentName}</td>
                        <td>{m.assessmentDate || 'N/A'}</td>
                        <td>{m.subjectCode}</td>
                        <td>{m.subjectName}</td>
                        <td style={{ fontWeight: 600 }}>{m.marksObtained}</td>
                        <td>{m.maxMarks}</td>
                        <td>
                          <span style={{
                            fontWeight: 600,
                            color: m.percentage < 40 ? 'var(--risk-high-badge)' : m.percentage < 60 ? 'var(--risk-med-badge)' : 'var(--risk-low-badge)'
                          }}>
                            {m.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status Classification</div>
                  <div style={{ margin: '0.5rem 0' }}>
                    <RiskBadge level={earlyWarning.riskLevel} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{earlyWarning.riskDescription}</p>
                </div>

                <div style={{ background: 'var(--bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Attendance Deficit / Buffer</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0' }}>
                    {earlyWarning.overallAttendancePercentage >= 75 ? (
                      <span style={{ color: 'var(--risk-low-badge)' }}>+{(earlyWarning.overallAttendancePercentage - 75).toFixed(1)}% safe buffer</span>
                    ) : (
                      <span style={{ color: 'var(--risk-high-badge)' }}>-{(75 - earlyWarning.overallAttendancePercentage).toFixed(1)}% below required</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Threshold requirement is 75% attendance</p>
                </div>

                <div style={{ background: 'var(--bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Marks Deficit / Buffer</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0' }}>
                    {earlyWarning.overallMarksPercentage >= 40 ? (
                      <span style={{ color: 'var(--risk-low-badge)' }}>+{(earlyWarning.overallMarksPercentage - 40).toFixed(1)}% above passing</span>
                    ) : (
                      <span style={{ color: 'var(--risk-high-badge)' }}>-{(40 - earlyWarning.overallMarksPercentage).toFixed(1)}% below passing</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Minimum passing threshold is 40% marks</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                  Actionable Steps to Improve Academic Standing:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {earlyWarning.suggestions.map((suggestion, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      background: 'var(--bg-muted)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <div style={{
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
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingTop: '0.1rem' }}>
                        {suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
