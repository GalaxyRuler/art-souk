/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }

  namespace NodeJS {
    interface Timeout {
      [Symbol.toPrimitive](): number;
    }
  }

  const Image: {
    new (): HTMLImageElement;
  };
}

export {};
