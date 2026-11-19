import { theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ignoreAnchorAdPadding } from '../lib/anchorAd';
import { isNative } from '../lib/native';
import { SupportLinks } from './SupportLinks';

const AD_CLIENT = 'ca-pub-4263195580051724';
const AD_SLOT = '9553900295';
const AD_SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * Standard fixed banner sizes, widest first.
 *
 * We request one of these explicitly instead of using a responsive unit
 * (`data-ad-format="horizontal"`). A responsive <ins> derives its own height
 * from the available width and writes it as an inline style after mount, which
 * beats anything React put in the style prop -- in a footer that spans the
 * window it happily picks a few hundred pixels and eats into the map. With
 * explicit width/height and no data-ad-format, AdSense serves the size we
 * asked for.
 */
const BANNER_SIZES = [
  { minWidth: 970, width: 970, height: 90 },
  { minWidth: 728, width: 728, height: 90 },
  { minWidth: 468, width: 468, height: 60 },
  { minWidth: 0, width: 320, height: 50 },
];

// Tallest banner above, reserved up front so the footer doesn't resize once the
// available width has been measured. Doubles as a hard cap on the container.
const MAX_AD_HEIGHT = 90;

/**
 * Loading a world is a user action that replaces the page's content, so it
 * gets a fresh ad, like navigating to a new page would. This is the *only*
 * thing that requests a new ad -- AdSense forbids refreshing ads on a timer.
 * The floor keeps rapid reloads of the same world from spamming ad requests.
 */
const MIN_AD_REQUEST_INTERVAL_MS = 30_000;

/**
 * How long to wait for AdSense to fill the slot before showing the support
 * links instead. Covers ad blockers that hide the slot or stub out the script
 * without failing the script request. If the ad fills after all, it replaces
 * the support links.
 */
const FILL_TIMEOUT_MS = 8_000;

let adScript: Promise<void> | undefined;

/** Injects the AdSense script once; rejects if it's blocked. */
function loadAdScript(): Promise<void> {
  adScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = AD_SCRIPT_SRC;
    script.onload = () => { resolve(); };
    script.onerror = () => { reject(new Error('AdSense script failed to load')); };
    document.head.appendChild(script);
  });
  return adScript;
}

interface FooterAdProps {
  /** Changes whenever a world finishes loading; each change may request a new ad. */
  contentKey: number;
}

/**
 * The footer banner. When no ad is shown -- the slot went unfilled, or an ad
 * blocker stopped it -- the space shows TerraMap's support links instead of
 * sitting blank. Hiding unfilled slots is what AdSense recommends
 * (`data-ad-status="unfilled"`), and we fill the space with our own content.
 *
 * The ad is web-only -- the native (Tauri) build renders nothing here and
 * never fetches the remote script, so the desktop app stays offline-capable
 * and doesn't ship ads it isn't allowed to serve. The script is injected here
 * rather than from index.html for the same reason: index.html is shared by
 * both builds.
 *
 * Nothing here uses "ad"-looking class names or ids, so blockers' cosmetic
 * filters leave the support links alone.
 */
export function FooterAd({ contentKey }: FooterAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const adRef = useRef<HTMLModElement>(null);
  const [size, setSize] = useState<typeof BANNER_SIZES[number] | null>(null);
  // Bumped to remount the <ins>: AdSense fills an <ins> only once, so a new ad
  // needs a new element.
  const [adSerial, setAdSerial] = useState(0);
  const pushedSerial = useRef(-1);
  const lastRequestAt = useRef(0);
  const [showSupport, setShowSupport] = useState(false);

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  // Pick the banner from the width actually available, before requesting an ad
  // -- AdSense reads the <ins> element's rendered box at push time.
  useEffect(() => {
    if (isNative() || !containerRef.current) {
      return;
    }
    const available = containerRef.current.clientWidth;
    setSize(BANNER_SIZES.find((candidate) => available >= candidate.minWidth) ?? BANNER_SIZES[BANNER_SIZES.length - 1]);
  }, []);

  // A newly loaded world is new content: request a new ad for it.
  useEffect(() => {
    if (contentKey === 0 || Date.now() - lastRequestAt.current < MIN_AD_REQUEST_INTERVAL_MS) {
      return;
    }
    setAdSerial((serial) => serial + 1);
  }, [contentKey]);

  useEffect(() => {
    // The isNative() check is redundant with adRef being null natively, but
    // stated explicitly so the "no ads in the desktop app" guarantee doesn't
    // rest on how the JSX below happens to be structured.
    const ins = adRef.current;
    if (isNative() || !size || !ins) {
      return;
    }

    // Until a fill/unfill signal arrives, keep showing whatever was showing for
    // the previous ad, so a blocked viewer doesn't see the support links blink
    // off and on with every world load.
    let settled = false;
    const settle = (support: boolean) => {
      settled = true;
      setShowSupport(support);
    };
    const checkStatus = () => {
      const status = ins.getAttribute('data-ad-status');
      if (status === 'filled') settle(false);
      else if (status === 'unfilled') settle(true);
    };

    const observer = new MutationObserver(checkStatus);
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    checkStatus();

    loadAdScript().catch(() => { settle(true); });
    const timer = setTimeout(() => {
      if (!settled) setShowSupport(true);
    }, FILL_TIMEOUT_MS);

    if (pushedSerial.current !== adSerial) {
      pushedSerial.current = adSerial;
      lastRequestAt.current = Date.now();
      try {
        // Queued on the global array; the script drains it whenever it loads,
        // so pushing before the script arrives is fine.
        ((window as unknown as Record<string, unknown[]>).adsbygoogle = (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
      } catch {
        settle(true);
      }
    }

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [size, adSerial]);

  // Auto ads may add an anchor ad; let it overlay the page rather than reserve
  // space for it (see anchorAd.ts).
  useEffect(() => {
    if (isNative()) {
      return;
    }
    return ignoreAnchorAdPadding();
  }, []);

  if (isNative()) {
    return null;
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', height: MAX_AD_HEIGHT, overflow: 'hidden' }}>
      {size && (
        <ins
          key={adSerial}
          ref={adRef}
          className="adsbygoogle"
          // Explicit width/height and no data-ad-format: this is what makes
          // the unit fixed-size rather than responsive.
          style={{ display: 'inline-block', width: size.width, height: size.height }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
        />
      )}
      {showSupport && (
        // Covers the empty slot rather than replacing it, so the <ins> keeps
        // its size for the next ad request.
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', background: colorBgLayout }}>
          <SupportLinks size="small" />
        </div>
      )}
    </div>
  );
}
