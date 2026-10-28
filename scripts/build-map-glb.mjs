// Offline geometry conversion. No Roblox scripts or services are used at runtime.
import fs from 'node:fs';
import path from 'node:path';
import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createDecalGeometry, createGateWallGeometry } from './map-geometry.mjs';
import { cleanImportedPart, legacyPerimeterWall } from './map-cleanup.mjs';

const root = process.cwd();
const source = JSON.parse(fs.readFileSync('.local/source-map.json', 'utf8'));
const out = path.join(root, 'public/map');
fs.mkdirSync(path.join(out, 'textures'), { recursive: true });
const cache = '.local/roblox-assets';
const missing = [];
const textureFiles = new Map();
for (const id of fs.readdirSync(cache)) {
  const b = fs.readFileSync(path.join(cache, id));
  const ext = b[0] === 137 && b[1] === 80 ? 'png' : b[0] === 255 && b[1] === 216 ? 'jpg' : null;
  if (ext) {
    const name = `${id}.${ext}`;
    fs.copyFileSync(path.join(cache, id), path.join(out, 'textures', name));
    textureFiles.set(id, name);
  }
}

function lz4(b) {
  const out = []; let i = 0;
  const count = (n) => { if (n === 15) { let v; do { v = b[i++]; n += v; } while (v === 255); } return n; };
  while (i < b.length) {
    const token = b[i++], n = count(token >> 4);
    for (let k = 0; k < n; k++) out.push(b[i++]);
    if (i >= b.length) break;
    const offset = b.readUInt16LE(i); i += 2;
    const length = count(token & 15) + 4;
    if (!offset || offset > out.length) throw Error('Invalid LZ4 offset');
    for (let k = 0; k < length; k++) out.push(out[out.length - offset]);
  }
  return Buffer.from(out);
}

function unionData(b) {
  let i = 32;
  while (i + 16 <= b.length) {
    const tag = b.toString('ascii', i, i + 4), compressed = b.readUInt32LE(i + 4), size = b.readUInt32LE(i + 8);
    i += 16; let d = b.subarray(i, i + (compressed || size)); i += compressed || size;
    if (compressed) d = lz4(d);
    if (tag !== 'PROP') continue;
    const n = d.readUInt32LE(4), name = d.toString('utf8', 8, 8 + n);
    if (name !== 'MeshData' || d[8 + n] !== 1) continue;
    const len = d.readUInt32LE(9 + n), raw = d.subarray(13 + n, 13 + n + len);
    const key = [86,46,110,88,49,32,48,4,52,105,12,119,12,1,94,0,26,96,55,105,29,82,43,7,79,36,89,101,83,4,122];
    const decoded = Buffer.from(raw.map((v, k) => v ^ key[k % key.length]));
    if (decoded.toString('ascii', 0, 6) !== 'CSGMDL') throw Error('Unknown CSG header');
    const version = decoded.readUInt32LE(6);
    if (![2, 4].includes(version)) throw Error(`Unsupported CSG ${version}`);
    return decoded;
  }
  throw Error('No embedded union mesh');
}

