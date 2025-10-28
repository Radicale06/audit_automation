import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateChatName = (name: string): { message: string } | null => {
  if (!name.trim()) {
    return { message: "Le nom du chat est requis" };
  }
  if (name.length < 3) {
    return { message: "Le nom du chat doit contenir au moins 3 caractères" };
  }
  if (name.length > 50) {
    return { message: "Le nom du chat ne peut pas dépasser 50 caractères" };
  }
  return null;
};

export const validateMessageText = (text: string): { message: string } | null => {
  if (!text.trim()) {
    return { message: "Le message ne peut pas être vide" };
  }
  if (text.length > 2000) {
    return { message: "Le message ne peut pas dépasser 2000 caractères" };
  }
  return null;
};


// Messages d'erreur personnalisés en français
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined" || issue.received === "null") {
        return { message: "Ce champ est requis" };
      }
      return { message: `Type attendu : ${issue.expected}, reçu : ${issue.received}` };
    
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "Adresse email invalide" };
      }
      if (issue.validation === "url") {
        return { message: "URL invalide" };
      }
      return { message: "Chaîne de caractères invalide" };

    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: `Minimum ${issue.minimum} caractère${issue.minimum > 1 ? 's' : ''}` };
      }
      if (issue.type === "number") {
        return { message: `Doit être supérieur à ${issue.minimum}` };
      }
      if (issue.type === "array") {
        return { message: `Doit contenir au moins ${issue.minimum} élément${issue.minimum > 1 ? 's' : ''}` };
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `Maximum ${issue.maximum} caractère${issue.maximum > 1 ? 's' : ''}` };
      }
      if (issue.type === "number") {
        return { message: `Doit être inférieur à ${issue.maximum}` };
      }
      if (issue.type === "array") {
        return { message: `Doit contenir au plus ${issue.maximum} élément${issue.maximum > 1 ? 's' : ''}` };
      }
      break;

    case z.ZodIssueCode.custom:
      return { message: issue.message || "Entrée invalide" };

    default:
      return { message: ctx.defaultError };
  }
  return { message: ctx.defaultError };
};

// Configuration globale de Zod
z.setErrorMap(customErrorMap);

// Schémas de validation réutilisables
export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Adresse email invalide");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
  );

export const usernameSchema = z
  .string()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(50, "Le nom d'utilisateur ne peut pas dépasser 50 caractères")
  .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores");

export const phoneSchema = z
  .string()
  .regex(/^(\+?\d{1,3})?[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/, "Numéro de téléphone invalide");

// Schémas de validation composés
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
  rememberMe: z.boolean().optional()
});

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const userProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, "La biographie ne peut pas dépasser 500 caractères").optional()
});

export const chatMessageSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide").max(2000, "Le message ne peut pas dépasser 2000 caractères"),
  attachments: z.array(z.string().url("URL d'attachement invalide")).optional()
});

// Types dérivés des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;

// Fonction utilitaire pour la validation
export const validateForm = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> => {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return { success: false, errors };
    }
    throw error;
  }
};