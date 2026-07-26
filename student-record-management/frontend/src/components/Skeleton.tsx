// Simple loading skeleton for tables/cards while data is being fetched.
const Skeleton = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div className="animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4">
        {Array.from({ length: cols }).map((__, c) => (
          <div key={c} className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
