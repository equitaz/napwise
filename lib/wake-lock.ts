/**
 * Screen Wake Lock (brief, Parts 3 & 8.4). Prevents automatic screen-off, NOT
 * a manual lock — the timer copy sets that expectation. Fails silently where
 * unsupported (or over plain http, where the API doesn't exist).
 */

export type WakeLockHandle = {
  release(): void;
};

export function acquireWakeLock(): WakeLockHandle {
  let sentinel: WakeLockSentinel | null = null;
  let active = true;

  async function request(): Promise<void> {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }
    try {
      const acquired = await navigator.wakeLock.request("screen");
      if (!active) {
        // release() won the race while the request was in flight.
        acquired.release().catch(() => {});
        return;
      }
      sentinel = acquired;
      sentinel.addEventListener("release", () => {
        sentinel = null;
      });
    } catch {
      sentinel = null;
    }
  }

  // The lock is released by the OS whenever the tab is hidden; re-acquire it
  // when the tab becomes visible again.
  function onVisibilityChange(): void {
    if (document.visibilityState === "visible" && sentinel === null) {
      void request();
    }
  }

  document.addEventListener("visibilitychange", onVisibilityChange);
  void request();

  return {
    release() {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      sentinel?.release().catch(() => {});
      sentinel = null;
    },
  };
}
