import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioGroupOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

export function RadioGroup({
  options,
  value,
  onChange,
  label,
  error,
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  const id = React.useId();
  const groupId = `${id}-radio-group`;
  
  const handleChange = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {label && (
        <div className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </div>
      )}
      <div
        className={cn('space-y-2', {
          'flex flex-col space-y-2': orientation === 'vertical',
          'flex flex-row space-x-4': orientation === 'horizontal',
        })}
        role="radiogroup"
        aria-labelledby={label ? groupId : undefined}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start space-x-2 p-3 rounded-md border border-input hover:bg-accent/50',
              'cursor-pointer transition-colors',
              value === option.value && 'border-primary bg-accent/30'
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                className={cn(
                  'h-4 w-4 text-primary focus:ring-primary',
                  'border-input',
                  error && 'border-destructive'
                )}
                checked={value === option.value}
                onChange={() => handleChange(option.value)}
                aria-describedby={`${option.value}-description`}
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{option.label}</div>
              {option.description && (
                <div
                  id={`${option.value}-description`}
                  className="text-xs text-muted-foreground mt-0.5"
                >
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
