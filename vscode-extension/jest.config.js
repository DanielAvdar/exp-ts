/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  moduleNameMapper: {
    // If you have path aliases in tsconfig.json, you might need to map them here
    // For example: '^@src/(.*)$': '<rootDir>/src/$1'
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts", // Exclude type definition files
    "!src/extension.ts", // Often exclude main extension activation due to vscode import complexity
    "!src/sal/**", // Exclude SAL interfaces if they are just type definitions
    // Add other files/patterns to exclude if necessary
  ],
  // Setup files after env is setup but before test files are run
  // setupFilesAfterEnv: ['./jest.setup.js'], // if you need setup files
  globals: {
    // 'ts-jest': {
    //   tsconfig: 'tsconfig.json' // specify tsconfig if not default name/location
    // }
  }
};
