import * as React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  label,
  error,
  className,
  disabled = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  const id = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange(date);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        disabled={disabled}
        min={fromDate?.toISOString().split('T')[0]}
        max={toDate?.toISOString().split('T')[0]}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}

export interface DateRangePickerProps {
  value?: { from: Date; to: Date } | undefined;
  onChange: (range: { from: Date; to: Date } | undefined) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Выберите период',
  label,
  error,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const id = React.useId();

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const from = e.target.value ? new Date(e.target.value) : undefined;
    onChange(from && value?.to ? { from, to: value.to } : undefined);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const to = e.target.value ? new Date(e.target.value) : undefined;
    onChange(to && value?.from ? { from: value.from, to } : undefined);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <label htmlFor={`${id}-from`} className="text-xs text-muted-foreground block mb-1">
            С
          </label>
          <input
            id={`${id}-from`}
            type="date"
            value={value?.from ? value.from.toISOString().split('T')[0] : ''}
            onChange={handleFromChange}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive'
            )}
            disabled={disabled}
            max={value?.to?.toISOString().split('T')[0]}
          />
        </div>
        <div className="flex-1">
          <label htmlFor={`${id}-to`} className="text-xs text-muted-foreground block mb-1">
            По
          </label>
          <input
            id={`${id}-to`}
            type="date"
            value={value?.to ? value.to.toISOString().split('T')[0] : ''}
            onChange={handleToChange}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive'
            )}
            disabled={disabled}
            min={value?.from?.toISOString().split('T')[0]}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
