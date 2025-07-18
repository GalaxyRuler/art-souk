import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock environment variables
vi.mock('../../client/src/lib/env', () => ({
  env: {
    API_URL: 'http://localhost:5000',
    NODE_ENV: 'test'
  }
}))

// Mock i18n
vi.mock('../../client/src/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  }),
  initI18n: vi.fn()
}))

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null
  })),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn()
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Console warnings/errors that we want to ignore in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args: any[]) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: React.createFactory() is deprecated')
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

console.warn = (...args: any[]) => {
  if (
    args[0]?.includes?.('componentWillReceiveProps') ||
    args[0]?.includes?.('componentWillUpdate')
  ) {
    return
  }
  originalConsoleWarn.call(console, ...args)
}