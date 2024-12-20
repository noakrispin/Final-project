import React from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#e1e4ff] text-[#535353] hover:bg-[#e1e4ff]/90',
        outline: 'border border-[#6e6e6e] text-[#535353] hover:bg-[#e1e4ff] hover:border-[#e1e4ff]',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8',
        xl: 'h-14 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false,
  loading = false,
  ...props 
}, ref) => {
  const Comp = asChild ? 'div' : 'button';

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && 'opacity-50 cursor-wait'
      )}
      ref={ref}
      disabled={props.disabled || loading}
      {...props}
    />
  );
});

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default',
    'outline',
    'primary',
    'destructive',
    'secondary',
    'ghost',
    'link'
  ]),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'xl', 'icon']),
  asChild: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node
};

Button.displayName = 'Button';

export { Button, buttonVariants };

