// Global type definitions for Art Souk application

// Image imports
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Environment variables for Art Souk
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_REPL_ID: string;
  readonly VITE_DATABASE_URL: string;
  readonly VITE_SENDGRID_API_KEY: string;
  readonly VITE_REDIS_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly MODE: 'development' | 'production' | 'test';
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// React component props with children
interface PropsWithChildren {
  children?: React.ReactNode;
}

// Common UI component props
interface BaseComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
}

// Art Souk specific global types
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Make this file a module
export {};