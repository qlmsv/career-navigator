import React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  className?: string;
  children: React.ReactNode;
}

export function Form({ onSubmit, className, children, ...props }: FormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn('space-y-6', className)} 
      {...props}
    >
      <fieldset disabled={isSubmitting} className="space-y-6">
        {children}
      </fieldset>
    </form>
  );
}

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Содержимое группы формы */
  children: React.ReactNode;
  /** Заголовок поля */
  label?: React.ReactNode;
  /** ID элемента, с которым связан заголовок */
  htmlFor?: string;
  /** Сообщение об ошибке */
  error?: React.ReactNode;
  /** Дополнительные классы */
  className?: string;
  /** Обязательное ли поле */
  required?: boolean;
  /** Подсказка под полем */
  description?: React.ReactNode;
  /** Дополнительный контент справа от лейбла */
  labelSuffix?: React.ReactNode;
}

export const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(({ 
  children, 
  className, 
  error,
  label,
  htmlFor,
  required = false,
  description,
  labelSuffix,
  ...props 
}, ref) => {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const hasError = Boolean(error);

  return (
    <div 
      ref={ref}
      className={cn('space-y-2', className)}
      {...props}
    >
      {(label || labelSuffix) && (
        <div className="flex items-center justify-between">
          {label && (
            <label 
              htmlFor={htmlFor || id}
              className={cn(
                'block text-sm font-medium',
                hasError ? 'text-destructive' : 'text-foreground'
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          {labelSuffix && (
            <div className="text-sm text-muted-foreground">
              {labelSuffix}
            </div>
          )}
        </div>
      )}
      
      <div className="relative">
        {children}
      </div>

      {description && !hasError && (
        <p 
          id={descriptionId}
          className="text-sm text-muted-foreground mt-1"
        >
          {description}
        </p>
      )}
      
      {hasError && (
        <p 
          id={errorId}
          className="text-sm text-destructive mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormGroup.displayName = 'FormGroup';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps {
  /** Сообщение об ошибке */
  error?: string | null;
  /** Размер инпута */
  size?: InputSize;
  /** Префикс (иконка или текст) */
  prefix?: React.ReactNode;
  /** Суффикс (иконка или текст) */
  suffix?: React.ReactNode;
  /** Показать состояние загрузки */
  isLoading?: boolean;
  /** Дополнительные классы */
  className?: string;
  /** Дополнительные классы для контейнера */
  containerClassName?: string;
  /** Все стандартные атрибуты input */
  [key: string]: any;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    error,
    id,
    size = 'md',
    prefix,
    suffix,
    disabled,
    isLoading,
    containerClassName,
    ...props 
  }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    const hasAddon = Boolean(prefix || suffix || isLoading);
    
    const inputElement = (
      <input
        id={inputId}
        className={cn(
          'flex w-full bg-transparent text-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none disabled:cursor-not-allowed',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'disabled:opacity-50',
          size === 'sm' && 'h-8 px-2 text-xs',
          size === 'md' && 'h-10 px-3',
          size === 'lg' && 'h-12 px-4 text-base',
          hasAddon ? 'px-0' : 'px-3',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-invalid={hasError}
        aria-errormessage={hasError ? `${inputId}-error` : undefined}
        {...props}
      />
    );

    if (!hasAddon) {
      return inputElement;
    }

    return (
      <div className={cn(
        'flex items-center w-full rounded-md border border-input bg-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        hasError && 'border-destructive focus-within:ring-destructive/30',
        disabled && 'opacity-50',
        size === 'sm' && 'h-8',
        size === 'md' && 'h-10',
        size === 'lg' && 'h-12',
        containerClassName
      )}>
        {prefix && (
          <div className="pl-3 pr-1 text-muted-foreground flex items-center">
            {prefix}
          </div>
        )}
        {inputElement}
        {(suffix || isLoading) && (
          <div className="pr-3 pl-1 text-muted-foreground flex items-center">
            {isLoading ? (
              <span className="animate-spin">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            ) : (
              suffix
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Тип кнопки */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary';
  /** Размер кнопки */
  size?: 'sm' | 'default' | 'lg' | 'icon';
  /** Показать состояние загрузки */
  isLoading?: boolean;
  /** Кнопка во всю ширину */
  fullWidth?: boolean;
  /** Иконка слева */
  leftIcon?: React.ReactNode;
  /** Иконка справа */
  rightIcon?: React.ReactNode;
  /** Дополнительные классы */
  className?: string;
  /** Отключить кнопку */
  disabled?: boolean;
  /** Показать как активную (нажатой) */
  isActive?: boolean;
  /** HTML-тип кнопки */
  type?: 'button' | 'submit' | 'reset';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    children,
    variant = 'default',
    size = 'default',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    isActive = false,
    type = 'button',
    ...props
  }, ref) => {
    const hasIcon = Boolean(leftIcon || rightIcon || isLoading);
    const showLeftIcon = leftIcon && !isLoading;
    const showRightIcon = rightIcon && !isLoading;

    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'relative',
          
          // Variants
          variant === 'default' && [
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'active:bg-primary/80',
            'disabled:bg-primary/50',
          ],
          variant === 'secondary' && [
            'bg-secondary text-secondary-foreground',
            'hover:bg-secondary/80',
            'active:bg-secondary/70',
          ],
          variant === 'destructive' && [
            'bg-destructive text-destructive-foreground',
            'hover:bg-destructive/90',
            'active:bg-destructive/80',
          ],
          variant === 'outline' && [
            'border border-input bg-transparent',
            'hover:bg-accent hover:text-accent-foreground',
            'active:bg-accent/80',
          ],
          variant === 'ghost' && [
            'hover:bg-accent hover:text-accent-foreground',
            'active:bg-accent/80',
          ],
          variant === 'link' && [
            'text-primary underline-offset-4',
            'hover:underline',
            'active:underline',
          ],
          
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs rounded',
          size === 'default' && 'h-10 px-4 py-2 text-sm',
          size === 'lg' && 'h-12 px-6 text-base rounded-lg',
          size === 'icon' && 'h-10 w-10 p-0',
          
          // States
          isActive && 'bg-accent text-accent-foreground',
          fullWidth && 'w-full',
          hasIcon && 'gap-2',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="animate-spin h-4 w-4">
              <svg
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          </span>
        )}
        
        <span className={cn(
          'inline-flex items-center',
          isLoading && 'invisible',
          hasIcon && 'gap-2'
        )}>
          {showLeftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {showRightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
