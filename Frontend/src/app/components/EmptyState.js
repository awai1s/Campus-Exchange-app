// File: uni-market/src/app/components/EmptyState.js
import { cn } from '../../../lib/utils';

export function EmptyState({ title, description, action, className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-md',
        className
      )}
      {...props}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}