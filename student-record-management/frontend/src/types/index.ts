export type Role = 'admin' | 'teacher' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: Teacher | null;
  studentCount?: number;
  teacherCount?: number;
  courseCount?: number;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  department: Department | string;
  durationYears: number;
  totalSemesters: number;
  description?: string;
  studentCount?: number;
}

export interface Semester {
  _id: string;
  name: string;
  number: number;
  course: Course | string;
  startDate?: string;
  endDate?: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  course: Course | string;
  semester: Semester | string;
  credits: number;
  teacher?: Teacher | string | null;
  maxMarks: number;
  passingMarks: number;
}

export interface Teacher {
  _id: string;
  user: User;
  employeeId: string;
  department: Department | string;
  designation: string;
  qualification?: string;
  phone?: string;
  address?: string;
  subjects: Subject[];
  gender: string;
  isActive: boolean;
}

export interface Student {
  _id: string;
  user: User;
  rollNumber: string;
  course: Course;
  department: Department;
  currentSemester: Semester;
  dateOfBirth?: string;
  gender: string;
  phone?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  batchYear: number;
  status: 'active' | 'graduated' | 'suspended' | 'dropped';
}

export interface AttendanceRecord {
  _id: string;
  student: Student | string;
  subject: Subject | string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface MarksRecord {
  _id: string;
  student: Student | string;
  subject: Subject;
  semester: Semester | string;
  examType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'practical';
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  remarks?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