const decoded = new Map();
function fileMesh(id) {
  if (decoded.has(id)) return decoded.get(id)?.clone();
  let g;
  try {
    const b = fs.readFileSync(path.join(cache, id));
    const position = [], normal = [], uv = [], indices = [];
    if (b.subarray(0, 7).toString() === '<roblox') {
      const d = unionData(b), count = d.readUInt32LE(42), stride = d.readUInt32LE(46);
      if (stride !== 84 || count > 1e6 || 50 + count * stride + 4 > d.length) throw Error('Invalid CSG dimensions');
      for (let i = 0; i < count; i++) {
        const at = 50 + i * stride;
        for (let a = 0; a < 3; a++) { position.push(d.readFloatLE(at + a * 4)); normal.push(d.readFloatLE(at + 12 + a * 4)); }
        uv.push(d.readFloatLE(at + 32), 1 - d.readFloatLE(at + 36));
      }
      const at = 50 + count * stride, n = d.readUInt32LE(at);
      for (let i = 0; i < n; i++) indices.push(d.readUInt32LE(at + 4 + i * 4));
    } else if (b.toString('ascii', 0, 12).startsWith('version 1.')) {
      const vectors = [...b.toString('utf8').matchAll(/\[([^\]]+)\]/g)].map(m => m[1].split(',').map(Number));
      for (let i = 0; i + 2 < vectors.length; i += 3) {
        position.push(...vectors[i].map(v => v * 2)); normal.push(...vectors[i + 1]); uv.push(vectors[i + 2][0], 1 - vectors[i + 2][1]);
      }
    } else {
      const start = b.indexOf(10) + 1, version = Number(b.toString('ascii', 8, 12));
      const header = b.readUInt16LE(start);
      let stride = version < 4 ? b[start + 2] : 40;
      const count = b.readUInt32LE(start + (version >= 3 && version < 4 ? 8 : 4));
      let faces = b.readUInt32LE(start + (version >= 3 && version < 4 ? 12 : 8));
      if (version >= 4 || stride < 32 || count > 1e6) throw Error(`Unsupported FileMesh ${version}`);
      const verticesAt = start + header, facesAt = verticesAt + count * stride;
      if (version >= 3) {
        const lodAt = facesAt + faces * 12;
        if (b.readUInt16LE(start + 6) >= 2) faces = b.readUInt32LE(lodAt + 4);
      }
      for (let i = 0; i < count; i++) {
        const at = verticesAt + i * stride;
        for (let a = 0; a < 3; a++) { position.push(b.readFloatLE(at + a * 4)); normal.push(b.readFloatLE(at + 12 + a * 4)); }
        uv.push(b.readFloatLE(at + 24), 1 - b.readFloatLE(at + 28));
      }
      for (let i = 0; i < faces * 3; i++) indices.push(b.readUInt32LE(facesAt + i * 4));
    }
    if (!position.length || position.some(v => !Number.isFinite(v)) || indices.some(v => v >= position.length / 3)) throw Error('Invalid mesh vertices');
    g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(position, 3));
    g.setAttribute('normal', new T.Float32BufferAttribute(normal, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    if (indices.length) g.setIndex(indices);
    g.computeBoundingBox();
  } catch (error) { missing.push({ asset: id, reason: error.message }); }
  decoded.set(id, g || null);
  return g?.clone();
}

function wedge() {
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute([-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5, -0.5,0.5,0.5, 0.5,0.5,0.5],3));
  g.setIndex([0,2,1, 1,2,3, 2,4,3, 3,4,5, 0,4,2, 0,1,4, 1,5,4, 1,3,5]);
  g.computeVertexNormals(); g.setAttribute('uv',new T.Float32BufferAttribute(new Array(12).fill(0),2));
  return g;
}

function geometry(p) {
  const special = p.special;
  const id = p.mesh || p.union || special?.mesh;
  let g = id ? fileMesh(id) : undefined;
  if (g) {
    if (special?.mesh && !p.mesh && !p.union) {
      g.scale(...special.scale.map(v => v * source.scale));
      g.translate(...special.offset);
    } else {
      g.computeBoundingBox(); const size = g.boundingBox.getSize(new T.Vector3()), center = g.boundingBox.getCenter(new T.Vector3());
      g.translate(-center.x, -center.y, -center.z);
      g.scale(...p.size.map((v,a) => v / (size.getComponent(a) || 1)));
    }
  } else {
    const type = special?.type;
    if (p.class === 'WedgePart' || type === 2) g = wedge();
    else if (p.shape === 0 || type === 3 || type === 0) g = new T.SphereGeometry(0.5,12,8);
    else if (p.shape === 2 || type === 4) { g = new T.CylinderGeometry(0.5,0.5,1,16); if (!special) g.rotateZ(Math.PI / 2); }
    else g = new T.BoxGeometry(1,1,1);
    const scale = p.size.map((v,a) => v * (special?.scale[a] ?? 1));
    g.scale(...scale);
    if (special) g.translate(...special.offset);
  }
  const r = p.rotation, m = new T.Matrix4().set(r[0],r[1],r[2],p.position[0],r[3],r[4],r[5],p.position[1],r[6],r[7],r[8],p.position[2],0,0,0,1);
  g.applyMatrix4(m);
  return g;
}

