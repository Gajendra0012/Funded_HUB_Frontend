export const globeAssets = {
  video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4",
  poster: "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp",
} as const;

const fadeSeconds = 0.9;

// Start the incoming copy before fading, so blocked playback never hides the outgoing loop.
export function startGlobePlayback(first: HTMLVideoElement, second: HTMLVideoElement, visibility: Pick<Document, "hidden" | "addEventListener" | "removeEventListener"> = document) {
  let current = second.dataset.active === "true" ? second : first;
  let next = current === first ? second : first;
  let swapping = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  current.dataset.active = "true";
  next.dataset.active = "false";
  first.muted = second.muted = true;

  async function play(video: HTMLVideoElement) {
    try {
      await video.play();
      if (disposed) video.pause();
      return !disposed;
    }
    catch { return false; }
  }

  async function tick() {
    if (disposed || visibility.hidden || swapping || !Number.isFinite(current.duration) || current.duration <= 0 || current.duration - current.currentTime > fadeSeconds || next.readyState < 2) return;
    swapping = true;
    const outgoing = current;
    const incoming = next;
    incoming.currentTime = 0;
    if (!await play(incoming)) { swapping = false; return; }
    if (visibility.hidden) { incoming.pause(); swapping = false; return; }
    incoming.dataset.active = "true";
    outgoing.dataset.active = "false";
    current = incoming;
    next = outgoing;
    timer = setTimeout(() => {
      outgoing.pause();
      outgoing.currentTime = 0;
      swapping = false;
    }, fadeSeconds * 1000 + 100);
  }

  function onVisibility() {
    if (visibility.hidden) { first.pause(); second.pause(); }
    else void play(current);
  }

  first.addEventListener("timeupdate", tick);
  second.addEventListener("timeupdate", tick);
  visibility.addEventListener("visibilitychange", onVisibility);
  onVisibility();

  return () => {
    disposed = true;
    clearTimeout(timer);
    first.removeEventListener("timeupdate", tick);
    second.removeEventListener("timeupdate", tick);
    visibility.removeEventListener("visibilitychange", onVisibility);
    first.pause();
    second.pause();
  };
}
