import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      ref={ref}
      aria-invalid={!!error}
      {...props}
    />
  );
});

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  'aria-label': PropTypes.string
};

Input.displayName = "Input";

export { Input };

