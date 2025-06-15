import React from 'react';

const Badge = ({
     children,
     variant = 'default',
     className = '',
     ...rest
}) => {
     const variantStyles = {
          default: 'bg-gray-100 text-gray-800',
          primary: 'bg-indigo-100 text-indigo-800',
          secondary: 'bg-teal-100 text-teal-800',
          success: 'bg-green-100 text-green-800',
          warning: 'bg-amber-100 text-amber-800',
          danger: 'bg-red-100 text-red-800',
     };

     const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

     return (
          <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...rest}>
               {children}
          </span>
     );
};

export default Badge;
