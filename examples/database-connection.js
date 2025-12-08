/**
 * Example: Database Connection Management
 * 
 * This example demonstrates how to use the 'using' and 'await using' declarations
 * for managing database connections and transactions.
 */

// Simulated database connection class
class DatabaseConnection {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.isConnected = false;
  }

  async connect() {
    console.log(`Connecting to database: ${this.connectionString}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async connection
    this.isConnected = true;
    console.log('Connected successfully');
  }

  query(sql) {
    if (!this.isConnected) {
      throw new Error('Not connected to database');
    }
    console.log(`Executing query: ${sql}`);
    return { rows: [], rowCount: 0 };
  }

  async [Symbol.asyncDispose]() {
    if (this.isConnected) {
      console.log('Closing database connection...');
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async cleanup
      this.isConnected = false;
      console.log('Connection closed');
    }
  }
}

// Simulated transaction class
class Transaction {
  constructor(connection) {
    this.connection = connection;
    this.isActive = true;
    this.succeeded = false;
    console.log('Transaction started');
  }

  execute(sql) {
    if (!this.isActive) {
      throw new Error('Transaction is not active');
    }
    return this.connection.query(sql);
  }

  commit() {
    this.succeeded = true;
    console.log('Transaction marked for commit');
  }

  async [Symbol.asyncDispose]() {
    if (this.isActive) {
      if (this.succeeded) {
        console.log('Committing transaction...');
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('Transaction committed');
      } else {
        console.log('Rolling back transaction...');
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('Transaction rolled back');
      }
      this.isActive = false;
    }
  }
}

// Example 1: Simple database query
async function simpleQuery() {
  console.log('\n=== Example 1: Simple Database Query ===');
  const conn = new DatabaseConnection('localhost:5432/mydb');
  await conn.connect();
  
  await using connection = conn;
  connection.query('SELECT * FROM users');
  // Connection is automatically closed when exiting this block
}

// Example 2: Transaction with automatic rollback on error
async function transactionWithError() {
  console.log('\n=== Example 2: Transaction with Error (Auto-Rollback) ===');
  const conn = new DatabaseConnection('localhost:5432/mydb');
  await conn.connect();
  
  try {
    await using connection = conn;
    await using tx = new Transaction(connection);
    
    tx.execute('INSERT INTO users VALUES (1, "John")');
    console.log('About to throw an error...');
    throw new Error('Something went wrong!');
    
    tx.commit(); // This line is never reached
  } catch (error) {
    console.log('Caught error:', error.message);
    // Transaction is automatically rolled back, then connection is closed
  }
}

// Example 3: Successful transaction
async function successfulTransaction() {
  console.log('\n=== Example 3: Successful Transaction ===');
  const conn = new DatabaseConnection('localhost:5432/mydb');
  await conn.connect();
  
  await using connection = conn;
  await using tx = new Transaction(connection);
  
  tx.execute('INSERT INTO users VALUES (1, "Jane")');
  tx.execute('INSERT INTO posts VALUES (1, "Hello World")');
  
  tx.commit(); // Mark transaction as successful
  // Transaction is committed, then connection is closed
}

// Run examples
async function runExamples() {
  if (typeof Symbol.asyncDispose !== 'undefined') {
    await simpleQuery();
    await transactionWithError();
    await successfulTransaction();
    console.log('\n=== All examples completed ===');
  } else {
    console.log('Note: Symbol.asyncDispose is not yet supported in this environment.');
    console.log('This is a demonstration of how the proposal would work.');
  }
}

// Execute if run directly
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = { DatabaseConnection, Transaction, runExamples };
