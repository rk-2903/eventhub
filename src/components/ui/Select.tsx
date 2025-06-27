import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: Option[];
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    error, 
    fullWidth = false, 
    size = 'md',
    className = '', 
    ...props 
  }, ref) => {
    const baseSelectClasses = 'appearance-none rounded-md border border-gray-300 bg-white px-3 pr-8 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';
    
    const sizeClasses = {
      sm: 'py-1.5 text-sm',
      md: 'py-2 text-base',
      lg: 'py-2.5 text-lg',
    };
    
    return (
      <div className={`${widthClass}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`${baseSelectClasses} ${widthClass} ${errorClass} ${sizeClasses[size]} ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;