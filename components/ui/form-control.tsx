import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * ID элемента управления формой
   */
  id?: string;
  /**
   * Заголовок поля
   */
  label?: React.ReactNode;
  /**
   * Дополнительный контент справа от заголовка
   */
  labelSuffix?: React.ReactNode;
  /**
   * Описание поля
   */
  description?: React.ReactNode;
  /**
   * Сообщение об ошибке
   */
  error?: React.ReactNode;
  /**
   * Обязательное ли поле
   */
  required?: boolean;
  /**
   * Неактивное состояние
   */
  disabled?: boolean;
  /**
   * Размер компонента
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Дополнительные классы для контейнера
   */
  containerClassName?: string;
  /**
   * Дочерние элементы
   */
  children: React.ReactNode;
  /**
   * HTML-атрибут for у label
   */
  htmlFor?: string;
}

/**
 * Компонент для создания согласованных элементов управления формой
 */
export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({
    id,
    label,
    labelSuffix,
    description,
    error,
    required = false,
    disabled = false,
    size = 'md',
    className,
    containerClassName,
    children,
    htmlFor,
    ...props
  }, ref) => {
    const generatedId = React.useId();
    const controlId = id || generatedId;
    const errorId = `${controlId}-error`;
    const descriptionId = `${controlId}-description`;
    const hasError = Boolean(error);
    const ariaDescribedBy = [
      description ? descriptionId : undefined,
      hasError ? errorId : undefined,
    ].filter(Boolean).join(' ') || undefined;

    // Клонируем дочерний элемент и добавляем необходимые пропсы
    const clonedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement, {
          id: controlId,
          'aria-describedby': ariaDescribedBy,
          'aria-invalid': hasError ? 'true' : undefined,
          'aria-errormessage': hasError ? errorId : undefined,
          disabled,
          // Добавляем размер, если компонент его поддерживает
          ...(child.props.size === undefined && { size }),
        });
      }
      return child;
    });

    return (
      <div 
        ref={ref} 
        className={cn('space-y-1.5', containerClassName)}
        {...props}
      >
        {(label || labelSuffix) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={htmlFor || controlId}
                className={cn(
                  'block text-sm font-medium',
                  disabled ? 'text-muted-foreground' : 'text-foreground',
                  hasError && 'text-destructive',
                  className
                )}
              >
                {label}
                {required && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
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
          {clonedChildren}
        </div>

        {description && !hasError && (
          <p 
            id={descriptionId}
            className={cn(
              'text-sm',
              disabled ? 'text-muted-foreground/70' : 'text-muted-foreground'
            )}
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
  }
);

FormControl.displayName = 'FormControl';

/**
 * Группа элементов управления формой
 */
export const FormControlGroup = React.forwardRef<
  HTMLDivElement, 
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-4', className)}
    {...props}
  />
));

FormControlGroup.displayName = 'FormControlGroup';

/**
 * Заголовок группы элементов управления
 */
export const FormControlLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement> & {
    asChild?: boolean;
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? 'div' : 'legend';
  
  return (
    <Comp
      ref={ref as any}
      className={cn(
        'text-sm font-medium text-foreground mb-2 block',
        className
      )}
      {...props}
    />
  );
});

FormControlLegend.displayName = 'FormControlLegend';
