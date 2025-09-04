import { useState, useCallback } from 'react';
import { z, ZodError } from 'zod';

export type FormState<T> = {
  values: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
};

export function useFormState<T extends Record<string, any>>(
  initialValues: T,
  schema: z.ZodSchema<T>
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {} as Record<keyof T, string>,
    isSubmitting: false,
    isValid: false,
  });

  const validate = useCallback(
    (values: T) => {
      try {
        schema.parse(values);
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const errors = error.errors.reduce(
            (acc, curr) => {
              const key = curr.path[0] as keyof T;
              acc[key] = curr.message;
              return acc;
            },
            {} as Record<keyof T, string>
          );
          return { isValid: false, errors };
        }
        return { isValid: false, errors: {} };
      }
    },
    [schema]
  );

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      const newValues = { ...state.values, [field]: value };
      const { isValid, errors } = validate(newValues);
      
      setState((prev) => ({
        ...prev,
        values: newValues,
        errors: { ...prev.errors, ...errors },
        isValid,
      }));
    },
    [state.values, validate]
  );

  const setErrors = useCallback((errors: Record<keyof T, string>) => {
    setState((prev) => ({
      ...prev,
      errors,
      isValid: Object.values(errors).every((error) => !error),
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState((prev) => ({
      ...prev,
      isSubmitting,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {} as Record<keyof T, string>,
      isSubmitting: false,
      isValid: false,
    });
  }, [initialValues]);

  return {
    ...state,
    setFieldValue,
    setErrors,
    setSubmitting,
    reset,
  };
}
