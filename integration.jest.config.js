/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const baseJestConfig = require('./jest.config')
module.exports = {
  ...baseJestConfig,
  testRegex: '(/__tests__/.*|.integration(\\.|/)(test|spec))\\.[jt]sx?$',
}
