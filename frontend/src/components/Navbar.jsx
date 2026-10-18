import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-brand">
        <GraduationCap size={28} />
        <span>Smart Academic Portal</span>
      </div>

      <div className="nav-user">
        {user && (
          <>
            <div className="user-badge">
              <UserIcon size={16} className="text-muted" />
              <span>{user.name}</span>
              <span className="role-tag">{user.role}</span>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              title="Logout from session"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
