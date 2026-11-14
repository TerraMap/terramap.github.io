/**
 * Stops AdSense's anchor ad from reserving space on the page.
 *
 * When Auto ads shows an anchor (the banner pinned to the edge of the
 * viewport), AdSense writes an inline `padding-bottom: <ad height> !important`
 * (or `padding-top`, for a top anchor) onto <body> so the page isn't hidden
 * underneath it. The body is a fixed 100dvh border-box, so that padding shrinks
 * the app -- and AdSense leaves it behind when the viewer collapses the anchor,
 * leaving a blank band where the ad was.
 *
 * We'd rather the anchor just overlay the page: it mostly sits over our own
 * footer banner, and the viewer can collapse it if it covers anything else. So
 * keep stripping that padding whenever AdSense adds it.
 */

const PADDING_PROPERTIES = ['padding-top', 'padding-bottom'];

/** Returns a function that stops stripping the padding. */
export function ignoreAnchorAdPadding(): () => void {
  const elements = [document.body, document.documentElement];

  const strip = () => {
    for (const el of elements) {
      for (const property of PADDING_PROPERTIES) {
        // Removing only when present keeps us from re-triggering ourselves.
        if (el.style.getPropertyValue(property)) {
          el.style.removeProperty(property);
        }
      }
    }
  };

  const observer = new MutationObserver(strip);
  for (const el of elements) {
    observer.observe(el, { attributes: true, attributeFilter: ['style'] });
  }
  strip();

  return () => observer.disconnect();
}
