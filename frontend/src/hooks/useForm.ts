import { useState, useCallback, useEffect, useMemo } from 'react';
import { z } from 'zod';

export type ValidationRule<T> = {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string;
};

export type FieldConfig<T> = {
  initialValue: T;
  required?: boolean;
  validate?: ValidationRule<T>[];
  transform?: (value: T) => T;
  deps?: string[];
  zodSchema?: z.ZodType<T>;
};

export type FormConfig<T extends Record<string, any>> = {
  fields: {
    [K in keyof T]: FieldConfig<T[K]>;
  };
  onSubmit?: (values: T) => void | Promise<void>;
  onError?: (errors: FormErrors<T>) => void;
};

export type FormErrors<T> = {
  [K in keyof T]?: string[];
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const [values, setValues] = useState<T>(() => {
    const initial: Partial<T> = {};
    for (const [key, field] of Object.entries(config.fields)) {
      initial[key as keyof T] = field.initialValue;
    }
    return initial as T;
  });

  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validation memoizée pour chaque champ
  const validators = useMemo(() => {
    const result: Record<string, ((value: any) => Promise<string[]>)> = {};
    
    for (const [key, field] of Object.entries(config.fields)) {
      result[key] = async (value: any) => {
        const fieldErrors: string[] = [];

        // Validation required
        if (field.required && (value === undefined || value === null || value === '')) {
          fieldErrors.push('Ce champ est requis');
        }

        // Validation Zod
        if (field.zodSchema) {
          try {
            await field.zodSchema.parseAsync(value);
          } catch (error) {
            if (error instanceof z.ZodError) {
              fieldErrors.push(...error.errors.map(e => e.message));
            }
          }
        }

        // Validations personnalisées
        if (field.validate) {
          for (const rule of field.validate) {
            try {
              const isValid = await rule.validate(value);
              if (!isValid) {
                fieldErrors.push(rule.message);
              }
            } catch (error) {
              fieldErrors.push('Erreur de validation');
            }
          }
        }

        return fieldErrors;
      };
    }

    return result;
  }, [config.fields]);

  // Valider un champ spécifique
  const validateField = useCallback(async (name: keyof T) => {
    const value = values[name];
    const validator = validators[name as string];
    
    if (validator) {
      const fieldErrors = await validator(value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors,
      }));
      return fieldErrors.length === 0;
    }
    
    return true;
  }, [validators, values]);

  // Valider tous les champs
  const validateForm = useCallback(async () => {
    const validations = await Promise.all(
      Object.keys(config.fields).map(async key => {
        const isValid = await validateField(key as keyof T);
        return [key, isValid] as const;
      })
    );

    return validations.every(([, isValid]) => isValid);
  }, [config.fields, validateField]);

  // Gérer le changement de valeur d'un champ
  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    const field = config.fields[name];
    
    // Appliquer la transformation si définie
    const transformedValue = field.transform ? field.transform(value) : value;
    
    setValues(prev => ({
      ...prev,
      [name]: transformedValue,
    }));
    
    setIsDirty(true);

    // Valider les champs dépendants
    if (field.deps) {
      field.deps.forEach(dep => {
        validateField(dep as keyof T);
      });
    }
  }, [config.fields, validateField]);

  // Gérer le focus out d'un champ
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    validateField(name);
  }, [validateField]);

  // Reset le formulaire
  const reset = useCallback(() => {
    const initial: Partial<T> = {};
    for (const [key, field] of Object.entries(config.fields)) {
      initial[key as keyof T] = field.initialValue;
    }
    setValues(initial as T);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [config.fields]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);

    try {
      const isValid = await validateForm();
      
      if (isValid) {
        await config.onSubmit?.(values);
        reset();
      } else {
        config.onError?.(errors);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      config.onError?.(errors);
    } finally {
      setIsSubmitting(false);
    }
  }, [config, errors, reset, validateForm, values]);

  useEffect(() => {
    // Valider initialement les champs requis
    Object.entries(config.fields)
      .filter(([, field]) => field.required)
      .forEach(([key]) => {
        validateField(key as keyof T);
      });
  }, [config.fields, validateField]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
  };
}

// Exemple d'utilisation:
// const loginSchema = z.object({
//   email: z.string().email('Email invalide'),
//   password: z.string().min(8, 'Mot de passe trop court'),
// });
//
// const { 
//   values,
//   errors,
//   handleChange,
//   handleBlur,
//   handleSubmit 
// } = useForm({
//   fields: {
//     email: {
//       initialValue: '',
//       required: true,
//       zodSchema: loginSchema.shape.email,
//       validate: [{
//         validate: (value) => value.includes('@'),
//         message: 'Email invalide'
//       }]
//     },
//     password: {
//       initialValue: '',
//       required: true,
//       zodSchema: loginSchema.shape.password
//     }
//   },
//   onSubmit: async (values) => {
//     await loginUser(values);
//   }
// });