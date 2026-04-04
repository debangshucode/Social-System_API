import { doubleCsrf } from 'csrf-csrf';
import type { Request } from 'express';
import type { HttpError } from 'http-errors';

const isProd = process.env.NODE_ENV === 'production';

const csrf = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret) {
      throw new Error('CSRF_SECRET is not set');
    }
    return secret;
  },

  getSessionIdentifier: (req: Request) =>
    req.cookies?.refresh_token ||
    req.cookies?.access_token ||
    'anonymous',

  cookieName: isProd ? '__Host-csrf-token' : 'csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: isProd,
    httpOnly: true,
  },

  getCsrfTokenFromRequest: (req: Request) => {
    if (typeof req.body?._csrf === 'string') {
      return req.body._csrf;
    }

    const header = req.headers['x-csrf-token'];
    return typeof header === 'string' ? header : undefined;
  },
});

export const generateCsrfToken = csrf.generateCsrfToken;
export const doubleCsrfProtection = csrf.doubleCsrfProtection;
export const invalidCsrfTokenError: HttpError = csrf.invalidCsrfTokenError;
