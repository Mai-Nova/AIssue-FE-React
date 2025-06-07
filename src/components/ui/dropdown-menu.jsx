import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import { cn } from '../../lib/utils';

const DropdownMenuContext = createContext({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);

    const combinedRef = (node) => {
      if (ref) {
        if (typeof ref === 'function') ref(node);
        else ref.current = node;
      }
      triggerRef.current = node;
    };

    if (asChild) {
      const { children, ...restProps } = props;
      return React.cloneElement(children, {
        ref: combinedRef,
        onClick: (e) => {
          children.props.onClick?.(e);
          setOpen(!open);
        },
        'aria-expanded': open,
        'data-state': open ? 'open' : 'closed',
        ...restProps,
      });
    }

    return (
      <button
        ref={combinedRef}
        className={cn('', className)}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        data-state={open ? 'open' : 'closed'}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef(
  ({ className, align = 'end', sideOffset = 4, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);
    const contentRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          open &&
          contentRef.current &&
          !contentRef.current.contains(event.target) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
          }
          contentRef.current = node;
        }}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          align === 'end' ? 'right-0' : 'left-0',
          className
        )}
        style={{
          position: 'absolute',
          top: '100%',
          marginTop: sideOffset + 'px',
          transform: open ? 'scale(1)' : 'scale(0.95)',
          opacity: open ? 1 : 0,
          transition: 'all 0.15s ease-out',
        }}
        data-state={open ? 'open' : 'closed'}
        data-side="bottom"
        {...props}
      />
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};