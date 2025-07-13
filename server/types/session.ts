import { Session } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
      roleSetupComplete?: boolean;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
      roleSetupComplete?: boolean;
    };
  }
}