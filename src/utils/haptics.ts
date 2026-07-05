/**
 * Lightweight haptic feedback helper.
 *
 * Uses the standard Vibration API (`navigator.vibrate`), which is supported on
 * Android/Chrome-based browsers and installed PWAs. Note: Safari/iOS does not
 * implement the Vibration API (even in standalone/home-screen PWA mode), so on
 * iOS this is a silent no-op — there is currently no public web API that can
 * trigger the Taptic Engine outside of native apps.
 */

let supported: boolean | null = null;

function isSupported() {
  if (supported === null) {
    supported = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  }
  return supported;
}

/** Very short, subtle tick — used for each detent while scrolling a picker. */
export function hapticTick() {
  if (isSupported()) {
    try {
      navigator.vibrate(4);
    } catch {
      /* no-op */
    }
  }
}

/** Slightly stronger pulse — used when a value is confirmed/settled. */
export function hapticSelect() {
  if (isSupported()) {
    try {
      navigator.vibrate(10);
    } catch {
      /* no-op */
    }
  }
}

/** Firm pulse — used for primary confirm actions (e.g. tapping "Set"). */
export function hapticImpact() {
  if (isSupported()) {
    try {
      navigator.vibrate([12, 20, 12]);
    } catch {
      /* no-op */
    }
  }
}
