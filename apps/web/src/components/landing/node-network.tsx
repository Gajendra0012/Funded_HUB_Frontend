"use client";

import { useEffect, useRef } from "react";
import s from "./cinematic.module.css";

export default function NodeNetwork({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current, context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || !active) return;
    let frame = 0, last = 0, width = 0, height = 0;
    const nodes = Array.from({length:42}, (_,i)=>({x:((i*137+37)%997)/997,y:((i*269+83)%991)/991,phase:i*.73}));
    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      width = innerWidth; height = innerHeight;
      canvas!.width = width*dpr; canvas!.height = height*dpr;
      context!.setTransform(dpr,0,0,dpr,0,0);
    }
    function draw(time: number) {
      if (document.hidden) { frame = 0; return; }
      frame = requestAnimationFrame(draw);
      if (time-last < 50) return;
      last = time;
      context!.clearRect(0,0,width,height);
      const points = nodes.map(n=>({x:n.x*width+Math.sin(time*.000045+n.phase)*18,y:n.y*height+Math.cos(time*.000035+n.phase)*14}));
      context!.lineWidth = .6;
      for (let i=0;i<points.length;i++) {
        for (let j=i+1;j<points.length;j++) {
          const a=points[i],b=points[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
          if(distance<150){context!.strokeStyle=`rgba(157,195,230,${.1*(1-distance/150)})`;context!.beginPath();context!.moveTo(a.x,a.y);context!.lineTo(b.x,b.y);context!.stroke();}
        }
        context!.fillStyle=i%5===0?"rgba(255,255,255,.45)":"rgba(157,195,230,.3)";
        context!.beginPath();context!.arc(points[i].x,points[i].y,i%5===0?1.1:.7,0,Math.PI*2);context!.fill();
      }
    }
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!frame)frame=requestAnimationFrame(draw);}
    resize(); visibility();
    window.addEventListener("resize",resize); document.addEventListener("visibilitychange",visibility);
    return ()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);document.removeEventListener("visibilitychange",visibility);context.clearRect(0,0,width,height);};
  },[active]);
  return <canvas ref={ref} className={s.network} aria-hidden="true" />;
}
