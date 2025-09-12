// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock only the problematic Chakra subpath to a local implementation so '@chakra-ui/react'
// can load normally with real HTML semantics (Button, etc.).
jest.mock('@chakra-ui/utils/context', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  function getErrorMessage(hook: string, provider: string) {
    return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
  }
  function createContext<T = unknown>(options: any = {}) {
    const {
      name,
      strict = true,
      hookName = 'useContext',
      providerName = 'Provider',
      errorMessage,
      defaultValue,
    } = options || {};
    const Context = React.createContext<T>(defaultValue);
    (Context as any).displayName = name;
    function useContext() {
      const context = React.useContext(Context as any);
      if (!context && strict) {
        const err = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
        (err as any).name = 'ContextError';
        // capture stack if available
        if ((Error as any).captureStackTrace) (Error as any).captureStackTrace(err, useContext);
        throw err;
      }
      return context;
    }
    return [ (Context as any).Provider, useContext, Context ];
  }
  return { createContext };
}, { virtual: true });

// Provide a virtual mock for 'react-router-dom' to avoid ESM resolution issues under CRA/Jest
jest.mock('react-router-dom', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  const BrowserRouter = ({ children }: any) => React.createElement(React.Fragment, null, children);
  const Routes = ({ children }: any) => React.createElement(React.Fragment, null, children);
  const Route = ({ element }: any) => (element ?? null);
  const Link = ({ children, to, ...rest }: any) => React.createElement('a', { href: typeof to === 'string' ? to : '#', ...rest }, children);
  const Navigate = () => null;
  const useNavigate = () => () => {};
  const useLocation = () => ({ pathname: '/', search: '' });
  const useParams = () => ({});
  const useSearchParams = () => [new URLSearchParams(), () => {}] as const;
  return { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation, useParams, useSearchParams };
}, { virtual: true });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Suppress console errors for cleaner test output
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:7070/api';

// Global test timeout
jest.setTimeout(30000);
