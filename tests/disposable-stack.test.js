/**
 * Tests for DisposableStack polyfill behavior
 * 
 * These tests validate the expected behavior of the DisposableStack class
 * as defined in the ECMAScript Explicit Resource Management proposal.
 */

describe('DisposableStack', () => {
  // Mock implementation for testing (since native support may not be available)
  class MockDisposableStack {
    constructor() {
      this._stack = [];
      this._disposed = false;
    }

    get disposed() {
      return this._disposed;
    }

    use(value) {
      if (this._disposed) {
        throw new ReferenceError('DisposableStack is already disposed');
      }
      if (value !== null && value !== undefined) {
        if (typeof value[Symbol.dispose] !== 'function') {
          throw new TypeError('Value is not disposable');
        }
        this._stack.push({ value, dispose: value[Symbol.dispose] });
      }
      return value;
    }

    adopt(value, onDispose) {
      if (this._disposed) {
        throw new ReferenceError('DisposableStack is already disposed');
      }
      if (typeof onDispose !== 'function') {
        throw new TypeError('onDispose must be a function');
      }
      this._stack.push({ value, dispose: () => onDispose(value) });
      return value;
    }

    defer(onDispose) {
      if (this._disposed) {
        throw new ReferenceError('DisposableStack is already disposed');
      }
      if (typeof onDispose !== 'function') {
        throw new TypeError('onDispose must be a function');
      }
      this._stack.push({ value: undefined, dispose: onDispose });
    }

    move() {
      if (this._disposed) {
        throw new ReferenceError('DisposableStack is already disposed');
      }
      const newStack = new MockDisposableStack();
      newStack._stack = this._stack;
      this._stack = [];
      return newStack;
    }

    [Symbol.dispose]() {
      if (this._disposed) return;
      
      this._disposed = true;
      const errors = [];
      
      while (this._stack.length > 0) {
        const { dispose } = this._stack.pop();
        try {
          dispose();
        } catch (error) {
          errors.push(error);
        }
      }
      
      if (errors.length > 0) {
        throw errors[0]; // Simplified error handling for tests
      }
    }

    dispose() {
      return this[Symbol.dispose]();
    }
  }

  describe('Basic functionality', () => {
    test('should create a new DisposableStack', () => {
      const stack = new MockDisposableStack();
      expect(stack).toBeDefined();
      expect(stack.disposed).toBe(false);
    });

    test('should track and dispose resources in reverse order', () => {
      const disposeOrder = [];
      const stack = new MockDisposableStack();
      
      const resource1 = {
        [Symbol.dispose]() {
          disposeOrder.push('resource1');
        }
      };
      
      const resource2 = {
        [Symbol.dispose]() {
          disposeOrder.push('resource2');
        }
      };
      
      stack.use(resource1);
      stack.use(resource2);
      stack.dispose();
      
      expect(disposeOrder).toEqual(['resource2', 'resource1']);
      expect(stack.disposed).toBe(true);
    });

    test('should handle null and undefined values', () => {
      const stack = new MockDisposableStack();
      
      expect(() => stack.use(null)).not.toThrow();
      expect(() => stack.use(undefined)).not.toThrow();
      
      stack.dispose();
    });

    test('should throw TypeError for non-disposable values', () => {
      const stack = new MockDisposableStack();
      
      expect(() => stack.use({})).toThrow(TypeError);
      expect(() => stack.use({ close: () => {} })).toThrow(TypeError);
    });
  });

  describe('adopt() method', () => {
    test('should adopt non-disposable resources with custom cleanup', () => {
      const stack = new MockDisposableStack();
      const cleanupCalls = [];
      
      const resource = { id: 1 };
      stack.adopt(resource, (val) => {
        cleanupCalls.push(val.id);
      });
      
      stack.dispose();
      
      expect(cleanupCalls).toEqual([1]);
    });

    test('should return the adopted value', () => {
      const stack = new MockDisposableStack();
      const resource = { id: 1 };
      
      const result = stack.adopt(resource, () => {});
      
      expect(result).toBe(resource);
    });

    test('should throw TypeError if onDispose is not a function', () => {
      const stack = new MockDisposableStack();
      
      expect(() => stack.adopt({}, null)).toThrow(TypeError);
      expect(() => stack.adopt({}, 'not a function')).toThrow(TypeError);
    });
  });

  describe('defer() method', () => {
    test('should execute deferred callbacks on dispose', () => {
      const stack = new MockDisposableStack();
      const calls = [];
      
      stack.defer(() => calls.push('first'));
      stack.defer(() => calls.push('second'));
      
      stack.dispose();
      
      expect(calls).toEqual(['second', 'first']);
    });

    test('should throw TypeError if callback is not a function', () => {
      const stack = new MockDisposableStack();
      
      expect(() => stack.defer(null)).toThrow(TypeError);
      expect(() => stack.defer('not a function')).toThrow(TypeError);
    });
  });

  describe('move() method', () => {
    test('should move resources to a new stack', () => {
      const stack1 = new MockDisposableStack();
      const disposeOrder = [];
      
      stack1.use({
        [Symbol.dispose]() {
          disposeOrder.push('resource');
        }
      });
      
      const stack2 = stack1.move();
      
      // Original stack should not dispose anything
      stack1.dispose();
      expect(disposeOrder).toEqual([]);
      
      // New stack should dispose the resource
      stack2.dispose();
      expect(disposeOrder).toEqual(['resource']);
    });

    test('should throw if already disposed', () => {
      const stack = new MockDisposableStack();
      stack.dispose();
      
      expect(() => stack.move()).toThrow(ReferenceError);
    });
  });

  describe('Error handling', () => {
    test('should continue disposing even if one resource throws', () => {
      const stack = new MockDisposableStack();
      const disposeOrder = [];
      
      stack.use({
        [Symbol.dispose]() {
          disposeOrder.push('first');
        }
      });
      
      stack.use({
        [Symbol.dispose]() {
          disposeOrder.push('second');
          throw new Error('Dispose error');
        }
      });
      
      stack.use({
        [Symbol.dispose]() {
          disposeOrder.push('third');
        }
      });
      
      expect(() => stack.dispose()).toThrow('Dispose error');
      expect(disposeOrder).toEqual(['third', 'second', 'first']);
    });

    test('should not allow operations after disposal', () => {
      const stack = new MockDisposableStack();
      stack.dispose();
      
      expect(() => stack.use({ [Symbol.dispose]() {} })).toThrow(ReferenceError);
      expect(() => stack.adopt({}, () => {})).toThrow(ReferenceError);
      expect(() => stack.defer(() => {})).toThrow(ReferenceError);
    });

    test('should be idempotent when disposed multiple times', () => {
      const stack = new MockDisposableStack();
      const calls = [];
      
      stack.defer(() => calls.push('dispose'));
      
      stack.dispose();
      stack.dispose();
      
      expect(calls).toEqual(['dispose']);
    });
  });

  describe('Integration patterns', () => {
    test('should support mixed resource types', () => {
      const stack = new MockDisposableStack();
      const calls = [];
      
      // Native disposable
      stack.use({
        [Symbol.dispose]() {
          calls.push('native');
        }
      });
      
      // Adopted resource
      stack.adopt({ id: 1 }, (val) => {
        calls.push(`adopted-${val.id}`);
      });
      
      // Deferred callback
      stack.defer(() => {
        calls.push('deferred');
      });
      
      stack.dispose();
      
      expect(calls).toEqual(['deferred', 'adopted-1', 'native']);
    });
  });
});
