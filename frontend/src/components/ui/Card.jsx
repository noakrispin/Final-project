import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

/**
 * Card component that serves as a container with a border, background, and shadow.
 * 
 * Props:
 * - className: Additional class names for the card.
 * - children: The content of the card.
 */
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));

/**
 * CardHeader component that serves as the header section of the card.
 * 
 * Props:
 * - className: Additional class names for the card header.
 * - children: The content of the card header.
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

/**
 * CardTitle component that serves as the title of the card.
 * 
 * Props:
 * - className: Additional class names for the card title.
 * - children: The content of the card title.
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

/**
 * CardDescription component that serves as the description of the card.
 * 
 * Props:
 * - className: Additional class names for the card description.
 * - children: The content of the card description.
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

/**
 * CardContent component that serves as the main content area of the card.
 * 
 * Props:
 * - className: Additional class names for the card content.
 * - children: The content of the card content.
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

/**
 * CardFooter component that serves as the footer section of the card.
 * 
 * Props:
 * - className: Additional class names for the card footer.
 * - children: The content of the card footer.
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

// PropTypes
const sharedPropTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

Card.propTypes = sharedPropTypes;
CardHeader.propTypes = sharedPropTypes;
CardTitle.propTypes = sharedPropTypes;
CardDescription.propTypes = sharedPropTypes;
CardContent.propTypes = sharedPropTypes;
CardFooter.propTypes = sharedPropTypes;

// DisplayNames
Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
};
