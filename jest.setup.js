// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill para NextRequest no ambiente de teste
if (typeof globalThis.Request === 'undefined') {
  const { Request, Response, Headers } = require('undici');
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.Headers = Headers;
}
