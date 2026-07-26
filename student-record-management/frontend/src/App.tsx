import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import Semesters from './pages/Semesters';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/marks" element={<Marks />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher']} />}>
            <Route path="/students" element={<Students />} />
            <Route path="/subjects" element={<Subjects />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/semesters" element={<Semesters />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
