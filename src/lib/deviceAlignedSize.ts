/**
 * Display size for the map canvases that is a whole number of device pixels.
 *
 * Chrome snaps a canvas to whole device pixels before the pan/zoom transform
 * scales it up, so a fractional device-pixel size (e.g. 1752 CSS px at 120%
 * browser zoom = 2102.4 device px) gets magnified by the zoom into an offset of
 * most of a tile, and clicks land on the tile next to the one drawn.
 */
export function deviceAlignedSize(availableWidth: number, aspectRatio: number, devicePixelRatio: number) {
  const dpr = devicePixelRatio > 0 ? devicePixelRatio : 1;
  const width = Math.floor(availableWidth * dpr) / dpr;
  const height = Math.round(width * aspectRatio * dpr) / dpr;
  return { width, height };
}
