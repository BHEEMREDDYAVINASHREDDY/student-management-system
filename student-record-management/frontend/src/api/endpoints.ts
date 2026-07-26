// Thin, typed wrappers around each backend resource. Keeping these in one place means
// pages never construct URL strings by hand.
import api from './axios';

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/update-password', data),
};

const crud = (resource: string) => ({
  list: (params?: Record<string, unknown>) => api.get(`/${resource}`, { params }),
  get: (id: string) => api.get(`/${resource}/${id}`),
  create: (data: unknown) => api.post(`/${resource}`, data),
  update: (id: string, data: unknown) => api.put(`/${resource}/${id}`, data),
  remove: (id: string) => api.delete(`/${resource}/${id}`),
});

export const studentsApi = {
  ...crud('students'),
  uploadAvatar: (id: string, formData: FormData) =>
    api.put(`/students/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportCsv: () => api.get('/students/export/csv', { responseType: 'blob' }),
  importCsv: (formData: FormData) =>
    api.post('/students/import/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const teachersApi = {
  ...crud('teachers'),
  uploadAvatar: (id: string, formData: FormData) =>
    api.put(`/teachers/${id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportCsv: () => api.get('/teachers/export/csv', { responseType: 'blob' }),
};

export const departmentsApi = crud('departments');
export const coursesApi = crud('courses');
export const subjectsApi = crud('subjects');
export const semestersApi = {
  ...crud('semesters'),
  byCourse: (courseId: string) => api.get('/semesters', { params: { course: courseId } }),
};

export const attendanceApi = {
  markBulk: (data: unknown) => api.post('/attendance/bulk', data),
  list: (params?: Record<string, unknown>) => api.get('/attendance', { params }),
  summary: (studentId: string, subject?: string) =>
    api.get(`/attendance/summary/${studentId}`, { params: subject ? { subject } : undefined }),
  remove: (id: string) => api.delete(`/attendance/${id}`),
};

export const marksApi = {
  upsert: (data: unknown) => api.post('/marks', data),
  list: (params?: Record<string, unknown>) => api.get('/marks', { params }),
  report: (studentId: string, semesterId: string) => api.get(`/marks/report/${studentId}/${semesterId}`),
  remove: (id: string) => api.delete(`/marks/${id}`),
};

export const dashboardApi = {
  admin: () => api.get('/dashboard/admin'),
  teacher: () => api.get('/dashboard/teacher'),
  student: () => api.get('/dashboard/student'),
};
