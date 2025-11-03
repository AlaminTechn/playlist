import { describe, it, expect } from '@jest/globals';
import { calculatePosition, getEndPosition } from './position.js';

describe('Position Calculation', () => {
  describe('calculatePosition', () => {
    it('should calculate middle position between two tracks', () => {
      const result = calculatePosition(1.0, 2.0);
      expect(result).toBe(1.5);
    });

    it('should handle first position (no previous, no next)', () => {
      const result = calculatePosition(null, null);
      expect(result).toBe(1.0);
    });

    it('should handle insert at beginning (no previous)', () => {
      const result = calculatePosition(null, 1.0);
      expect(result).toBe(0);
    });

    it('should handle insert at end (no next)', () => {
      const result = calculatePosition(1.0, null);
      expect(result).toBe(2.0);
    });

    it('should calculate precise midpoint for nested inserts', () => {
      const result = calculatePosition(1.0, 1.5);
      expect(result).toBe(1.25);
    });

    it('should handle decimal positions correctly', () => {
      const result = calculatePosition(1.25, 1.5);
      expect(result).toBe(1.375);
    });

    it('should handle large position differences', () => {
      const result = calculatePosition(100.0, 200.0);
      expect(result).toBe(150.0);
    });
  });

  describe('getEndPosition', () => {
    it('should return 1.0 for empty playlist', () => {
      const result = getEndPosition(0);
      expect(result).toBe(1.0);
    });

    it('should return next position after max', () => {
      const result = getEndPosition(5.5);
      expect(result).toBe(6.5);
    });

    it('should handle null/undefined as 0', () => {
      const result = getEndPosition(null);
      expect(result).toBe(1.0);
    });
  });
});

