"use client";

import { useSyncExternalStore } from "react";
import { useMotionPreference } from "./use-motion-preference";

type Connection = EventTarget & { saveData?: boolean };
function connection() {
  return (navigator as Navigator & { connection?: Connection }).connection;
}
function subscribe(change: () => void) {
  const network = connection();
  network?.addEventListener("change", change);
  return () => network?.removeEventListener("change", change);
}
export function useStaticHero() {
  const reduced = useMotionPreference();
  const saveData = useSyncExternalStore(subscribe, () => Boolean(connection()?.saveData), () => false);
  return reduced || saveData;
}
