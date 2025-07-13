import { Request, Response, NextFunction } from 'express';

export const sessionFixMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Fix for session persistence issues
  if (req.session && req.user && !req.session.user) {
    const passportUser = req.user as any;
    if (passportUser.claims) {
      req.session.user = {
        id: passportUser.claims.sub,
        email: passportUser.claims.email,
        firstName: passportUser.claims.first_name,
        lastName: passportUser.claims.last_name,
        roles: []
      };
    }
  }
  
  next();
};