import api from './api';

export const adminService = {
  // Students
  getStudents: async (search = '', department = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    const res = await api.get(`/admin/students?${params.toString()}`);
    return res.data;
  },

  createStudent: async (data) => {
    const res = await api.post('/admin/students', data);
    return res.data;
  },

  updateStudent: async (id, data) => {
    const res = await api.put(`/admin/students/${id}`, data);
    return res.data;
  },

  deleteStudent: async (id) => {
    const res = await api.delete(`/admin/students/${id}`);
    return res;
  },

  // Faculty
  getFaculty: async (search = '', department = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    const res = await api.get(`/admin/faculty?${params.toString()}`);
    return res.data;
  },

  createFaculty: async (data) => {
    const res = await api.post('/admin/faculty', data);
    return res.data;
  },

  updateFaculty: async (id, data) => {
    const res = await api.put(`/admin/faculty/${id}`, data);
    return res.data;
  },

  deleteFaculty: async (id) => {
    const res = await api.delete(`/admin/faculty/${id}`);
    return res;
  },

  // Subjects
  getSubjects: async () => {
    const res = await api.get('/admin/subjects');
    return res.data;
  },

  createSubject: async (data) => {
    const res = await api.post('/admin/subjects', data);
    return res.data;
  },

  updateSubject: async (id, data) => {
    const res = await api.put(`/admin/subjects/${id}`, data);
    return res.data;
  },

  deleteSubject: async (id) => {
    const res = await api.delete(`/admin/subjects/${id}`);
    return res;
  },

  // Assignments
  getAssignments: async () => {
    const res = await api.get('/admin/assignments');
    return res.data;
  },

  createAssignment: async (data) => {
    const res = await api.post('/admin/assignments', data);
    return res.data;
  },

  deleteAssignment: async (id) => {
    const res = await api.delete(`/admin/assignments/${id}`);
    return res;
  },

  // Early-Warning Reports
  getRiskReports: async (department = '', riskLevel = '') => {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (riskLevel) params.append('riskLevel', riskLevel);
    const res = await api.get(`/admin/early-warning/reports?${params.toString()}`);
    return res.data;
  },

  getStudentRiskReport: async (studentId) => {
    const res = await api.get(`/admin/early-warning/student/${studentId}`);
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get('/admin/departments');
    return res.data;
  },
};
