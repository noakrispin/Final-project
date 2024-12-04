import React from 'react';
// Import cva to manage dynamic className combinations.
import { cva } from 'class-variance-authority';
// Import cn utility to merge classNames conditionally.
import { cn } from '../../lib/utils';

const buttonVariants = cva(
    // Base styles for the button, applied regardless of variant or size.
  'inline-flex items-center justify-center rounded-full text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-[#e1e4ff] text-[#535353]',
        outline: 'border border-[#6e6e6e] text-[#535353] hover:bg-[#e1e4ff]',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        xl: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
    
  ({ className, variant, size, asChild = false, ...props }, ref) => { // ForwardRef to pass ref to the component.
    // Renders a 'button' or 'div' based on the asChild prop.
    const Comp = asChild ? 'div' : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
// Sets a display name for better debugging.
Button.displayName = 'Button';

export { Button, buttonVariants };