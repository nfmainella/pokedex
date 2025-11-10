import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { ReadableStream, WritableStream } from 'stream/web';

// Polyfill for MSW in Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill ReadableStream and WritableStream for MSW (must be before undici)
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream;
}

// Polyfill BroadcastChannel for MSW
if (typeof global.BroadcastChannel === 'undefined') {
  // Simple mock implementation for BroadcastChannel
  global.BroadcastChannel = class BroadcastChannel {
    constructor() {}
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  };
}

// Node.js 20+ has fetch built-in, but we need to ensure it's available globally for MSW
if (typeof global.fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetch, Request, Response, Headers } = require('undici');
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
}

