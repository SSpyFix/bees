import { BufferGeometry, Float32BufferAttribute } from 'three';
import map from '../data/imported-map.json';

// The export includes a thick, uncut terrain wall behind the 15-bee gate.
// Identify only that box's original corner triangles; retain the rest of the map.
const bounds=[[-84.428,-1.951],[-.35,39.823],[-120.737,-118.025]];
const gate=map.gates.find(g=>g.bees===15)!;
type Vertex=number[];
function clip(poly:Vertex[],axis:number,bound:number,less:boolean):Vertex[] {
  const out:Vertex[]=[];
  for(let i=0;i<poly.length;i++) {
    const a=poly[(i+poly.length-1)%poly.length],b=poly[i];
    const insideA=less?a[axis]<=bound:a[axis]>=bound;
    const insideB=less?b[axis]<=bound:b[axis]>=bound;
    if(insideA!==insideB) {
      const t=(bound-a[axis])/(b[axis]-a[axis]);
      out.push(a.map((v,j)=>v+(b[j]-v)*t));
    }
    if(insideB)out.push(b);
  }
  return out;
}
export function openFifteenBeeGate(geometry:BufferGeometry):BufferGeometry {
  if(geometry.userData.fifteenGateOpen)return geometry;
  const position=geometry.getAttribute('position'),index=geometry.index;
  const count=index?.count??position.count;
  const id=(i:number)=>index?index.getX(i):i;
  const matches=(i:number)=>[0,1,2].every(v=>{
    const n=id(i+v),p=[position.getX(n),position.getY(n),position.getZ(n)];
    return p.every((value,axis)=>bounds[axis].some(edge=>Math.abs(value-edge)<.003));
  });
  let found=false;
  for(let i=0;i<count;i+=3)if(matches(i)){found=true;break;}
  if(!found)return geometry;
  const attrs=[['position',position] as const,...Object.entries(geometry.attributes).filter(([name])=>name!=='position')];
  const arrays=attrs.map(()=>[] as number[]);
  const emit=(poly:Vertex[])=>{
    for(let i=1;i+1<poly.length;i++)for(const vertex of [poly[0],poly[i],poly[i+1]]) {
      let offset=0;
      attrs.forEach(([,attr],j)=>{for(let c=0;c<attr.itemSize;c++)arrays[j].push(vertex[offset++]);});
    }
  };
  const lo=gate.x-gate.width/2,hi=gate.x+gate.width/2;
  for(let i=0;i<count;i+=3) {
    const triangle:Vertex[]=[0,1,2].map(v=>attrs.flatMap(([,a])=>{
      const n=id(i+v);
      return [a.getX(n),a.getY(n),a.itemSize>2?a.getZ(n):0,a.itemSize>3?a.getW(n):0].slice(0,a.itemSize);
    }));
    if(!matches(i)){emit(triangle);continue;}
    emit(clip(triangle,0,lo,true));
    const right=clip(triangle,0,lo,false);
    emit(clip(right,0,hi,false));
    const middle=clip(right,0,hi,true);
    emit(clip(middle,1,gate.y-5,true));
    emit(clip(middle,1,gate.y+5,false));
  }
  const result=geometry.clone();result.setIndex(null);result.clearGroups();
  attrs.forEach(([name,a],i)=>result.setAttribute(name,new Float32BufferAttribute(arrays[i],a.itemSize)));
  result.userData.fifteenGateOpen=true;
  result.computeBoundingBox();result.computeBoundingSphere();
  return result;
}

export function openFifteenBeeGateCollision(vertices:Float32Array):Float32Array {
  const source=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(vertices,3));
  const opened=openFifteenBeeGate(source);
  const result=opened.getAttribute('position').array as Float32Array;
  if(opened!==source)opened.dispose();
  source.dispose();
  return result;
}
