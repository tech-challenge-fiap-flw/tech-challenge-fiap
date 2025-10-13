import type { Config } from 'jest';

const config: Config = {
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
};

export default config;
