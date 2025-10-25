/**
 * Jest setup file
 * 
 * This file runs before each test suite and can be used to:
 * - Add global test utilities
 * - Set up polyfills
 * - Configure test environment
 */

// Define Symbol.dispose if not available (for testing purposes)
if (typeof Symbol.dispose === 'undefined') {
  // @ts-ignore
  Symbol.dispose = Symbol('Symbol.dispose');
}

// Define Symbol.asyncDispose if not available (for testing purposes)
if (typeof Symbol.asyncDispose === 'undefined') {
  // @ts-ignore
  Symbol.asyncDispose = Symbol('Symbol.asyncDispose');
}

// Optional: Add core-js polyfill if available
// This would be used when testing against an actual implementation
// try {
//   require('core-js/proposals/explicit-resource-management');
// } catch (e) {
//   // Polyfill not available, using mock symbols
// }
