/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

export {};