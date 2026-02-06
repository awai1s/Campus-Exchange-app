// File: src/app/components/Select.js
import { forwardRef } from 'react';

const Select = forwardRef(({ options, value, onChange, name, className = '', ...props }, ref) => {
  return (
    <select
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.value === ''}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = 'Select';
export default Select;