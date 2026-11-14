/**
 * Keeps the page's padding in step with AdSense's anchor ad.
 *
 * When Auto ads shows an anchor (the banner pinned to the bottom -- or, on some
 * mobile layouts, the top -- of the viewport), AdSense writes an inline
 * `padding-bottom: <ad height> !important` onto <body> so the page isn't
 * hidden underneath it. The body is a fixed 100dvh border-box, so that padding
 * shrinks the app. But when the viewer collapses the anchor down to its little
 * tab, AdSense leaves the padding behind, leaving a blank band where the ad
 * was. Here we measure what the anchor actually covers and set the padding to
 * that instead.
 */

const ANCHOR_SELECTOR = 'ins.adsbygoogle[data-anchor-status]';

// The collapse/expand animation is a CSS transition that may not report back
// to us; measure again once it has surely finished.
const SETTLE_DELAY_MS = 600;

export interface Insets {
  top: number;
  bottom: number;
}

interface Box {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

/**
 * How far the given boxes (an anchor ad and its parts) reach into the top and
 * bottom of the viewport. Boxes that are off screen or empty -- a collapsed
 * ad slid below the fold, a dismissed one -- don't count.
 */
export function anchorInsets(boxes: Iterable<Box>, viewportWidth: number, viewportHeight: number): Insets {
  let top = 0;
  let bottom = 0;
  for (const box of boxes) {
    const visible = box.width > 0 && box.height > 0
      && box.bottom > 0 && box.top < viewportHeight
      && box.right > 0 && box.left < viewportWidth;
    if (!visible) {
      continue;
    }
    // Anchors hug an edge; whichever edge the box is nearer is the one it covers.
    if (box.top + box.bottom > viewportHeight) {
      bottom = Math.max(bottom, viewportHeight - box.top);
    } else {
      top = Math.max(top, box.bottom);
    }
  }
  return { top: Math.ceil(top), bottom: Math.ceil(bottom) };
}

function anchorBoxes(): Box[] {
  const boxes: Box[] = [];
  document.querySelectorAll<HTMLElement>(ANCHOR_SELECTOR).forEach((anchor) => {
    if (anchor.dataset.anchorStatus === 'dismissed') {
      return;
    }
    // Include the parts too: the collapse tab can sit outside the <ins>'s own box.
    for (const el of [anchor, ...anchor.querySelectorAll<HTMLElement>('*')]) {
      if (getComputedStyle(el).visibility !== 'hidden') {
        boxes.push(el.getBoundingClientRect());
      }
    }
  });
  return boxes;
}

/**
 * Starts tracking the anchor ad. Returns a function that stops tracking and
 * hands the padding back to AdSense.
 */
export function fitPageToAnchorAd(): () => void {
  const html = document.documentElement;
  const body = document.body;
  let anchor: Element | null = null;
  let frame = 0;
  let settleTimer = 0;

  const apply = () => {
    frame = 0;
    const insets = anchor ? anchorInsets(anchorBoxes(), window.innerWidth, window.innerHeight) : { top: 0, bottom: 0 };
    // Only write on a change: writing triggers our own style observer.
    const set = (el: HTMLElement, property: string, value: string) => {
      if (el.style.getPropertyValue(property) !== value || el.style.getPropertyPriority(property) !== 'important') {
        el.style.setProperty(property, value, 'important');
      }
    };
    set(body, 'padding-top', `${insets.top}px`);
    set(body, 'padding-bottom', `${insets.bottom}px`);
    // Should AdSense pad <html> instead, it would push the body off screen.
    set(html, 'padding-top', '0px');
    set(html, 'padding-bottom', '0px');
  };

  const schedule = () => {
    if (!frame) {
      frame = requestAnimationFrame(apply);
    }
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(apply, SETTLE_DELAY_MS);
  };

  // Changes to the anchor itself: shown, collapsed, expanded, dismissed.
  const anchorObserver = new MutationObserver(schedule);

  const findAnchor = () => {
    const found = document.querySelector(ANCHOR_SELECTOR);
    if (found !== anchor) {
      anchorObserver.disconnect();
      anchor?.removeEventListener('transitionend', schedule);
      anchor = found;
      if (anchor) {
        anchorObserver.observe(anchor, { attributes: true, subtree: true, childList: true });
        anchor.addEventListener('transitionend', schedule);
      }
    }
    schedule();
  };

  // The anchor is appended to <body> whenever AdSense gets round to it, and its
  // padding lands on <body>/<html>'s style -- watch for both.
  const pageObserver = new MutationObserver(findAnchor);
  pageObserver.observe(body, { childList: true });
  pageObserver.observe(body, { attributes: true, attributeFilter: ['style'] });
  pageObserver.observe(html, { attributes: true, attributeFilter: ['style'] });
  window.addEventListener('resize', schedule);
  findAnchor();

  return () => {
    pageObserver.disconnect();
    anchorObserver.disconnect();
    anchor?.removeEventListener('transitionend', schedule);
    window.removeEventListener('resize', schedule);
    cancelAnimationFrame(frame);
    clearTimeout(settleTimer);
    for (const el of [body, html]) {
      el.style.removeProperty('padding-top');
      el.style.removeProperty('padding-bottom');
    }
  };
}
