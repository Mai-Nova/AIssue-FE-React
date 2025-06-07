import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary/70',
  ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80',
  link: 'text-primary underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild
      ? React.cloneElement(props.children, { ref, ...props })
      : 'button';

    if (asChild) {
      const { children, ...restProps } = props;
      return React.cloneElement(children, {
        className: cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className
        ),
        ...restProps,
      });
    }

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
