const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^components/(.*)$': '<rootDir>/components/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  testRegex: ".*\.(test|spec)\.[jt]sx?$",
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
};