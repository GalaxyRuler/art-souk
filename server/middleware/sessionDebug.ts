import { Request, Response, NextFunction } from 'express';

export const sessionDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only log for API routes
  if (req.path.startsWith('/api/')) {
    console.log('🔍 Session Debug:', {
      method: req.method,
      path: req.path,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      userId: req.session?.user?.id,
      userEmail: req.session?.user?.email,
      cookie: req.session?.cookie ? {
        maxAge: req.session.cookie.maxAge,
        expires: req.session.cookie.expires,
        secure: req.session.cookie.secure,
        httpOnly: req.session.cookie.httpOnly
      } : null
    });
  }
  next();
};

export const sessionRecoveryMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // If no session but we have a session ID, try to recover
  if (!req.session?.user && req.sessionID) {
    try {
      // Try to reload session from store
      req.session.reload((err) => {
        if (err) {
          console.log('📝 Session reload failed:', err.message);
        } else {
          console.log('✅ Session reloaded successfully');
        }
        next();
      });
    } catch (error) {
      console.error('🚨 Session recovery error:', error);
      next();
    }
  } else {
    next();
  }
};