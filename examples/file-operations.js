/**
 * Example: File Operations with Explicit Resource Management
 * 
 * This example demonstrates how to use the 'using' declaration for 
 * automatic resource cleanup when working with file handles.
 */

// Simulated file handle class that implements Symbol.dispose
class FileHandle {
  constructor(filename, mode) {
    this.filename = filename;
    this.mode = mode;
    this.isOpen = true;
    console.log(`Opening file: ${filename} in ${mode} mode`);
  }

  read() {
    if (!this.isOpen) {
      throw new Error('Cannot read from closed file');
    }
    console.log(`Reading from ${this.filename}`);
    return `Content of ${this.filename}`;
  }

  write(data) {
    if (!this.isOpen) {
      throw new Error('Cannot write to closed file');
    }
    console.log(`Writing to ${this.filename}: ${data}`);
  }

  [Symbol.dispose]() {
    if (this.isOpen) {
      console.log(`Closing file: ${this.filename}`);
      this.isOpen = false;
    }
  }
}

// Example 1: Simple file reading
function readFile() {
  console.log('\n=== Example 1: Simple File Reading ===');
  using file = new FileHandle('example.txt', 'read');
  const content = file.read();
  console.log('File content:', content);
  // file is automatically closed when exiting this block
}

// Example 2: Multiple resources
function copyFile() {
  console.log('\n=== Example 2: Multiple Resources ===');
  using source = new FileHandle('source.txt', 'read');
  using dest = new FileHandle('dest.txt', 'write');
  
  const content = source.read();
  dest.write(content);
  // Both files are automatically closed in reverse order (dest, then source)
}

// Example 3: Exception handling
function fileWithError() {
  console.log('\n=== Example 3: Exception Handling ===');
  try {
    using file = new FileHandle('error.txt', 'read');
    console.log('About to throw an error...');
    throw new Error('Something went wrong!');
  } catch (error) {
    console.log('Caught error:', error.message);
    // file is still properly disposed even when an exception occurs
  }
}

// Run examples
if (typeof Symbol.dispose !== 'undefined') {
  readFile();
  copyFile();
  fileWithError();
  console.log('\n=== All examples completed ===');
} else {
  console.log('Note: Symbol.dispose is not yet supported in this environment.');
  console.log('This is a demonstration of how the proposal would work.');
}
