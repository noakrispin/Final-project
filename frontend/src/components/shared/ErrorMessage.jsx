import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { errorMessagePropTypes } from '../../utils/prop-types';

const ErrorMessage = React.forwardRef(({ message, className }, ref) => {
  if (!message) return null;

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
});

ErrorMessage.propTypes = errorMessagePropTypes;
ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;

