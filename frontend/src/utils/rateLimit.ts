export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  errorMessage?: string;
}

export interface RateLimitState {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private cache: Map<string, RateLimitState>;
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.cache = new Map();
    this.options = {
      errorMessage: 'Trop de requêtes, veuillez réessayer plus tard',
      ...options
    };
  }

  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const state = this.cache.get(key) || { requests: 0, resetTime: now + this.options.windowMs };

    // Réinitialiser le compteur si la fenêtre de temps est écoulée
    if (now > state.resetTime) {
      state.requests = 0;
      state.resetTime = now + this.options.windowMs;
    }

    if (state.requests >= this.options.maxRequests) {
      const retryAfter = Math.ceil((state.resetTime - now) / 1000);
      throw new RateLimitError(this.options.errorMessage, retryAfter);
    }

    state.requests++;
    this.cache.set(key, state);

    try {
      return await fn();
    } catch (error) {
      // Ne pas compter les erreurs dans la limite
      state.requests--;
      this.cache.set(key, state);
      throw error;
    }
  }

  getState(key: string): { remaining: number; reset: number } | null {
    const state = this.cache.get(key);
    if (!state) return null;

    return {
      remaining: Math.max(0, this.options.maxRequests - state.requests),
      reset: Math.ceil((state.resetTime - Date.now()) / 1000)
    };
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Limites prédéfinies pour différents types de requêtes
export const rateLimits = {
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Trop de requêtes API, veuillez réessayer dans quelques instants'
  }),
  auth: new RateLimiter({
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    errorMessage: 'Trop de tentatives de connexion, veuillez réessayer dans quelques minutes'
  }),
  chat: new RateLimiter({
    maxRequests: 20,
    windowMs: 10 * 1000, // 10 secondes
    errorMessage: 'Vous envoyez des messages trop rapidement, veuillez patienter'
  })
};

// Export des rate limiters spécifiques
export const messageRateLimiter = rateLimits.chat;  // Utilisation du rate limiter "chat" pour limiter les messages
export const chatRateLimiter = rateLimits.chat;     // Utilisation du rate limiter "chat" pour limiter les chats
