"use client";

import { useEffect, useSyncExternalStore } from "react";

const TICK_MS = 15_000;

function subscribe(onTick: () => void) {
  const id = setInterval(onTick, TICK_MS);
  return () => clearInterval(id);
}

/** The current time, rounded to 15 seconds. Null during server rendering, so server and browser HTML match. */
function useClock(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK_MS) * TICK_MS,
    () => null,
  );
}

/** 42_120_000 ms → "11:42" (hours:minutes). */
export function formatRemaining(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

/**
 * "Session expires in 11:42" in the top bar (ADM-15). Counts down to the end of the 12-hour
 * admin session and calls `onExpired` once when it runs out.
 */
export function SessionCountdown({ expiresAt, onExpired }: { expiresAt: number; onExpired: () => void }) {
  const now = useClock();
  const remaining = now === null ? null : expiresAt - now;
  const expired = remaining !== null && remaining <= 0;

  useEffect(() => {
    if (expired) onExpired();
  }, [expired, onExpired]);

  return (
    <span className="session-indicator" data-testid="session-timer">
      Session expires in <code>{remaining === null ? "–" : formatRemaining(remaining)}</code>
    </span>
  );
}
