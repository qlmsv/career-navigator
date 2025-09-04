import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет имена классов с поддержкой условных классов
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Валидация email
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Валидация номера телефона (международный формат)
 */
export function validatePhone(phone: string): boolean {
  const re = /^\+?[1-9]\d{1,14}$/; // E.164 формат
  return re.test(phone);
}

/**
 * Форматирование номера телефона в российский формат
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  
  return phone;
}

/**
 * Создает объект с сообщениями об ошибках валидации
 */
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function createValidator<T extends Record<string, any>>(
  rules: {
    [K in keyof T]?: (value: T[K], values: T) => string | undefined;
  }
) {
  return (values: T): ValidationErrors<T> => {
    const errors: ValidationErrors<T> = {};
    
    Object.keys(rules).forEach((key) => {
      const validate = rules[key as keyof T];
      if (validate) {
        const error = validate(values[key as keyof T], values);
        if (error) {
          errors[key as keyof T] = error;
        }
      }
    });
    
    return errors;
  };
}

/**
 * Преобразует FormData в объект
 */
export function formDataToObject<T = Record<string, any>>(formData: FormData): T {
  return Object.fromEntries(formData.entries()) as unknown as T;
}

/**
 * Преобразует объект в FormData
 */
export function objectToFormData<T extends Record<string, any>>(data: T): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

/**
 * Хук для управления состоянием формы
 */
export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const setFieldValue = <K extends keyof T>(name: K, value: T[K]) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const setFieldTouched = <K extends keyof T>(name: K, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  };

  const setFieldError = <K extends keyof T>(name: K, error: string | undefined) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const getFieldProps = (name: keyof T) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => 
      async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setErrors,
    setTouched,
    setValues,
    resetForm,
    getFieldProps,
  };
}

/**
 * Хук для валидации формы с помощью Yup
 */
import * as yup from 'yup';

export function useFormValidation<T extends yup.AnyObject>(
  validationSchema: yup.ObjectSchema<T>
) {
  const [errors, setErrors] = React.useState<yup.ValidationError | null>(null);

  const validate = async (values: T) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors(null);
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(err);
      }
      return false;
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    if (!errors) return undefined;
    
    const error = errors.inner.find(err => 
      err.path === fieldName
    );
    
    return error?.message;
  };

  return {
    errors,
    validate,
    getFieldError,
  };
}

/**
 * Хук для работы с файлами в формах
 */
export function useFileInput() {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      
      // Создаем превью для изображений
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return {
    file,
    preview,
    inputRef,
    handleFileChange,
    clearFile,
  };
}
