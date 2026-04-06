// Polyfill Web APIs required by next/server in jsdom test environments.
// In jest-environment-jsdom, `global` is the jsdom window which lacks
// native fetch APIs. We use vm.runInThisContext to grab them from the
// real Node.js context (Node 18+ has built-in fetch).

// eslint-disable-next-line @typescript-eslint/no-require-imports
const vm = require('vm')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require('util')

const runInNode = (expr: string) => {
  try {
    return vm.runInThisContext(expr)
  } catch {
    return undefined
  }
}

if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder
}
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = runInNode('Request')
}
if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = runInNode('Response')
}
if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = runInNode('Headers')
}
