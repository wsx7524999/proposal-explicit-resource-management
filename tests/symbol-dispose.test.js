/**
 * Tests for Symbol.dispose behavior
 * 
 * These tests validate the expected behavior of Symbol.dispose
 * as defined in the ECMAScript Explicit Resource Management proposal.
 */

describe('Symbol.dispose', () => {
  describe('Symbol existence', () => {
    test('should be a unique symbol', () => {
      // Symbol.dispose should be defined in implementations
      expect(typeof Symbol.dispose).toBe('symbol');
    });

    test('should have the correct description', () => {
      expect(Symbol.dispose.description).toBe('Symbol.dispose');
    });

    test('should be different from other symbols', () => {
      expect(Symbol.dispose).not.toBe(Symbol.iterator);
      expect(Symbol.dispose).not.toBe(Symbol.asyncIterator);
    });
  });

  describe('Basic disposal', () => {
    test('should call dispose method when resource is disposed', () => {
      let disposed = false;
      
      const resource = {
        [Symbol.dispose]() {
          disposed = true;
        }
      };
      
      resource[Symbol.dispose]();
      
      expect(disposed).toBe(true);
    });

    test('should pass the resource as `this` context', () => {
      let context;
      
      const resource = {
        id: 123,
        [Symbol.dispose]() {
          context = this;
        }
      };
      
      resource[Symbol.dispose]();
      
      expect(context).toBe(resource);
      expect(context.id).toBe(123);
    });

    test('should allow multiple calls to dispose', () => {
      let disposeCount = 0;
      
      const resource = {
        [Symbol.dispose]() {
          disposeCount++;
        }
      };
      
      resource[Symbol.dispose]();
      resource[Symbol.dispose]();
      
      expect(disposeCount).toBe(2);
    });
  });

  describe('Resource patterns', () => {
    test('should work with class-based resources', () => {
      let disposed = false;
      
      class Resource {
        [Symbol.dispose]() {
          disposed = true;
        }
      }
      
      const resource = new Resource();
      resource[Symbol.dispose]();
      
      expect(disposed).toBe(true);
    });

    test('should work with prototype chain', () => {
      let disposed = false;
      
      class BaseResource {
        [Symbol.dispose]() {
          disposed = true;
        }
      }
      
      class DerivedResource extends BaseResource {
        // Inherits Symbol.dispose
      }
      
      const resource = new DerivedResource();
      resource[Symbol.dispose]();
      
      expect(disposed).toBe(true);
    });

    test('should allow disposal logic to throw errors', () => {
      const resource = {
        [Symbol.dispose]() {
          throw new Error('Disposal failed');
        }
      };
      
      expect(() => resource[Symbol.dispose]()).toThrow('Disposal failed');
    });

    test('should support conditional disposal', () => {
      let disposed = false;
      
      const resource = {
        active: true,
        [Symbol.dispose]() {
          if (this.active) {
            disposed = true;
            this.active = false;
          }
        }
      };
      
      resource[Symbol.dispose]();
      expect(disposed).toBe(true);
      
      disposed = false;
      resource[Symbol.dispose]();
      expect(disposed).toBe(false); // Already disposed
    });
  });

  describe('Real-world scenarios', () => {
    test('should work with file-like resources', () => {
      class FileHandle {
        constructor(filename) {
          this.filename = filename;
          this.isOpen = true;
        }
        
        read() {
          if (!this.isOpen) {
            throw new Error('File is closed');
          }
          return 'file content';
        }
        
        [Symbol.dispose]() {
          if (this.isOpen) {
            this.isOpen = false;
          }
        }
      }
      
      const file = new FileHandle('test.txt');
      expect(file.isOpen).toBe(true);
      expect(file.read()).toBe('file content');
      
      file[Symbol.dispose]();
      expect(file.isOpen).toBe(false);
      expect(() => file.read()).toThrow('File is closed');
    });

    test('should work with lock-like resources', () => {
      class Lock {
        constructor() {
          this.locked = false;
        }
        
        acquire() {
          if (this.locked) {
            throw new Error('Lock already acquired');
          }
          this.locked = true;
        }
        
        [Symbol.dispose]() {
          if (this.locked) {
            this.locked = false;
          }
        }
      }
      
      const lock = new Lock();
      lock.acquire();
      expect(lock.locked).toBe(true);
      
      lock[Symbol.dispose]();
      expect(lock.locked).toBe(false);
    });

    test('should work with connection-like resources', () => {
      class Connection {
        constructor(url) {
          this.url = url;
          this.connected = true;
        }
        
        send(data) {
          if (!this.connected) {
            throw new Error('Not connected');
          }
          return `Sent: ${data}`;
        }
        
        [Symbol.dispose]() {
          if (this.connected) {
            this.connected = false;
          }
        }
      }
      
      const conn = new Connection('ws://example.com');
      expect(conn.send('hello')).toBe('Sent: hello');
      
      conn[Symbol.dispose]();
      expect(() => conn.send('goodbye')).toThrow('Not connected');
    });
  });

  describe('Edge cases', () => {
    test('should handle resources with no-op disposal', () => {
      const resource = {
        [Symbol.dispose]() {
          // No-op disposal
        }
      };
      
      expect(() => resource[Symbol.dispose]()).not.toThrow();
    });

    test('should handle disposal that returns a value', () => {
      const resource = {
        [Symbol.dispose]() {
          return 'disposal result';
        }
      };
      
      const result = resource[Symbol.dispose]();
      expect(result).toBe('disposal result');
    });

    test('should work with frozen objects', () => {
      let disposed = false;
      
      const resource = Object.freeze({
        [Symbol.dispose]() {
          disposed = true;
        }
      });
      
      resource[Symbol.dispose]();
      expect(disposed).toBe(true);
    });

    test('should work with sealed objects', () => {
      let disposed = false;
      
      const resource = Object.seal({
        [Symbol.dispose]() {
          disposed = true;
        }
      });
      
      resource[Symbol.dispose]();
      expect(disposed).toBe(true);
    });
  });
});
