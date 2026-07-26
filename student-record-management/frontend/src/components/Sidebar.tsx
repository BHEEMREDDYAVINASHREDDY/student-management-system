import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, Building2, BookOpen, Layers,
  CalendarCheck, ClipboardList, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
  { to: '/students', label: 'Students', icon: GraduationCap, roles: ['admin', 'teacher'] },
  { to: '/teachers', label: 'Teachers', icon: Users, roles: ['admin'] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ['admin'] },
  { to: '/courses', label: 'Courses', icon: BookOpen, roles: ['admin'] },
  { to: '/semesters', label: 'Semesters', icon: Layers, roles: ['admin'] },
  { to: '/subjects', label: 'Subjects', icon: Layers, roles: ['admin', 'teacher'] },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student'] },
  { to: '/marks', label: 'Marks & Grades', icon: ClipboardList, roles: ['admin', 'teacher', 'student'] },
];

const Sidebar = ({ isOpen, onClose }: Props) => {
  const { user } = useAuth();
  const visibleLinks = links.filter((l) => user && l.roles.includes(user.role));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 font-bold text-white">S</div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">SRMS</span>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
