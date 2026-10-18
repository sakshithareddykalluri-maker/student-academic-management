import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  AlertTriangle,
  CalendarCheck,
  Award,
  Lightbulb,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange }) {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <GraduationCap size={24} />
        <span>Academic System</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        {role === 'ADMIN' && (
          <>
            <button
              className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => onTabChange('students')}
            >
              <Users size={18} />
              <span>Students</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'faculty' ? 'active' : ''}`}
              onClick={() => onTabChange('faculty')}
            >
              <GraduationCap size={18} />
              <span>Faculty</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'subjects' ? 'active' : ''}`}
              onClick={() => onTabChange('subjects')}
            >
              <BookOpen size={18} />
              <span>Subjects</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => onTabChange('assignments')}
            >
              <UserCheck size={18} />
              <span>Assignments</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'early-warning' ? 'active' : ''}`}
              onClick={() => onTabChange('early-warning')}
            >
              <AlertTriangle size={18} />
              <span>Early-Warning Reports</span>
            </button>
          </>
        )}

        {role === 'FACULTY' && (
          <>
            <button
              className={`nav-item ${activeTab === 'my-students' ? 'active' : ''}`}
              onClick={() => onTabChange('my-students')}
            >
              <Users size={18} />
              <span>Assigned Students</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => onTabChange('attendance')}
            >
              <CalendarCheck size={18} />
              <span>Attendance</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'marks' ? 'active' : ''}`}
              onClick={() => onTabChange('marks')}
            >
              <Award size={18} />
              <span>Marks & Assessments</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'early-warning' ? 'active' : ''}`}
              onClick={() => onTabChange('early-warning')}
            >
              <AlertTriangle size={18} />
              <span>Student Risk Alerts</span>
            </button>
          </>
        )}

        {role === 'STUDENT' && (
          <>
            <button
              className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => onTabChange('attendance')}
            >
              <CalendarCheck size={18} />
              <span>My Attendance</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'marks' ? 'active' : ''}`}
              onClick={() => onTabChange('marks')}
            >
              <Award size={18} />
              <span>My Marks</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'early-warning' ? 'active' : ''}`}
              onClick={() => onTabChange('early-warning')}
            >
              <Lightbulb size={18} />
              <span>Risk Status & Guidance</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
