import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RiskBadge({ level }) {
  const normalized = String(level || '').toUpperCase();

  if (normalized.includes('HIGH')) {
    return (
      <span className="badge badge-high-risk">
        <AlertCircle size={14} />
        <span>High Risk</span>
      </span>
    );
  }

  if (normalized.includes('MEDIUM') || normalized.includes('MED')) {
    return (
      <span className="badge badge-medium-risk">
        <AlertTriangle size={14} />
        <span>Medium Risk</span>
      </span>
    );
  }

  return (
    <span className="badge badge-low-risk">
      <CheckCircle size={14} />
      <span>Low Risk</span>
    </span>
  );
}
