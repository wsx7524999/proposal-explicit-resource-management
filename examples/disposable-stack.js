/**
 * Example: DisposableStack for Resource Management
 * 
 * This example demonstrates how to use DisposableStack to manage
 * multiple resources and custom cleanup operations.
 */

// Simulated resource classes
class Logger {
  constructor(name) {
    this.name = name;
    console.log(`[${this.name}] Logger initialized`);
  }

  log(message) {
    console.log(`[${this.name}] ${message}`);
  }

  [Symbol.dispose]() {
    console.log(`[${this.name}] Logger disposed`);
  }
}

class NetworkConnection {
  constructor(url) {
    this.url = url;
    this.connected = true;
    console.log(`Connected to ${url}`);
  }

  send(data) {
    if (!this.connected) {
      throw new Error('Connection closed');
    }
    console.log(`Sending data to ${this.url}:`, data);
  }

  [Symbol.dispose]() {
    if (this.connected) {
      console.log(`Disconnecting from ${this.url}`);
      this.connected = false;
    }
  }
}

// Example 1: Basic DisposableStack usage
function basicStackUsage() {
  console.log('\n=== Example 1: Basic DisposableStack Usage ===');
  
  using stack = new DisposableStack();
  
  const logger = stack.use(new Logger('App'));
  const connection = stack.use(new NetworkConnection('api.example.com'));
  
  logger.log('Starting operation');
  connection.send({ action: 'getData' });
  logger.log('Operation completed');
  
  // All resources are disposed in reverse order when stack is disposed
}

// Example 2: Custom cleanup with defer
function customCleanup() {
  console.log('\n=== Example 2: Custom Cleanup with defer() ===');
  
  using stack = new DisposableStack();
  
  console.log('Entering privileged section');
  stack.defer(() => console.log('Exiting privileged section'));
  
  const logger = stack.use(new Logger('Audit'));
  logger.log('Performing privileged operation');
  
  stack.defer(() => console.log('Cleanup custom state'));
  
  // All deferred callbacks and resources are disposed in LIFO order
}

// Example 3: Adopting non-disposable resources
function adoptResources() {
  console.log('\n=== Example 3: Adopting Non-Disposable Resources ===');
  
  using stack = new DisposableStack();
  
  // Simulate a timer that needs cleanup
  const timerId = setTimeout(() => {
    console.log('Timer fired');
  }, 1000);
  
  // Adopt the timer and provide cleanup logic
  stack.adopt(timerId, (id) => {
    console.log('Clearing timer:', id);
    clearTimeout(id);
  });
  
  // Simulate an event listener
  const listeners = new Set();
  const addEventListener = (event, handler) => {
    console.log(`Added listener for: ${event}`);
    listeners.add({ event, handler });
  };
  
  addEventListener('click', () => {});
  
  stack.defer(() => {
    console.log('Removing all event listeners');
    listeners.clear();
  });
  
  // Timer is cleared and listeners are removed when stack is disposed
}

// Example 4: Error handling with multiple resources
function errorHandling() {
  console.log('\n=== Example 4: Error Handling ===');
  
  try {
    using stack = new DisposableStack();
    
    const logger = stack.use(new Logger('Error'));
    const connection = stack.use(new NetworkConnection('api.example.com'));
    
    logger.log('About to throw error');
    throw new Error('Simulated error');
    
  } catch (error) {
    console.log('Caught error:', error.message);
    // Resources are still properly disposed even when error occurs
  }
}

// Example 5: Moving resources between stacks
function movingResources() {
  console.log('\n=== Example 5: Moving Resources Between Stacks ===');
  
  let movedStack;
  
  {
    using stack = new DisposableStack();
    const logger = stack.use(new Logger('Movable'));
    
    logger.log('Resource added to original stack');
    
    // Move all resources to a new stack
    movedStack = stack.move();
    console.log('Resources moved to new stack');
    
    // Original stack is now empty and won't dispose anything
  }
  
  console.log('Original stack scope ended');
  console.log('Manually disposing moved stack');
  movedStack[Symbol.dispose]();
}

// Run examples
if (typeof DisposableStack !== 'undefined' && typeof Symbol.dispose !== 'undefined') {
  basicStackUsage();
  customCleanup();
  adoptResources();
  errorHandling();
  movingResources();
  console.log('\n=== All examples completed ===');
} else {
  console.log('Note: DisposableStack and Symbol.dispose are not yet supported in this environment.');
  console.log('This is a demonstration of how the proposal would work.');
}
