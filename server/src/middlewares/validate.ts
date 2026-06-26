// ─────────────────────────────────────────────────────────
// Zod validation middleware
// ─────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4: issues, Zod v3: errors — support both
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
