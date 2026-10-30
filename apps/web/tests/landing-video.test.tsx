import { afterEach, describe, expect, it, vi } from "vitest";
import { startGlobePlayback } from "../src/components/landing/video-playback";

class Video extends EventTarget {
  dataset: Record<string, string> = {};
  duration = 10.04;
  currentTime = 0;
  readyState = 4;
  muted = false;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
}
class Visibility extends EventTarget { hidden = false; }
const asVideo = (video: Video) => video as unknown as HTMLVideoElement;
async function nearEnd(video: Video) {
  video.currentTime = 9.2;
  video.dispatchEvent(new Event("timeupdate"));
  await Promise.resolve();
  await Promise.resolve();
}
afterEach(() => vi.useRealTimers());

describe("globe video playback", () => {
  it("crossfades both directions, resets the outgoing clip, and removes listeners on cleanup", async () => {
    vi.useFakeTimers();
    const first = new Video(), second = new Video(), visibility = new Visibility();
    const stop = startGlobePlayback(asVideo(first), asVideo(second), visibility);
    expect(first.play).toHaveBeenCalledOnce();
    await nearEnd(first);
    expect(second.play).toHaveBeenCalledOnce();
    expect(second.dataset.active).toBe("true");
    expect(first.dataset.active).toBe("false");
    vi.advanceTimersByTime(1000);
    expect(first.pause).toHaveBeenCalledOnce();
    expect(first.currentTime).toBe(0);
    await nearEnd(second);
    expect(first.dataset.active).toBe("true");
    stop();
    const count = second.play.mock.calls.length;
    await nearEnd(first);
    expect(second.play).toHaveBeenCalledTimes(count);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the outgoing loop when the other copy is unbuffered or playback is rejected", async () => {
    const first = new Video(), second = new Video(), visibility = new Visibility();
    second.readyState = 1;
    const stop = startGlobePlayback(asVideo(first), asVideo(second), visibility);
    await nearEnd(first);
    expect(second.play).not.toHaveBeenCalled();
    second.readyState = 4;
    second.play.mockRejectedValueOnce(new Error("Autoplay blocked"));
    await nearEnd(first);
    expect(first.dataset.active).toBe("true");
    expect(second.dataset.active).toBe("false");
    stop();
  });

  it("pauses hidden tabs and resumes the active copy after a user pause", async () => {
    vi.useFakeTimers();
    const first = new Video(), second = new Video(), visibility = new Visibility();
    const stop = startGlobePlayback(asVideo(first), asVideo(second), visibility);
    await nearEnd(first);
    vi.advanceTimersByTime(1000);
    visibility.hidden = true;
    visibility.dispatchEvent(new Event("visibilitychange"));
    expect(second.pause).toHaveBeenCalled();
    visibility.hidden = false;
    visibility.dispatchEvent(new Event("visibilitychange"));
    expect(second.play).toHaveBeenCalledTimes(2);
    stop();
    const resume = startGlobePlayback(asVideo(first), asVideo(second), visibility);
    expect(second.dataset.active).toBe("true");
    expect(second.play).toHaveBeenCalledTimes(3);
    resume();
  });
});
