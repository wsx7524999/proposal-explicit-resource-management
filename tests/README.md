# Tests

This directory contains unit tests for the ECMAScript Explicit Resource Management proposal implementation.

## Test Structure

The test suite is organized to cover the key aspects of the proposal:

### 1. `symbol-dispose.test.js`
Tests for the `Symbol.dispose` well-known symbol:
- Symbol properties and uniqueness
- Basic disposal behavior
- Resource patterns (classes, prototypes)
- Real-world scenarios (files, locks, connections)
- Edge cases and error handling

### 2. `symbol-async-dispose.test.js`
Tests for the `Symbol.asyncDispose` well-known symbol:
- Async disposal behavior
- Promise handling
- Async operations and error handling
- Real-world async scenarios (databases, streams, network)
- Fallback to `Symbol.dispose`

### 3. `disposable-stack.test.js`
Tests for the `DisposableStack` container class:
- Basic stack operations
- Resource tracking and disposal order
- `adopt()` method for non-disposable resources
- `defer()` method for custom cleanup
- `move()` method for transferring resources
- Error handling and aggregation
- Integration patterns

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Environment

These tests use Jest as the testing framework. The tests include mock implementations since native support for the proposal may not yet be available in all JavaScript engines.

## Implementation Notes

The tests are designed to:
1. **Validate the specification**: Ensure behavior matches the TC39 proposal
2. **Document expected behavior**: Serve as examples of how the API should work
3. **Guide implementations**: Help implementers understand edge cases
4. **Ensure compatibility**: Test various patterns and use cases

## Testing Against Polyfills

These tests can be run against polyfill implementations of the proposal. To test with a polyfill:

1. Install the polyfill (e.g., from `core-js`):
   ```bash
   npm install core-js
   ```

2. Import the polyfill in your test setup:
   ```javascript
   require('core-js/proposals/explicit-resource-management');
   ```

## Contributing Tests

When adding new tests:
1. Follow the existing test structure and naming conventions
2. Include descriptive test names that explain what is being tested
3. Test both success and failure cases
4. Include edge cases and boundary conditions
5. Add comments for complex test scenarios

## Test Coverage Goals

The test suite aims to cover:
- ✅ All API methods and properties
- ✅ Standard usage patterns
- ✅ Error conditions and exceptions
- ✅ Resource cleanup guarantees
- ✅ Disposal order semantics
- ✅ Integration scenarios

## Related Resources

- [Main README](../README.md) - Full proposal specification
- [Examples](../examples/) - Practical usage examples
- [TC39 Proposal](https://github.com/tc39/proposal-explicit-resource-management) - Official proposal repository
