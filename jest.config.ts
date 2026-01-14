import type { Config } from "jest";

const jestConfig: Config = {
  clearMocks: true,
  maxWorkers: 1,
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  setupFiles: ["dotenv/config"],
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!@meshsdk/.*)"],
  passWithNoTests: true,
};

export default jestConfig;
