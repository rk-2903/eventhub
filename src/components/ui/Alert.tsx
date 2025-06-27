import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ 
  title, 
  children, 
  variant = 'info', 
  className = '',
  onClose
}) => {
  const baseClasses = 'rounded-md p-4';
  
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800',
  };
  
  const iconMap = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{iconMap[variant]}</div>
        <div className="ml-3 w-full">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? 'mt-2' : ''}`}>{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 hover:text-gray-700 rounded-lg p-1.5"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;