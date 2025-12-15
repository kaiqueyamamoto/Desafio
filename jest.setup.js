// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Polyfill para NextRequest no ambiente de teste (apenas em node, não em jsdom)
if (typeof window === 'undefined' && typeof globalThis.Request === 'undefined') {
  // Adicionar TextEncoder/TextDecoder para undici funcionar
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  
  const { Request, Response, Headers } = require('undici');
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;
}

// Mock do localStorage (apenas se window estiver disponível - jsdom)
if (typeof window !== 'undefined') {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock do window.location
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      pathname: '/',
      search: '',
    },
    writable: true,
  });

  // Polyfill para HTMLFormElement.requestSubmit (não implementado no jsdom)
  if (typeof HTMLFormElement !== 'undefined' && !HTMLFormElement.prototype.requestSubmit) {
    HTMLFormElement.prototype.requestSubmit = function(submitter) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      this.dispatchEvent(submitEvent);
    };
  }
}
