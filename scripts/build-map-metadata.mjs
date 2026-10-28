import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const collisionCode=ts.transpileModule(fs.readFileSync('src/game/world/imported-terrain.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
fs.writeFileSync('.local/build-terrain.mjs',collisionCode);
const {TriangleTerrain}=await import(pathToFileURL(process.cwd()+'/.local/build-terrain.mjs').href);
const collisionBytes=fs.readFileSync('public/map/collision.bin');
const terrain=new TriangleTerrain(new Float32Array(collisionBytes.buffer.slice(collisionBytes.byteOffset,collisionBytes.byteOffset+collisionBytes.byteLength)));
const source=JSON.parse(fs.readFileSync('.local/source-map.json','utf8'));
const tiles=JSON.parse(fs.readFileSync('.local/map-flowers.json','utf8'));
const names=[['sunflower','Sunflower Field',0],['dandelion','Dandelion Field',0],['mushroom','Mushroom Field',0],['blue','Blue Flower Field',0],['clover','Clover Field',0],['spider','Spider Field',5],['bamboo','Bamboo Field',5],['strawberry','Strawberry Field',5],['pineapple','Pineapple Patch',10],['stump','Stump Field',10],['cactus','Cactus Field',15],['pumpkin','Pumpkin Patch',15],['pine','Pine Tree Forest',15],['rose','Rose Field',5],['mountain','Mountain Top Field',25],['coconut','Coconut Field',35],['pepper','Pepper Patch',35]];
const textureTypes={'1345128995':[0,1],'1345127271':[0,2],'1345124272':[0,3],'1345128616':[1,1],'1345126830':[1,2],'1345125038':[1,3],'1345128010':[2,1],'1345126224':[2,2],'1345122638':[2,3],'4845911635':[0,2],'4845912024':[0,1],'4845904033':[1,2],'4845904533':[1,1],'4845899467':[2,2],'4845899859':[2,1],'4845912338':[0,3]};
const textureIds=Object.keys(textureTypes);
const flowers=[], fields=[];
for(const [id,name,gate] of names) {
  const marker=source.markers.find(m=>m.name===name);
  let selected=[];
  if(marker) selected=tiles.filter(p=>Math.abs(p.x-marker.position[0])<=marker.size[0]/2+1.4 && Math.abs(p.z-marker.position[2])<=marker.size[2]/2+1.4 && Math.abs(p.y-marker.position[1])<1.8);
  if(id==='stump') {
    for(let z=-7;z<=7;z++)for(let x=-7;x<=7;x++) selected.push({x:173+x*1.4,y:22.94,z:-164+z*1.4,texture:'1345127271',width:1.4});
  }
  if(!selected.length) throw Error(`No flower positions for ${name}`);
  const minX=Math.min(...selected.map(p=>p.x)),maxX=Math.max(...selected.map(p=>p.x)),minZ=Math.min(...selected.map(p=>p.z)),maxZ=Math.max(...selected.map(p=>p.z));
  const y=[...selected].sort((a,b)=>a.y-b.y)[Math.floor(selected.length/2)].y;
  const colors=[0,0,0];selected.forEach(p=>colors[(textureTypes[p.texture]??[0])[0]]++);
  const f={id,name,gate,x:(minX+maxX)/2,y,z:(minZ+maxZ)/2,width:maxX-minX+1.4,depth:maxZ-minZ+1.4,biome:id,colors:colors.map(n=>n/selected.length),recreated:id==='stump'};
  const index=fields.length;fields.push(f);
  for(const p of selected) {
    const [color,size]=textureTypes[p.texture]??[0,1];
    flowers.push([p.x,p.y,p.z,index,color,size,textureIds.indexOf(p.texture),p.width]);
  }
}
const models=(name)=>source.models.filter(p=>p.name===name);
const point=(name)=>models(name)[0]?.position;
const hives=source.models.filter(p=>/\/Hive\d+\/patharrow$/.test(p.path)).map((p,index)=>({x:p.position[0],y:p.position[1]+0.06,z:p.position[2],index}));
if(hives.length!==5) throw Error(`Expected the five source hives, got ${hives.length}`);
const hiveCells=hives.map((_,index)=>source.parts.filter(p=>new RegExp(`/Hive${index+3}/Cells/C\\d+,\\d+/Backplate$`).test(p.path)).sort((a,b)=>{
  const cell=p=>p.path.match(/\/C(\d+),(\d+)\//).slice(1).map(Number),aa=cell(a),bb=cell(b);
  return aa[1]-bb[1]||aa[0]-bb[0];
}).map(p=>({position:p.position,rotation:p.rotation,size:p.size})));
const places={};
function set(id,p,dy=0,dz=0,dx=0) {if(!p)throw Error(id);places[id]={x:p[0]+dx,y:p[1]+dy,z:p[2]+dz};}
set('juniper',point('Black Bear'),-3.1,0,5);set('maple',point('Brown Bear'),-3.1,0,-5);
set('rowan',point('Panda Bear'),-3.1,5);set('sage',point('Science Bear'),-3.1,4);
set('hazel',point('Polar Bear'),-3.1,4);set('orion',point('Spirit Bear'),-3.1,5);
set('shop',point('Noob Bear'),-1.35,-5);set('shop-10',point('Pro Bear'),-1.35,5);
set('blue-hq',point('Blue HQ'),0,0,7);set('red-hq',point('Red HQ'),0,0,-7);
set('red-cannon',point('Red Cannon'),-4.8,-3);set('mountain-cannon',point('Shop Glider'),-3.8,5);
set('daily',point('Honey Dispenser'),-3.1,-4);
// These legacy activities have no identifiable interaction marker in the export.
// Place their rebuilt stands on clear ground near the appropriate source landmark.
places['pippin']={x:-10,y:0,z:8};places['tickets']={x:43,y:0,z:10};
places['eggs']={x:48,y:0,z:-4};places['treat-shop']={x:68,y:0,z:11};places['jelly-shop']={x:119,y:5.8,z:-78};
places['guild']={x:-50,y:22.9,z:-148};places['shop-25']={x:42,y:60.6,z:-157};places['shop-35']={x:-3,y:26.2,z:82};
places['boost']={x:58,y:0,z:5};places['treat']={x:66,y:0,z:3};places['challenge']={x:69,y:10.9,z:-14};
for(const [id,p] of Object.entries(places)) {
  p.y=terrain.surface(p.x,p.z,p.y)??p.y;
  if(!terrain.solid(p.x,p.z,p.y)) continue;
  let resolved=false;
  for(let radius=1;radius<=9&&!resolved;radius++)for(let a=0;a<24;a++) {
    const x=p.x+Math.sin(a*Math.PI/12)*radius,z=p.z+Math.cos(a*Math.PI/12)*radius,y=terrain.surface(x,z,p.y);
    if(y!==null&&Math.abs(y-p.y)<2&&!terrain.solid(x,z,y)) {places[id]={x,y,z};resolved=true;break;}
  }
  if(!resolved)throw Error(`Blocked interaction: ${id}`);
}
const gates=source.parts.filter(p=>p.name==='Door'&&/\d+ Bee Gate\//.test(p.path)).map(p=>({bees:Number(p.path.match(/(\d+) Bee Gate/)[1]),x:p.position[0],y:p.position[1],z:p.position[2],width:p.size[0]}));
const coconut=fields.find(f=>f.id==='coconut'),pepper=fields.find(f=>f.id==='pepper');
const routes=[
 {name:'35 Bee Trail',from:[60,0,28],to:[20,coconut.y,61],width:6,gate:35},
 {name:'Pepper Trail',from:[-65,coconut.y,70],to:[-91,pepper.y,83],width:6,gate:35},
 {name:'Pepper Bridge',from:[-91,pepper.y,83],to:[-108,pepper.y,86],width:6,gate:35}
];
const data={version:'bss-rbxmx-1',fields,flowers,textureIds,hives,hiveCells,places,gates,routes,spawn:{x:0,y:0,z:0},bounds:{minX:-185,maxX:260,minZ:-220,maxZ:150},supplementalStump:{x:173,y:22.925,z:-164,radius:16}};
fs.writeFileSync('src/game/data/imported-map.json',JSON.stringify(data));
console.log({fields:fields.length,liveFlowers:flowers.length,hives:hives.length,fieldCounts:fields.map((f,i)=>[f.id,flowers.filter(t=>t[3]===i).length])});
