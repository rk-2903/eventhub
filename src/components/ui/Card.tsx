import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  
  const cardContent = (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
  
  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
};

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => {
  return <div className={`p-4 pt-0 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => {
  return <div className={`p-4 bg-gray-50 ${className}`}>{children}</div>;
};

export default Card;