import { Users, GraduationCap, Building2, BookOpen, CalendarCheck } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { dashboardApi } from '../api/endpoints';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444'];

const AdminDashboard = () => {
  const { data, loading } = useFetch(dashboardApi.admin, []);
  const stats = (data as any)?.data;

  if (loading) return <Skeleton rows={6} cols={4} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={stats.counts.studentCount} icon={GraduationCap} accent="blue" />
        <StatCard label="Teachers" value={stats.counts.teacherCount} icon={Users} accent="green" />
        <StatCard label="Departments" value={stats.counts.departmentCount} icon={Building2} accent="amber" />
        <StatCard label="Courses" value={stats.counts.courseCount} icon={BookOpen} accent="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Students by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.studentsByDepartment}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Students by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.studentsByStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                {stats.studentsByStatus.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Enrollment Trend by Batch Year</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StatCard label="Overall Attendance Rate" value={`${stats.attendanceRate}%`} icon={CalendarCheck} accent="green" />
    </div>
  );
};

const TeacherDashboard = () => {
  const { data, loading } = useFetch(dashboardApi.teacher, []);
  const stats = (data as any)?.data;

  if (loading) return <Skeleton rows={4} cols={3} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Subjects Assigned" value={stats.subjectCount} icon={BookOpen} accent="blue" />
        <StatCard label="Students in Scope" value={stats.studentCount} icon={GraduationCap} accent="green" />
      </div>
      <div className="card">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Recently Graded</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {stats.recentMarks.length === 0 && <p className="py-4 text-sm text-gray-500">No marks recorded yet.</p>}
          {stats.recentMarks.map((m: any) => (
            <div key={m._id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-gray-700 dark:text-gray-300">{m.subject?.name} ({m.examType})</span>
              <span className="font-medium">{m.marksObtained}/{m.maxMarks}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { data, loading } = useFetch(dashboardApi.student, []);
  const stats = (data as any)?.data;

  if (loading) return <Skeleton rows={4} cols={3} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Attendance Rate" value={`${stats.attendanceRate}%`} icon={CalendarCheck} accent="green" />
        <StatCard label="Current Semester" value={stats.student.currentSemester?.name || '-'} icon={BookOpen} accent="blue" />
        <StatCard label="Roll Number" value={stats.student.rollNumber} icon={GraduationCap} accent="purple" />
      </div>
      <div className="card">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">My Marks</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {stats.marks.length === 0 && <p className="py-4 text-sm text-gray-500">No marks recorded yet.</p>}
          {stats.marks.map((m: any) => (
            <div key={m._id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-gray-700 dark:text-gray-300">{m.subject?.name} ({m.examType})</span>
              <span className="font-medium">{m.marksObtained}/{m.maxMarks} ({m.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {user?.role === 'admin' && 'Admin Dashboard'}
        {user?.role === 'teacher' && 'Teacher Dashboard'}
        {user?.role === 'student' && 'My Dashboard'}
      </h1>
      {user?.role === 'admin' && <AdminDashboard />}
      {user?.role === 'teacher' && <TeacherDashboard />}
      {user?.role === 'student' && <StudentDashboard />}
    </div>
  );
};

export default Dashboard;
