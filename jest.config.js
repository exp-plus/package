'use strict';
module.exports = {
  bail: true,
  moduleFileExtensions: [
    'js',
  ],
  testEnvironment: 'node',
  testRegex: '(/*\\.(test|spec))\\.jsx?$',
  coverageDirectory: './docs/coverage',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  cacheDirectory: '.jest/cache',
};

