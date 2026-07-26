interface Props {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

const Spinner = ({ size = 'md' }: Props) => (
  <div
    className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-500`}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
