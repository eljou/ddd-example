/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '(/__tests__/.*|.unit(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
  },
  bail: 1,
  verbose: true,
  collectCoverageFrom: ['**/*.{ts,tsx}', '!**/node_modules/**'],
  coverageDirectory: '../coverage',
}
