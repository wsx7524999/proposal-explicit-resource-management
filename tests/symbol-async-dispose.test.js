/**
 * Tests for Symbol.asyncDispose behavior
 * 
 * These tests validate the expected behavior of Symbol.asyncDispose
 * as defined in the ECMAScript Explicit Resource Management proposal.
 */

describe('Symbol.asyncDispose', () => {
  describe('Symbol existence', () => {
    test('should be a unique symbol', () => {
      expect(typeof Symbol.asyncDispose).toBe('symbol');
    });

    test('should have the correct description', () => {
      expect(Symbol.asyncDispose.description).toBe('Symbol.asyncDispose');
    });

    test('should be different from Symbol.dispose', () => {
      expect(Symbol.asyncDispose).not.toBe(Symbol.dispose);
    });
  });

  describe('Basic async disposal', () => {
    test('should call asyncDispose method when resource is disposed', async () => {
      let disposed = false;
      
      const resource = {
        async [Symbol.asyncDispose]() {
          disposed = true;
        }
      };
      
      await resource[Symbol.asyncDispose]();
      
      expect(disposed).toBe(true);
    });

    test('should return a Promise', () => {
      const resource = {
        async [Symbol.asyncDispose]() {
          // Empty async disposal
        }
      };
      
      const result = resource[Symbol.asyncDispose]();
      
      expect(result).toBeInstanceOf(Promise);
      return result; // Wait for promise to resolve
    });

    test('should pass the resource as `this` context', async () => {
      let context;
      
      const resource = {
        id: 456,
        async [Symbol.asyncDispose]() {
          context = this;
        }
      };
      
      await resource[Symbol.asyncDispose]();
      
      expect(context).toBe(resource);
      expect(context.id).toBe(456);
    });
  });

  describe('Async operations', () => {
    test('should support async cleanup operations', async () => {
      let cleanupCompleted = false;
      
      const resource = {
        async [Symbol.asyncDispose]() {
          await new Promise(resolve => setTimeout(resolve, 10));
          cleanupCompleted = true;
        }
      };
      
      await resource[Symbol.asyncDispose]();
      
      expect(cleanupCompleted).toBe(true);
    });

    test('should handle async errors', async () => {
      const resource = {
        async [Symbol.asyncDispose]() {
          await new Promise(resolve => setTimeout(resolve, 10));
          throw new Error('Async disposal failed');
        }
      };
      
      await expect(resource[Symbol.asyncDispose]()).rejects.toThrow('Async disposal failed');
    });

    test('should work with Promise-returning dispose', async () => {
      let disposed = false;
      
      const resource = {
        [Symbol.asyncDispose]() {
          return new Promise(resolve => {
            setTimeout(() => {
              disposed = true;
              resolve();
            }, 10);
          });
        }
      };
      
      await resource[Symbol.asyncDispose]();
      
      expect(disposed).toBe(true);
    });
  });

  describe('Real-world async scenarios', () => {
    test('should work with database connections', async () => {
      class DatabaseConnection {
        constructor() {
          this.connected = true;
        }
        
        async query(sql) {
          if (!this.connected) {
            throw new Error('Not connected');
          }
          await new Promise(resolve => setTimeout(resolve, 5));
          return { rows: [] };
        }
        
        async [Symbol.asyncDispose]() {
          if (this.connected) {
            await new Promise(resolve => setTimeout(resolve, 5));
            this.connected = false;
          }
        }
      }
      
      const db = new DatabaseConnection();
      expect(db.connected).toBe(true);
      await db.query('SELECT * FROM users');
      
      await db[Symbol.asyncDispose]();
      expect(db.connected).toBe(false);
      await expect(db.query('SELECT * FROM users')).rejects.toThrow('Not connected');
    });

    test('should work with file streams', async () => {
      class FileStream {
        constructor(filename) {
          this.filename = filename;
          this.open = true;
        }
        
        async write(data) {
          if (!this.open) {
            throw new Error('Stream closed');
          }
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
        async [Symbol.asyncDispose]() {
          if (this.open) {
            await new Promise(resolve => setTimeout(resolve, 5)); // Flush buffers
            this.open = false;
          }
        }
      }
      
      const stream = new FileStream('output.txt');
      await stream.write('Hello, World!');
      
      await stream[Symbol.asyncDispose]();
      expect(stream.open).toBe(false);
      await expect(stream.write('More data')).rejects.toThrow('Stream closed');
    });

    test('should work with network connections', async () => {
      class NetworkConnection {
        constructor(url) {
          this.url = url;
          this.connected = true;
        }
        
        async send(data) {
          if (!this.connected) {
            throw new Error('Disconnected');
          }
          await new Promise(resolve => setTimeout(resolve, 5));
          return `Sent to ${this.url}: ${data}`;
        }
        
        async [Symbol.asyncDispose]() {
          if (this.connected) {
            // Simulate graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 10));
            this.connected = false;
          }
        }
      }
      
      const conn = new NetworkConnection('api.example.com');
      expect(await conn.send('data')).toBe('Sent to api.example.com: data');
      
      await conn[Symbol.asyncDispose]();
      expect(conn.connected).toBe(false);
      await expect(conn.send('more data')).rejects.toThrow('Disconnected');
    });
  });

  describe('Fallback to Symbol.dispose', () => {
    test('should prefer asyncDispose over dispose', async () => {
      const calls = [];
      
      const resource = {
        [Symbol.dispose]() {
          calls.push('dispose');
        },
        async [Symbol.asyncDispose]() {
          calls.push('asyncDispose');
        }
      };
      
      await resource[Symbol.asyncDispose]();
      
      expect(calls).toEqual(['asyncDispose']);
    });

    test('should work with resources that have only dispose', async () => {
      let disposed = false;
      
      const resource = {
        [Symbol.dispose]() {
          disposed = true;
        }
      };
      
      // In real implementation, await using would check for asyncDispose first,
      // then fall back to dispose. Here we test the dispose method directly.
      if (typeof resource[Symbol.asyncDispose] === 'function') {
        await resource[Symbol.asyncDispose]();
      } else if (typeof resource[Symbol.dispose] === 'function') {
        resource[Symbol.dispose]();
      }
      
      expect(disposed).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should propagate errors from async disposal', async () => {
      const resource = {
        async [Symbol.asyncDispose]() {
          throw new Error('Cleanup error');
        }
      };
      
      await expect(resource[Symbol.asyncDispose]()).rejects.toThrow('Cleanup error');
    });

    test('should handle Promise rejections', async () => {
      const resource = {
        [Symbol.asyncDispose]() {
          return Promise.reject(new Error('Rejection error'));
        }
      };
      
      await expect(resource[Symbol.asyncDispose]()).rejects.toThrow('Rejection error');
    });

    test('should support conditional async disposal', async () => {
      let disposed = false;
      
      const resource = {
        active: true,
        async [Symbol.asyncDispose]() {
          if (this.active) {
            await new Promise(resolve => setTimeout(resolve, 5));
            disposed = true;
            this.active = false;
          }
        }
      };
      
      await resource[Symbol.asyncDispose]();
      expect(disposed).toBe(true);
      expect(resource.active).toBe(false);
      
      disposed = false;
      await resource[Symbol.asyncDispose]();
      expect(disposed).toBe(false); // Already disposed
    });
  });

  describe('Edge cases', () => {
    test('should handle no-op async disposal', async () => {
      const resource = {
        async [Symbol.asyncDispose]() {
          // No-op
        }
      };
      
      await expect(resource[Symbol.asyncDispose]()).resolves.toBeUndefined();
    });

    test('should handle disposal that returns a value', async () => {
      const resource = {
        async [Symbol.asyncDispose]() {
          return 'cleanup result';
        }
      };
      
      const result = await resource[Symbol.asyncDispose]();
      expect(result).toBe('cleanup result');
    });

    test('should allow multiple async dispose calls', async () => {
      let count = 0;
      
      const resource = {
        async [Symbol.asyncDispose]() {
          await new Promise(resolve => setTimeout(resolve, 5));
          count++;
        }
      };
      
      await resource[Symbol.asyncDispose]();
      await resource[Symbol.asyncDispose]();
      
      expect(count).toBe(2);
    });
  });
});
