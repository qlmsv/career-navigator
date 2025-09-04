import * as React from 'react';
import { cn } from '@/lib/utils';
import { Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Заголовок поля */
  label?: React.ReactNode;
  /** Дополнительные классы для заголовка */
  labelClassName?: string;
  /** Описание поля */
  description?: React.ReactNode;
  /** Сообщение об ошибке */
  error?: React.ReactNode;
  /** Обязательное ли поле */
  required?: boolean;
  /** Дополнительные классы */
  className?: string;
  /** Дочерние элементы */
  children: React.ReactNode;
  /** HTML-атрибут for у label */
  htmlFor?: string;
  /** Подсказка при наведении */
  tooltip?: React.ReactNode;
  /** Размер компонента */
  size?: 'sm' | 'md' | 'lg';
  /** Отключенное состояние */
  disabled?: boolean;
  /** Дополнительный контент справа от заголовка */
  labelSuffix?: React.ReactNode;
  /** Выравнивание метки по горизонтали */
  labelAlign?: 'start' | 'end' | 'center' | 'between';
  /** Ориентация метки */
  orientation?: 'vertical' | 'horizontal';
  /** Ширина метки (в пикселях или процентах) */
  labelWidth?: string | number;
  /** Показать иконку ошибки */
  showErrorIcon?: boolean;
  /** Дополнительные классы для контейнера содержимого */
  contentClassName?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(({
  label,
  labelClassName,
  description,
  error,
  required = false,
  className,
  children,
  htmlFor,
  tooltip,
  size = 'md',
  disabled = false,
  labelSuffix,
  labelAlign = 'start',
  orientation = 'vertical',
  labelWidth,
  showErrorIcon = true,
  contentClassName,
  ...props
}, ref) => {
  const id = React.useId();
  const fieldId = htmlFor || id;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const hasError = Boolean(error);
  const isHorizontal = orientation === 'horizontal';
  
  // Генерируем классы для контейнера
  const containerClasses = cn(
    'form-field',
    {
      'space-y-2': !isHorizontal,
      'grid gap-3': isHorizontal,
      'items-start': isHorizontal,
      'opacity-70': disabled,
      'cursor-not-allowed': disabled,
    },
    isHorizontal && {
      'grid-cols-[minmax(100px,200px)_1fr]': !labelWidth,
    },
    className
  );
  
  // Генерируем стили для метки
  const labelStyles = labelWidth ? { width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth } : undefined;
  
  // Генерируем классы для метки
  const labelClasses = cn(
    'text-sm font-medium',
    {
      'text-foreground': !hasError,
      'text-destructive': hasError,
      'opacity-50': disabled,
      'flex items-center gap-1': required || tooltip,
      'flex items-center': !required && !tooltip,
      'justify-start': labelAlign === 'start',
      'justify-end': labelAlign === 'end',
      'justify-center': labelAlign === 'center',
      'justify-between': labelAlign === 'between',
      'pt-2': isHorizontal, // Выравнивание текста по верху при горизонтальной ориентации
    },
    labelClassName
  );
  
  // Генерируем классы для контента
  const contentClasses = cn('relative', contentClassName, {
    'col-start-2': isHorizontal && !labelWidth,
  });

  // Клонируем дочерний элемент и добавляем необходимые пропсы
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement, {
        id: fieldId,
        'aria-describedby': [
          description ? descriptionId : undefined,
          hasError ? errorId : undefined,
        ].filter(Boolean).join(' ') || undefined,
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
      className={containerClasses}
      style={isHorizontal && labelWidth ? { 
        gridTemplateColumns: `${labelWidth}px 1fr` 
      } : undefined}
      {...props}
    >
      {(label || tooltip || labelSuffix) && (
        <div 
          className={cn('flex items-center', {
            'col-start-1': isHorizontal,
            'justify-between': !isHorizontal,
          })}
          style={labelStyles}
        >
          <label
            htmlFor={fieldId}
            className={labelClasses}
          >
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button" 
                      className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </label>
          {labelSuffix && (
            <div className="text-sm text-muted-foreground">
              {labelSuffix}
            </div>
          )}
        </div>
      )}
      
      <div className={contentClasses}>
        {clonedChildren}
        
        {hasError && showErrorIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
        
        {description && !hasError && (
          <p 
            id={descriptionId}
            className={cn(
              'mt-1 text-sm',
              disabled ? 'text-muted-foreground/70' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
        
        {hasError && (
          <p 
            id={errorId}
            className="mt-1 flex items-center gap-1.5 text-sm text-destructive"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
});

FormField.displayName = 'FormField';

// Обновляем контекст формы
type FormFieldContextValue = {
  id: string;
  error?: string;
  disabled: boolean;
  required: boolean;
  size: 'sm' | 'md' | 'lg';
  name?: string;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({
  id: '',
  error: undefined,
  disabled: false,
  required: false,
  size: 'md',
});

export const useFormField = () => {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField должен использоваться внутри FormFieldProvider');
  }
  return context;
};

export function FormFieldProvider({
  children,
  error,
  disabled = false,
  required = false,
  size = 'md',
  name,
  id: propId,
}: {
  children: React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  id?: string;
}) {
  const id = React.useId();
  const fieldId = propId || id;
  
  return (
    <FormFieldContext.Provider
      value={{
        id: fieldId,
        error,
        disabled,
        required,
        size,
        name,
      }}
    >
      {children}
    </FormFieldContext.Provider>
  );
}

// Вспомогательный компонент для группировки полей формы
export const FormFieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Ориентация группы */
    orientation?: 'horizontal' | 'vertical';
    /** Выравнивание элементов по вертикали */
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    /** Распределение пространства между элементами */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    /** Отступ между элементами */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  }
>(({ 
  className, 
  orientation = 'vertical', 
  align = 'stretch',
  justify = 'start',
  gap = 'md',
  ...props 
}, ref) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  };
  
  const gapClass = typeof gap === 'number' ? `gap-[${gap}px]` : gapClasses[gap];
  
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        {
          'flex-col': orientation === 'vertical',
          'flex-row': orientation === 'horizontal',
          'items-start': align === 'start',
          'items-center': align === 'center',
          'items-end': align === 'end',
          'items-stretch': align === 'stretch',
          'items-baseline': align === 'baseline',
          'justify-start': justify === 'start',
          'justify-center': justify === 'center',
          'justify-end': justify === 'end',
          'justify-between': justify === 'between',
          'justify-around': justify === 'around',
          'justify-evenly': justify === 'evenly',
        },
        gapClass,
        className
      )}
      {...props}
    />
  );
});

FormFieldGroup.displayName = 'FormFieldGroup';

export function useFormField() {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField must be used within a FormField');
  }
  return context;
}
