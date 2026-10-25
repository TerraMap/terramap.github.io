import { describe, expect, it } from 'vitest';
import { deviceAlignedSize } from '../lib/deviceAlignedSize';

describe('deviceAlignedSize', () => {
  it('rounds a fractional device-pixel size at 120% zoom to whole device pixels', () => {
    // 1752 CSS px * 1.2 = 2102.4 device px, which Chrome would snap and the zoom would magnify
    const { width, height } = deviceAlignedSize(1752, 1800 / 6400, 1.2);
    expect(width * 1.2).toBeCloseTo(2102, 9);
    expect(height * 1.2).toBeCloseTo(591, 9);
    expect(width).toBeLessThanOrEqual(1752);
  });

  it('leaves whole sizes unchanged at 100% zoom', () => {
    expect(deviceAlignedSize(1600, 0.5, 1)).toEqual({ width: 1600, height: 800 });
  });

  it('falls back to a ratio of 1 for invalid devicePixelRatio values', () => {
    expect(deviceAlignedSize(1000, 0.25, 0)).toEqual({ width: 1000, height: 250 });
  });
});
