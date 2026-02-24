import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: _req.path,
    method: _req.method,
  });

  if (error instanceof ZodError) {
    return res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Request validation failed',
        error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      )
    );
  }

  if (error.message === 'User already exists') {
    return res.status(409).json(errorResponse('CONFLICT', error.message));
  }

  if (error.message === 'Invalid credentials') {
    return res.status(401).json(errorResponse('UNAUTHORIZED', error.message));
  }

  if (error.message === 'User not found' || error.message === 'Holding not found' || error.message === 'Fund not found') {
    return res.status(404).json(errorResponse('NOT_FOUND', error.message));
  }

  if (error.message === 'Holding already exists for this fund') {
    return res.status(409).json(errorResponse('CONFLICT', error.message));
  }

  return res.status(500).json(
    errorResponse('INTERNAL_ERROR', 'An unexpected error occurred')
  );
}
