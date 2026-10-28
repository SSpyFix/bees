import type { Bee, Game } from './types';
import { surface } from '../world/terrain';

/** Each bee flies to its own short-lived destination rather than orbiting a formation. */
export function followBee(s: Game, b: Bee, dt: number, speed: number, random: () => number) {
  const p=s.player, distance=Math.hypot(b.x-p.x,b.z-p.z);
  if(distance>70 || Math.abs(b.y-p.y)>45) {
    b.x=p.x+Math.cos(b.phase)*3; b.z=p.z+Math.sin(b.phase)*3; b.y=p.y+2;
    b.wander=undefined;
  }
  if(b.wander) b.wander.remaining-=dt;
  if(!b.wander || b.wander.remaining<=0 || Math.hypot(b.wander.x-p.x,b.wander.z-p.z)>12) {
    const angle=random()*Math.PI*2, radius=2+random()*(p.moving?3.5:6);
    const trail=p.moving?2.5:0;
    const x=p.x-Math.sin(p.yaw)*trail+Math.cos(angle)*radius;
    const z=p.z-Math.cos(p.yaw)*trail+Math.sin(angle)*radius;
    const ground=surface(x,z,p.y+1) ?? p.y;
    b.wander={x,z,y:Math.max(p.y+.9,ground+.8)+random()*1.5,remaining:1.5+random()*2.5};
  }
  const w=b.wander;
  let x=w.x,z=w.z;
  // Gentle local separation keeps larger swarms from stacking into one cube.
  let sx=0,sz=0;
  for(const other of s.bees) {
    if(other===b || Math.abs(other.y-b.y)>1.5) continue;
    const dx=b.x-other.x,dz=b.z-other.z,d=Math.hypot(dx,dz);
    if(d>.01 && d<1.4) {sx+=dx/d*(1.4-d);sz+=dz/d*(1.4-d);}
  }
  const separation=Math.max(1,Math.hypot(sx,sz)/.8);
  x+=sx/separation; z+=sz/separation;
  const dx=x-b.x,dy=w.y-b.y,dz=z-b.z,d=Math.hypot(dx,dy,dz);
  if(d<.45) w.remaining=Math.min(w.remaining,.35+b.phase*.08);
  const catchup=1+Math.min(1.2,Math.max(0,distance-9)/12);
  const t=Math.min(1,dt*speed*catchup/Math.max(d,.01));
  b.x+=dx*t;b.y+=dy*t;b.z+=dz*t;
}
