import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

// Types for the tooltip props
export interface TooltipProps {
  /** The content to show in the tooltip */
  content: React.ReactNode;
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Additional class names for the tooltip content */
  className?: string;
  /** The side of the trigger where the tooltip should appear */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** The alignment of the tooltip relative to the trigger */
  align?: 'start' | 'center' | 'end';
  /** The delay in milliseconds before the tooltip appears */
  delayDuration?: number;
  /** Whether the tooltip can be interacted with */
  disableHoverableContent?: boolean;
  /** Whether the tooltip is open by default (uncontrolled) */
  defaultOpen?: boolean;
  /** Whether the tooltip is open (controlled) */
  open?: boolean;
  /** Callback when the open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A reusable tooltip component built on top of Radix UI's tooltip primitive.
 * Provides a simple way to add tooltips to any element.
 */
export function TooltipWrapper({
  content,
  children,
  className,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  disableHoverableContent = false,
  defaultOpen,
  open,
  onOpenChange,
  ...props
}: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={delayDuration}
        disableHoverableContent={disableHoverableContent}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onOpenChange}
      >
        <TooltipTrigger asChild>
          <span tabIndex={0}>{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn('max-w-xs', className)}
          {...props}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
