module.exports = {
  testMatch: [
    '**/?(*.)+(spec|test).ts',
  ],

  rootDir: '.',

  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.controller.ts',
    '!src/**/dto/**',
    '!src/**/entities/**', 
    '!src/**/migrations/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
  ],

  testPathIgnorePatterns: ['/node_modules/'],
};
