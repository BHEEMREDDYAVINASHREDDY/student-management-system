const colorMap: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  suspended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  dropped: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  absent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  excused: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const Badge = ({ status }: { status: string }) => (
  <span className={`badge ${colorMap[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'} capitalize`}>
    {status}
  </span>
);

export default Badge;
