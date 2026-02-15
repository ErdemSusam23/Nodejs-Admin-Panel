module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'lib/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // 30 saniye (bcrypt için)
  forceExit: true,
  detectOpenHandles: true,
  maxWorkers: 1, // Testleri sırayla çalıştır (veritabanı çakışmasını önler)
  verbose: true
};