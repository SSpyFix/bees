import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Roblox faces: Right +X, Top +Y, Back +Z, Left -X, Bottom -Y, Front -Z.
const faceRot = [[0,Math.PI/2,0],[-Math.PI/2,0,0],[0,0,0],[0,-Math.PI/2,0],[Math.PI/2,0,0],[0,Math.PI,0]];
export function createDecalGeometry(p,d) {
  const axis = d.face===1||d.face===4 ? 1 : d.face===0||d.face===3 ? 0 : 2;
  const dims = axis===1 ? [p.size[0],p.size[2]] : axis===0 ? [p.size[2],p.size[1]] : [p.size[0],p.size[1]];
  const g=new T.PlaneGeometry(...dims), local=new T.Matrix4().makeRotationFromEuler(new T.Euler(...faceRot[d.face]));
  const offset=(p.size[axis]/2+0.008)*(d.face<3?1:-1);
  const t=[0,0,0]; t[axis]=offset;
  local.setPosition(...t);g.applyMatrix4(local);
  const r=p.rotation;
  g.applyMatrix4(new T.Matrix4().set(r[0],r[1],r[2],p.position[0],r[3],r[4],r[5],p.position[1],r[6],r[7],r[8],p.position[2],0,0,0,1));
  return g;
}

export function createGateWallGeometry(p, doors) {
  const r=p.rotation, extent=[0,1,2].map(a=>p.size.reduce((n,v,b)=>n+Math.abs(r[a*3+b])*v/2,0));
  if(extent[0]<10 || extent[2]>5 || extent[1]<1.5 || r.some(v=>Math.min(Math.abs(v),Math.abs(Math.abs(v)-1))>.001)) return null;
  const lo=p.position.map((v,a)=>v-extent[a]),hi=p.position.map((v,a)=>v+extent[a]);
  const openings=doors.filter(d=>Math.abs(d.position[2]-p.position[2])<5 && Math.abs(d.position[0]-p.position[0])<extent[0]+d.size[0]/2 && Math.abs(d.position[1]-p.position[1])<extent[1]+d.size[1]/2);
  if(!openings.length)return null;
  const xs=[lo[0],hi[0]],ys=[lo[1],hi[1]];
  for(const d of openings) {
    xs.push(Math.max(lo[0],d.position[0]-d.size[0]/2),Math.min(hi[0],d.position[0]+d.size[0]/2));
    ys.push(Math.max(lo[1],d.position[1]-d.size[1]/2),Math.min(hi[1],d.position[1]+d.size[1]/2));
  }
  xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);
  const pieces=[];
  for(let x=1;x<xs.length;x++)for(let y=1;y<ys.length;y++) {
    const width=xs[x]-xs[x-1],height=ys[y]-ys[y-1],cx=(xs[x]+xs[x-1])/2,cy=(ys[y]+ys[y-1])/2;
    if(width<.001||height<.001||openings.some(d=>Math.abs(cx-d.position[0])<d.size[0]/2 && Math.abs(cy-d.position[1])<d.size[1]/2))continue;
    pieces.push(new T.BoxGeometry(width,height,extent[2]*2).translate(cx,cy,p.position[2]));
  }
  const merged=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());return merged;
}
