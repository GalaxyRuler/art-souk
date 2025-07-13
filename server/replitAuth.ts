import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL("https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  console.log('Creating/updating user from auth claims:', claims["sub"]);
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
      // Enable multiple OAuth provider selection
      max_age: 0, // Force fresh authentication to show provider selection
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/auth/success",
      failureRedirect: "/api/login",
    })(req, res, (err) => {
      if (err) {
        console.error('❌ Auth callback error:', err);
        return next(err);
      }
      
      // Ensure session is properly set
      if (req.user) {
        const passportUser = req.user as any;
        req.session.user = {
          id: passportUser.claims?.sub,
          email: passportUser.claims?.email,
          firstName: passportUser.claims?.first_name,
          lastName: passportUser.claims?.last_name,
          roles: [] // Will be populated from database
        };
        
        // Force session save
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('❌ Session save error:', saveErr);
          } else {
            console.log('✅ Session saved successfully:', {
              sessionId: req.sessionID,
              userId: req.session.user?.id
            });
          }
          next();
        });
      } else {
        next();
      }
    });
  });

  app.get("/api/logout", (req, res) => {
    console.log('🔓 Logout initiated for user:', req.session?.user?.id);
    
    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Session destruction error:', err);
      } else {
        console.log('✅ Session destroyed successfully');
      }
    });
    
    // Clear the session cookie
    res.clearCookie('connect.sid');
    
    // Passport logout
    req.logout((err) => {
      if (err) {
        console.error('❌ Passport logout error:', err);
        return res.redirect('/');
      }
      
      console.log('✅ Passport logout successful');
      
      try {
        // Try to redirect to OpenID Connect logout
        const logoutUrl = client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/auth/logout-success`,
        }).href;
        
        console.log('🔄 Redirecting to logout URL:', logoutUrl);
        res.redirect(logoutUrl);
      } catch (error) {
        console.error('❌ Error building logout URL:', error);
        // Fallback to simple redirect
        res.redirect('/');
      }
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    // Multiple ways to check authentication
    const sessionUser = req.session?.user;
    const passportUser = req.user as any;
    const userId = sessionUser?.id || passportUser?.claims?.sub;
    const userEmail = sessionUser?.email || passportUser?.claims?.email;

    console.log('🔍 Auth check:', {
      hasSession: !!req.session,
      hasSessionUser: !!sessionUser,
      hasPassportUser: !!passportUser,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      userId: userId,
      userEmail: userEmail,
      requestMethod: req.method,
      requestPath: req.path
    });

    // Check for user data in multiple places
    if (!userId && !userEmail) {
      console.log('❌ No valid user identification found');
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    // If we have passport user but no session user, populate session
    if (!sessionUser && passportUser?.claims) {
      req.session.user = {
        id: passportUser.claims.sub,
        email: passportUser.claims.email,
        firstName: passportUser.claims.first_name,
        lastName: passportUser.claims.last_name,
        roles: [] // Will be populated from database
      };
      
      // Force session save to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error('❌ Session save error during auth:', err);
        }
      });
    }

    // Ensure req.user is populated for downstream middleware
    if (!req.user && sessionUser) {
      req.user = sessionUser;
    } else if (!req.user && passportUser?.claims) {
      req.user = {
        id: passportUser.claims.sub,
        email: passportUser.claims.email,
        firstName: passportUser.claims.first_name,
        lastName: passportUser.claims.last_name,
        roles: []
      };
    }

    // For passport users, check token expiration
    if (passportUser?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      
      if (now > passportUser.expires_at) {
        const refreshToken = passportUser.refresh_token;
        if (!refreshToken) {
          return res.status(401).json({ message: "Session expired" });
        }

        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(passportUser, tokenResponse);
        } catch (error) {
          return res.status(401).json({ message: "Session expired" });
        }
      }
    }

    console.log('✅ Authentication successful for user:', req.user?.id);
    next();
  } catch (error) {
    console.error('🚨 Auth middleware error:', error);
    res.status(500).json({
      message: 'Authentication system error'
    });
  }
};