const buckets = new Map(), collision = [], flowers = [], removedLegacyWalls=[],openedGateWalls=[];
const excludedBeeParts=[],excludedBeeModels=new Set();let clearedHivePortraits=0;
const gateDoors=source.parts.filter(p=>p.name==='Door'&&/\d+ Bee Gate\//.test(p.path));
function add(g, color, texture, opacity=1, cell='') {
  if (opacity < 0.01) { g.dispose(); return; }
  if (g.index) { const old = g; g = g.toNonIndexed(); old.dispose(); }
  const c = new T.Color(color), colors = new Float32Array(g.attributes.position.count * 3);
  for (let i=0;i<colors.length;i+=3) { colors[i]=c.r; colors[i+1]=c.g; colors[i+2]=c.b; }
  g.setAttribute('color',new T.BufferAttribute(colors,3));
  const key=JSON.stringify([textureFiles.has(texture) ? texture : null,Math.round(opacity*10)/10,cell]);
  if (!buckets.has(key)) buckets.set(key,[]);
  buckets.get(key).push(g);
}
function addCollision(g) {
  const pos = g.attributes.position, index=g.index;
  for(let k=0;k<(index?.count??pos.count);k+=3) {
    const row=[];
    for(let a=0;a<3;a++) { const i=index ? index.getX(k+a) : k+a; row.push(pos.getX(i),pos.getY(i),pos.getZ(i)); }
    collision.push(row.map(v=>Math.round(v*1000)/1000));
  }
}

for (const original of source.parts) {
  const p=cleanImportedPart(original);
  if(!p) {
    excludedBeeParts.push(original.path);
    excludedBeeModels.add(original.path.match(/^(.*?\/Bee\d+)(?:\/|$)/)[1]);
    continue;
  }
  if(p!==original)clearedHivePortraits+=original.decals.filter(d=>d.opacity>.01).length;
  const flower = p.name === 'FlowerPatch' || p.name === 'FieldBlock' || /^FP\d+-/.test(p.name);
  const dynamicDoor=p.name==='Door' && /\d+ Bee Gate\//.test(p.path);
  if(dynamicDoor) continue;
  const gateWall=p.class==='Part'&&p.collide&&!p.special ? createGateWallGeometry(p,gateDoors) : null;
  if(gateWall)openedGateWalls.push({name:p.path,position:p.position});
  const g=flower ? new T.PlaneGeometry(p.size[0],p.size[2]).rotateX(-Math.PI/2).translate(p.position[0],p.position[1]+p.size[1]/2,p.position[2]) : gateWall || geometry(p);
  const obsolete=legacyPerimeterWall(p, source.markers);
  if(obsolete) removedLegacyWalls.push({name:p.path,position:p.position});
  if(p.collide && !flower && p.class!=='SpawnLocation' && !obsolete) addCollision(g);
  const cell=`${Math.floor(p.position[0]/40)},${Math.floor(p.position[2]/40)}`;
  add(g,p.color,p.texture||p.special?.texture,p.opacity,cell);
  if(flower) {
    const d=p.decals.find(d=>d.face===1) || p.decals[0];
    if(d) flowers.push({x:p.position[0],y:p.position[1]+p.size[1]/2+0.014,z:p.position[2],width:p.size[0],texture:d.asset});
  } else for(const d of p.decals) if(textureFiles.has(d.asset)) add(createDecalGeometry(p,d),'#ffffff',d.asset,d.opacity);
}

const doc={asset:{version:'2.0',generator:'bee/scripts/build-map-glb.mjs'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}],textures:[],images:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}]};
const chunks=[]; let offset=0;
function accessor(array,itemSize,type='VEC3',componentType=5126,withBounds=false) {
  const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);
  const index=doc.bufferViews.length;
  doc.bufferViews.push({buffer:0,byteOffset:offset,byteLength:b.length});
  chunks.push(b); offset+=b.length;
  if(offset%4) { const pad=Buffer.alloc(4-offset%4);chunks.push(pad);offset+=pad.length; }
  const a={bufferView:index,componentType,count:array.length/itemSize,type};
  if(withBounds) { a.min=new Array(itemSize).fill(Infinity);a.max=new Array(itemSize).fill(-Infinity);for(let i=0;i<array.length;i++) {a.min[i%itemSize]=Math.min(a.min[i%itemSize],array[i]);a.max[i%itemSize]=Math.max(a.max[i%itemSize],array[i]);} }
  doc.accessors.push(a);return doc.accessors.length-1;
}
const materials=new Map();
for(const [key,geos] of buckets) {
  const [texture,opacity]=JSON.parse(key), matKey=JSON.stringify([texture,opacity]);
  let material=materials.get(matKey);
  if(material===undefined) {
    const mat={pbrMetallicRoughness:{baseColorFactor:[1,1,1,opacity],metallicFactor:0,roughnessFactor:1},doubleSided:true};
    if(texture) {
      let idx=doc.images.findIndex(i=>i.name===texture);
      if(idx<0) {idx=doc.images.length;doc.images.push({name:texture,uri:`textures/${textureFiles.get(texture)}`});doc.textures.push({source:idx,sampler:0});}
      mat.pbrMetallicRoughness.baseColorTexture={index:idx};
      mat.alphaMode='MASK';mat.alphaCutoff=0.2;
    }
    if(opacity<1) mat.alphaMode='BLEND';
    material=doc.materials.length;doc.materials.push(mat);materials.set(matKey,material);
  }
  const g=mergeGeometries(geos,false), attributes={};
  for(const [name,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0'],['color','COLOR_0']]) {
    const a=g.attributes[name]; attributes[semantic]=accessor(a.array,a.itemSize,a.itemSize===2?'VEC2':'VEC3',5126,name==='position');
  }
  const mesh=doc.meshes.length;doc.meshes.push({primitives:[{attributes,material}]});
  doc.scenes[0].nodes.push(doc.nodes.length);doc.nodes.push({mesh,name:`Map ${mesh}`});
  g.dispose();geos.forEach(g=>g.dispose());
}
doc.buffers[0].byteLength=offset;
let json=Buffer.from(JSON.stringify(doc));if(json.length%4)json=Buffer.concat([json,Buffer.alloc(4-json.length%4,32)]);
const bin=Buffer.concat(chunks), header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);
const bh=Buffer.alloc(8);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
fs.writeFileSync(path.join(out,'bss-map.glb'),Buffer.concat([header,json,bh,bin]));
fs.writeFileSync(path.join(out,'collision.bin'),Buffer.from(new Float32Array(collision.flat()).buffer));
fs.writeFileSync('.local/map-flowers.json',JSON.stringify(flowers));
fs.writeFileSync(path.join(out,'import-report.json'),JSON.stringify({...source.report,sourceParts:source.parts.length,convertedParts:source.parts.length-excludedBeeParts.length,flowers:flowers.length,collisionTriangles:collision.length,drawBatches:doc.meshes.length,removedLegacyWalls,openedGateWalls,excludedBeeModels:[...excludedBeeModels],excludedBeeParts:excludedBeeParts.length,clearedHivePortraits,meshFailures:missing.map(m=>({...m,reason:m.reason.startsWith('ENOENT')?'Asset unavailable':m.reason}))},null,2));
console.log({parts:source.parts.length-excludedBeeParts.length,excludedBeeModels:excludedBeeModels.size,excludedBeeParts:excludedBeeParts.length,clearedHivePortraits,flowers:flowers.length,triangles:collision.length,meshes:doc.meshes.length,glbMB:bin.length/1e6,unavailableMeshes:missing.length});
