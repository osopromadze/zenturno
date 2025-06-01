/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node',
  testMatch: ["**/test/**/*.test.ts"],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
