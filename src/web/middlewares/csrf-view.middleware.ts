import type { Request, Response, NextFunction } from 'express';
import { generateCsrfToken } from 'src/security/csrf';

export function csrfViewMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const method = req.method.toUpperCase();

  if (method === 'GET' || method === 'HEAD') {
    res.locals.csrfToken = generateCsrfToken(req, res);
  }

  next();
}
