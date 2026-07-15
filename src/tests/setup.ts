import '@testing-library/jest-dom';

// jsdom lacks canvas/layout; stub what ECharts touches so charts don't throw in tests
if (!('ResizeObserver' in globalThis)) {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
