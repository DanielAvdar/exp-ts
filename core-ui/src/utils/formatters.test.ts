import { describe, it, expect } from 'vitest';
import { capitalize } from './formatters';

describe('capitalize utility', () => {
  it('should capitalize the first letter of a lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should return an empty string if an empty string is provided', () => {
    expect(capitalize('')).toBe('');
  });

  it('should not change a string that is already capitalized', () => {
    expect(capitalize('World')).toBe('World');
  });

  it('should capitalize the first letter of a mixed-case string', () => {
    expect(capitalize('hELLo')).toBe('HELLo');
  });

  it('should handle single character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('B')).toBe('B');
  });
});
