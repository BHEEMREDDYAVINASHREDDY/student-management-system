import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, limit, total, onPageChange }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-2 py-3 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-medium">{start}</span>-<span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary px-3 py-1.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-secondary px-3 py-1.5"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
