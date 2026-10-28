import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDecalGeometry, createGateWallGeometry } from './map-geometry.mjs';
import * as T from 'three';
const part={size:[4,6,8],position:[10,20,30],rotation:[1,0,0,0,1,0,0,0,1]};
test('Roblox Front and Back decals face out from -Z and +Z respectively',()=>{
  for(const [face,sign] of [[5,-1],[2,1]]) {
    const g=createDecalGeometry(part,{face});
    g.computeBoundingBox();
    assert.ok(Math.abs(g.boundingBox.min.z-(30+sign*4.008))<0.001);
    assert.ok(g.attributes.normal.getZ(0)*sign>0.99);
    g.dispose();
  }
});
test('opens a gate doorway through a rotated source wall while keeping both sides solid',()=>{
  const wall={size:[.35,10,40],position:[0,5,0],rotation:[0,0,-1,0,1,0,1,0,0]};
  const door={position:[0,5,-2],size:[8,10,1]};
  const g=createGateWallGeometry(wall,[door]),mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));
  const ray=new T.Raycaster(new T.Vector3(0,5,5),new T.Vector3(0,0,-1));
  assert.equal(ray.intersectObject(mesh).length,0);
  ray.ray.origin.x=10;assert.ok(ray.intersectObject(mesh).length>0);
  mesh.material.dispose();g.dispose();
});
test('top and right decals respect part dimensions and world rotation',()=>{
  const g=createDecalGeometry({...part,rotation:[0,0,1,0,1,0,-1,0,0]},{face:0});
  g.computeBoundingBox();
  assert.ok(Math.abs(g.boundingBox.min.z-(30-2.008))<0.001);
  assert.ok(g.attributes.normal.getZ(0)<-0.99);
  g.dispose();
});

test('opens thick terrain walls at a gate while preserving the sides',()=>{
 const wall={size:[82.477,40.173,2.712],position:[-43.1895,19.7365,-119.381],rotation:[1,0,0,0,1,0,0,0,1]};
 const door={position:[-44.24655,26.34881,-118.92618],size:[14.25455,10,.4]};
 const g=createGateWallGeometry(wall,[door]);assert.ok(g);
 const mesh=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));
 const ray=new T.Raycaster(new T.Vector3(-44.24655,24,-113),new T.Vector3(0,0,-1));
 assert.equal(ray.intersectObject(mesh).length,0);
 ray.ray.origin.x=-60;assert.ok(ray.intersectObject(mesh).length>0);
 g.dispose();mesh.material.dispose();
});
