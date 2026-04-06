// Polyfill Web APIs needed by next/server in Node.js test environment
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  fetch: globalThis.fetch,
})
