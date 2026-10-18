import api from './api';

export const studentService = {
  getMyProfile: async () => {
    const res = await api.get('/student/profile');
    return res.data;
  },

  getMyAttendance: async () => {
    const res = await api.get('/student/attendance');
    return res.data;
  },

  getMyMarks: async () => {
    const res = await api.get('/student/marks');
    return res.data;
  },

  getMyEarlyWarning: async () => {
    const res = await api.get('/student/early-warning');
    return res.data;
  },
};
