import api from './api';

export const facultyService = {
  getAssignedStudents: async () => {
    const res = await api.get('/faculty/students');
    return res.data;
  },

  getAssignedSubjects: async () => {
    const res = await api.get('/faculty/subjects');
    return res.data;
  },

  recordAttendance: async (data) => {
    const res = await api.post('/faculty/attendance', data);
    return res.data;
  },

  recordBulkAttendance: async (data) => {
    const res = await api.post('/faculty/attendance/bulk', data);
    return res.data;
  },

  getAttendanceHistory: async (subjectId, date = '') => {
    const params = new URLSearchParams({ subjectId });
    if (date) params.append('date', date);
    const res = await api.get(`/faculty/attendance?${params.toString()}`);
    return res.data;
  },

  recordMarks: async (data) => {
    const res = await api.post('/faculty/marks', data);
    return res.data;
  },

  recordBulkMarks: async (data) => {
    const res = await api.post('/faculty/marks/bulk', data);
    return res.data;
  },

  getMarksHistory: async (subjectId) => {
    const res = await api.get(`/faculty/marks?subjectId=${subjectId}`);
    return res.data;
  },

  getAssignedReports: async () => {
    const res = await api.get('/faculty/early-warning/reports');
    return res.data;
  },
};
