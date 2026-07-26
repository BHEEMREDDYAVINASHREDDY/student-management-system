import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
    <FileQuestion size={56} className="mb-4 text-gray-400" />
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
    <p className="mt-2 text-gray-500 dark:text-gray-400">The page you&apos;re looking for doesn&apos;t exist.</p>
    <Link to="/dashboard" className="btn-primary mt-6">
      Back to dashboard
    </Link>
  </div>
);

export default NotFound;
