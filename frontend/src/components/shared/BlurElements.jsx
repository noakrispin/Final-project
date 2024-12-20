import React from 'react';
import { cn } from '../../lib/utils';
import { blurElementsPropTypes } from '../../utils/prop-types';

export const BlurElements = React.memo(({ className }) => (
  <div 
    className={cn(
      "relative overflow-hidden pointer-events-none select-none", 
      className
    )} 
    aria-hidden="true"
  >
    <div 
      className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#c8d7ff]/70 rounded-full blur-[50px] animate-pulse" 
      style={{ animationDuration: '4s' }}
    />
    <div 
      className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#c8d7ff]/70 rounded-full blur-[40px] animate-pulse" 
      style={{ animationDuration: '5s' }}
    />
  </div>
));

BlurElements.propTypes = blurElementsPropTypes;
BlurElements.displayName = 'BlurElements';

