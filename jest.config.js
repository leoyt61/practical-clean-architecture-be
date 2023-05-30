const { pathsToModuleNameMapper } = require('ts-jest');

const { compilerOptions } = require('./tsconfig');

module.exports = {
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/src/',
    }),
  },
  modulePaths: ['<rootDir>/src/'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
