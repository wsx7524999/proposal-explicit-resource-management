module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  // Setup file to add polyfills if needed
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
