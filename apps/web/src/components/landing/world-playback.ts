type Zone = "hero" | "middle" | "final";

// Pause every instance before starting the selected one; never crossfade playing videos.
export function manageWorldPlayback(first: HTMLVideoElement | null, final: HTMLVideoElement | null, zone: Zone, disabled: boolean, visibility: Pick<Document,"hidden"|"addEventListener"|"removeEventListener"> = document) {
  let disposed=false;
  function sync() {
    first?.pause(); final?.pause();
    if(disabled||visibility.hidden||disposed)return;
    const current=zone==="hero"?first:zone==="final"?final:null;
    if(current)void current.play().then(()=>{if(disposed||visibility.hidden)current.pause();}).catch(()=>{});
  }
  sync();
  visibility.addEventListener("visibilitychange",sync);
  return ()=>{disposed=true;visibility.removeEventListener("visibilitychange",sync);first?.pause();final?.pause();};
}
