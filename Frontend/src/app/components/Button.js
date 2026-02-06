import Link from 'next/link';
import { cn } from '../../../lib/utils';

export function Button({
  variant = 'primary',
  disabled,
  children,
  className,
  href,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  const classes = cn(
    baseStyles,
    variants[variant] || variants.primary,
    disabled && disabledStyles,
    className
  );

  // If href is provided, render a Next.js Link directly
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  // Otherwise, render a regular button
  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}