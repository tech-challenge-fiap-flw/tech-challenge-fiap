const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],

  testMatch: ['**/*.spec.ts'],

  moduleFileExtensions: ['ts', 'js', 'json'],

  collectCoverageFrom: [
    'src/modules/**/*.{ts,js}',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*mocks.ts',
  ],

  coverageDirectory: 'coverage',
  setupFiles: ['<rootDir>/.jest/setup-env.ts'],
};

export default config;
