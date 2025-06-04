import { getSimpleId, formatDate } from './helpers';

describe('getSimpleId', () => {
  it('should return a string', () => {
    expect(typeof getSimpleId()).toBe('string');
  });

  it('should return a non-empty string', () => {
    expect(getSimpleId().length).toBeGreaterThan(0);
  });

  it('should typically return a string of length 7', () => {
    // This can occasionally fail if Math.random() produces a very small number
    // but for most cases, it will be 7. Test it a few times.
    for (let i = 0; i < 10; i++) {
        expect(getSimpleId().length).toBe(7);
    }
  });

  it('should return different ids on subsequent calls', () => {
    const id1 = getSimpleId();
    const id2 = getSimpleId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatDate', () => {
  it('should format a date object into a readable string', () => {
    const date = new Date(2024, 0, 20); // January 20, 2024
    expect(formatDate(date)).toBe('January 20, 2024');
  });

  it('should format another date object correctly', () => {
    const date = new Date(2023, 11, 1); // December 1, 2023
    expect(formatDate(date)).toBe('December 1, 2023');
  });
});
