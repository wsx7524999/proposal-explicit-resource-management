module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'tests/**/*.js',
    '!tests/**/*.test.js',
    '!tests/**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  // Setup file to add polyfills if needed
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
