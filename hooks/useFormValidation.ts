"use client";

import { useState, useCallback } from "react";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  match?: string;
  custom?: (value: string) => boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: { [K in keyof T]?: ValidationRule };
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useFormValidation<T extends Record<string, string>>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: string): string => {
      const rules = validationRules[name];
      if (!rules) return "";

      if (rules.required && !value.trim()) {
        return "This field is required";
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
      }

      if (rules.email && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return "Please enter a valid email address";
        }
      }

      if (rules.phone && value) {
        const phonePattern = /^[\d\s\+\-\(\)]{10,20}$/;
        if (!phonePattern.test(value)) {
          return "Please enter a valid phone number";
        }
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return "Invalid format";
      }

      if (rules.custom && !rules.custom(value)) {
        return "Invalid value";
      }

      if (rules.match) {
        const matchValue = values[rules.match];
        if (value !== matchValue) {
          return "Values do not match";
        }
      }

      return "";
    },
    [validationRules, values]
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(validationRules) as Array<keyof T>).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key as string] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateField(name as keyof T, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Touch all fields
      const allTouched = Object.keys(initialValues).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit?.(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [initialValues, onSubmit, validateAll, values]
  );

  const setValue = useCallback((name: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    reset,
    validateAll,
    isValid: Object.keys(errors).length === 0,
  };
}

// Pre-built validation presets
export const validators = {
  email: {
    required: true,
    email: true,
  },
  phone: {
    required: true,
    phone: true,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 2000,
  },
  postcode: {
    pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  },
};
