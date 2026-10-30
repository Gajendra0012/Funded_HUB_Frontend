import {describe,expect,it,vi} from "vitest";
import {manageWorldPlayback} from "../src/components/landing/world-playback";

class Video {
  paused=true;
  play=vi.fn(()=>{this.paused=false;return Promise.resolve();});
  pause=vi.fn(()=>{this.paused=true;});
}
class Visibility extends EventTarget {hidden=false;}
const video=(v:Video)=>v as unknown as HTMLVideoElement;

describe("cinematic world playback budget",()=>{
  it("plays only the selected video and stops both in the middle world",()=>{
    const hero=new Video(),end=new Video(),visibility=new Visibility();
    let stop=manageWorldPlayback(video(hero),video(end),"hero",false,visibility);
    expect(hero.paused).toBe(false);expect(end.paused).toBe(true);stop();
    stop=manageWorldPlayback(video(hero),video(end),"middle",false,visibility);
    expect(hero.paused).toBe(true);expect(end.paused).toBe(true);stop();
    stop=manageWorldPlayback(video(hero),video(end),"final",false,visibility);
    expect(hero.paused).toBe(true);expect(end.paused).toBe(false);stop();
    expect(end.paused).toBe(true);
  });
  it("honors pause, static preferences, hidden tabs, and listener cleanup",()=>{
    const hero=new Video(),end=new Video(),visibility=new Visibility();
    let stop=manageWorldPlayback(video(hero),video(end),"hero",true,visibility);
    expect(hero.play).not.toHaveBeenCalled();stop();
    stop=manageWorldPlayback(video(hero),video(end),"hero",false,visibility);
    visibility.hidden=true;visibility.dispatchEvent(new Event("visibilitychange"));
    expect(hero.paused).toBe(true);
    visibility.hidden=false;visibility.dispatchEvent(new Event("visibilitychange"));
    expect(hero.paused).toBe(false);stop();
    const calls=hero.play.mock.calls.length;
    visibility.dispatchEvent(new Event("visibilitychange"));
    expect(hero.play).toHaveBeenCalledTimes(calls);
  });
  it("handles blocked autoplay without an unhandled rejection",async()=>{
    const hero=new Video(),visibility=new Visibility();
    hero.play.mockRejectedValueOnce(new Error("blocked"));
    const stop=manageWorldPlayback(video(hero),null,"hero",false,visibility);
    await Promise.resolve();await Promise.resolve();stop();
    expect(hero.paused).toBe(true);
  });
});
