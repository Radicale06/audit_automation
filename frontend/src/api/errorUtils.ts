import axios, { AxiosError } from 'axios';
import { RateLimitError } from '../utils/rateLimit';

export interface ApiError {
  message: string;
  code: string;
  statusCode?: number;
  field?: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Erreur de connexion réseau') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationAPIError extends APIError {
  constructor(message: string, public validationErrors: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR', { validationErrors });
    this.name = 'ValidationAPIError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Non authentifié') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Non autorisé') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Conflit de ressources') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Fonction utilitaire pour formatter les erreurs de manière cohérente
export const formatError = (error: unknown): {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
} => {
  if (error instanceof APIError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details
    };
  }

  if (error instanceof RateLimitError) {
    return {
      message: error.message,
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
      details: { retryAfter: error.retryAfter }
    };
  }

  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: 'NETWORK_ERROR',
      statusCode: 0
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }

  return {
    message: 'Une erreur inattendue est survenue',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };
};

// Fonction utilitaire pour gérer les erreurs de l'API
export const handleAPIError = (error: unknown): never => {
  if (error instanceof Response) {
    throw new APIError(
      'Erreur de requête API',
      error.status,
      'API_ERROR'
    );
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    throw new NetworkError();
  }

  throw error;
};

// Messages d'erreur localisés
export const errorMessages = {
  network: {
    offline: 'Vous êtes hors ligne. Veuillez vérifier votre connexion internet.',
    timeout: 'La requête a pris trop de temps. Veuillez réessayer.',
    server: 'Le serveur ne répond pas. Veuillez réessayer plus tard.'
  },
  auth: {
    invalidCredentials: 'Email ou mot de passe incorrect.',
    sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
    unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.'
  },
  validation: {
    required: 'Ce champ est requis.',
    invalid: 'Cette valeur n\'est pas valide.',
    tooShort: (min: number) => `Doit contenir au moins ${min} caractères.`,
    tooLong: (max: number) => `Ne doit pas dépasser ${max} caractères.`
  },
  chat: {
    messageFailed: 'Impossible d\'envoyer le message. Veuillez réessayer.',
    messageEmpty: 'Le message ne peut pas être vide.',
    attachmentFailed: 'Impossible d\'ajouter la pièce jointe.'
  }
};

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const statusCode = axiosError.response?.status;

    // Handle rate limiting errors
    if (statusCode === 429) {
      return {
        message: 'Trop de requêtes, veuillez réessayer dans quelques instants',
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429
      };
    }

    // Handle authentication errors
    if (statusCode === 401) {
      return {
        message: 'Session expirée, veuillez vous reconnecter',
        code: 'UNAUTHORIZED',
        statusCode: 401
      };
    }

    // Handle validation errors
    if (statusCode === 400) {
      const validationError = axiosError.response?.data?.error;
      if (validationError?.field) {
        return {
          message: validationError.message || 'Données invalides',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          field: validationError.field
        };
      }
    }

    // Handle conflict (e.g., email already used)
    if (statusCode === 409) {
      const msg =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        'Conflit de ressources';
      return {
        message: typeof msg === 'string' ? msg : 'Cet email est déjà utilisé',
        code: 'CONFLICT',
        statusCode: 409,
      };
    }

    // Handle server errors
    if (statusCode && statusCode >= 500) {
      return {
        message: 'Une erreur serveur est survenue, veuillez réessayer plus tard',
        code: 'SERVER_ERROR',
        statusCode
      };
    }

    // Handle network errors
    if (axiosError.code === 'ECONNABORTED') {
      return {
        message: 'La connexion au serveur a échoué, veuillez vérifier votre connexion internet',
        code: 'CONNECTION_TIMEOUT',
      };
    }

    if (!axiosError.response) {
      return {
        message: 'Impossible de se connecter au serveur, veuillez vérifier votre connexion internet',
        code: 'NETWORK_ERROR',
      };
    }

    // Default error message
    return {
      message: axiosError.response?.data?.message || 'Une erreur est survenue',
      code: 'UNKNOWN_ERROR',
      statusCode: axiosError.response?.status
    };
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'APPLICATION_ERROR'
    };
  }

  return {
    message: 'Une erreur inattendue est survenue',
    code: 'UNKNOWN_ERROR'
  };
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403 || statusCode === 404) {
          throw error;
        }
      }

      // Last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  // This should never happen due to the throw in the loop
  throw lastError || new Error('Opération échouée après plusieurs tentatives');
}