import { describe, test, expect } from 'vitest';

describe('Sample Test', () => {
  test('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have globals available', () => {
    expect(typeof describe).toBe('function');
    expect(typeof test).toBe('function');
  });
});
