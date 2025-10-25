# Examples

This directory contains practical examples demonstrating how the ECMAScript Explicit Resource Management proposal could be used in real-world scenarios.

## Available Examples

### 1. File Operations (`file-operations.js`)

Demonstrates basic resource management using the `using` declaration for file handles:
- Simple file reading with automatic cleanup
- Managing multiple file resources
- Exception handling with guaranteed resource disposal

**Key concepts:**
- `Symbol.dispose` implementation
- Automatic resource cleanup on scope exit
- Resource disposal order (reverse of declaration)

### 2. Database Connection Management (`database-connection.js`)

Shows async resource management with database connections and transactions:
- Async connection management with `await using`
- Transaction handling with automatic rollback
- Successful transaction commits

**Key concepts:**
- `Symbol.asyncDispose` implementation
- Async resource disposal
- Transaction patterns with automatic rollback

### 3. DisposableStack Usage (`disposable-stack.js`)

Illustrates the use of `DisposableStack` for managing multiple resources:
- Basic stack usage with multiple resources
- Custom cleanup operations using `defer()`
- Adopting non-disposable resources with `adopt()`
- Error handling with resource stacks
- Moving resources between stacks

**Key concepts:**
- `DisposableStack` class usage
- LIFO disposal order
- Custom cleanup callbacks
- Resource adoption patterns

## Running the Examples

**Note:** These examples demonstrate the proposed syntax and behavior. Since the proposal is not yet fully implemented in JavaScript engines, these examples are for educational purposes and illustration of the proposal's capabilities.

To run these examples once the proposal is implemented:

```bash
node examples/file-operations.js
node examples/database-connection.js
node examples/disposable-stack.js
```

For environments without native support, you can use polyfills or transpilers that support the explicit resource management proposal.

## Learning More

For a complete understanding of the proposal, please refer to:
- [Main README](../README.md) - Full proposal specification
- [TC39 Proposal Repository](https://github.com/tc39/proposal-explicit-resource-management)

## Contributing Examples

If you have additional use cases or examples that would help illustrate the proposal, please feel free to contribute! See the [Contributing Guidelines](../README.md#contributing) for more information.
