// File: uni-market/src/app/components/Spinner.js
import { cn } from '../../../lib/utils';

export function Spinner({ className, ...props }) {
  return (
    <div
      className={cn(
        'inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent',
        className
      )}
      {...props}
    />
  );
}