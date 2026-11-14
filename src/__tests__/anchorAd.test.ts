import { describe, expect, it } from 'vitest';
import { anchorInsets } from '../lib/anchorAd';

const W = 1280;
const H = 720;

function box(top: number, height: number, left = 0, width = W) {
  return { top, bottom: top + height, left, right: left + width, width, height };
}

describe('anchorInsets', () => {
  it('reserves the full height of an expanded bottom anchor', () => {
    expect(anchorInsets([box(620, 100), box(625, 24, 600, 60)], W, H)).toEqual({ top: 0, bottom: 100 });
  });

  it('reserves only the tab of a collapsed bottom anchor', () => {
    // Ad slid below the fold, tab still peeking out above it.
    expect(anchorInsets([box(H + 2, 100), box(H - 26, 24, 600, 60)], W, H)).toEqual({ top: 0, bottom: 26 });
  });

  it('reserves nothing once the anchor is gone or empty', () => {
    expect(anchorInsets([], W, H)).toEqual({ top: 0, bottom: 0 });
    expect(anchorInsets([box(0, 0, 0, 0)], W, H)).toEqual({ top: 0, bottom: 0 });
    expect(anchorInsets([box(H, 100)], W, H)).toEqual({ top: 0, bottom: 0 });
  });

  it('handles a top anchor', () => {
    expect(anchorInsets([box(0, 60)], W, H)).toEqual({ top: 60, bottom: 0 });
  });

  it('rounds partial pixels up so nothing is overlapped', () => {
    expect(anchorInsets([box(H - 25.4, 30)], W, H)).toEqual({ top: 0, bottom: 26 });
  });
});
