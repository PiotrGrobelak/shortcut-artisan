import "@testing-library/jest-dom";
import { beforeAll, afterEach } from "vitest";

// Global vitest setup
beforeAll(() => {
  // Mock any global browser APIs that might not be available in the test environment
  // For example: window.matchMedia
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
});

// Clean up after tests
afterEach(() => {
  // Clean up any mocks or global state after each test
});
