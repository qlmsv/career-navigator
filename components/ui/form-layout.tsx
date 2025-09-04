import * as React from 'react';
import { cn } from '@/lib/utils';

type FormLayoutProps = {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
};

const spacingMap = {
  none: 'space-y-0',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
};

export function FormLayout({
  children,
  className,
  spacing = 'md',
}: FormLayoutProps) {
  return (
    <div className={cn(spacingMap[spacing], className)}>
      {children}
    </div>
  );
}

type FormSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
};

export function FormSection({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  spacing = 'md',
}: FormSectionProps) {
  return (
    <div className={cn('border-b border-border pb-6 last:border-b-0 last:pb-0', className)}>
      {title && (
        <div className="mb-4">
          <h3 className={cn(
            'text-lg font-medium leading-6 text-foreground',
            titleClassName
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              'mt-1 text-sm text-muted-foreground',
              descriptionClassName
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        'grid gap-6',
        spacing === 'none' ? 'gap-0' : '',
        spacing === 'sm' ? 'gap-4' : '',
        spacing === 'md' ? 'gap-6' : '',
        spacing === 'lg' ? 'gap-8' : ''
      )}>
        {children}
      </div>
    </div>
  );
}

type FormRowProps = {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  responsive?: boolean;
};

export function FormRow({
  children,
  className,
  spacing = 'md',
  cols = 2,
  responsive = true,
}: FormRowProps) {
  const colSpan = `lg:grid-cols-${cols}`;
  
  return (
    <div
      className={cn(
        'grid gap-4',
        spacing === 'none' ? 'gap-0' : '',
        spacing === 'sm' ? 'gap-3' : '',
        spacing === 'md' ? 'gap-4' : '',
        spacing === 'lg' ? 'gap-6' : '',
        responsive ? `grid-cols-1 md:grid-cols-2 ${colSpan}` : `grid-cols-${cols}`,
        className
      )}
    >
      {children}
    </div>
  );
}

type FormActionsProps = {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
};

const alignMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export function FormActions({
  children,
  className,
  align = 'end',
}: FormActionsProps) {
  return (
    <div className={cn(
      'flex flex-wrap items-center gap-3 pt-2',
      alignMap[align],
      className
    )}>
      {children}
    </div>
  );
}

// Compound component for easier imports
export const Form = {
  Layout: FormLayout,
  Section: FormSection,
  Row: FormRow,
  Actions: FormActions,
};
