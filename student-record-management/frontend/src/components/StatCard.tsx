import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'blue' | 'green' | 'amber' | 'purple';
}

const accents: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

const StatCard = ({ label, value, icon: Icon, accent = 'blue' }: Props) => (
  <div className="card flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accents[accent]}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default StatCard;
