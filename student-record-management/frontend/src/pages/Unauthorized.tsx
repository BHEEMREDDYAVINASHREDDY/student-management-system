import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
    <ShieldAlert size={56} className="mb-4 text-amber-500" />
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access denied</h1>
    <p className="mt-2 text-gray-500 dark:text-gray-400">You don&apos;t have permission to view this page.</p>
    <Link to="/dashboard" className="btn-primary mt-6">
      Back to dashboard
    </Link>
  </div>
);

export default Unauthorized;
