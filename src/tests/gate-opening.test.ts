import {it,expect} from 'vitest';
import {BoxGeometry,Mesh,MeshBasicMaterial,DoubleSide,Raycaster,Vector3} from 'three';
import {openFifteenBeeGate} from '../game/world/gate-opening';
it('opens only the doorway and preserves visible wall attributes and surrounding terrain',()=>{
 const source=new BoxGeometry(82.477,40.173,2.712).translate(-43.1895,19.7365,-119.381).toNonIndexed();
 const opened=openFifteenBeeGate(source),mesh=new Mesh(opened,new MeshBasicMaterial({side:DoubleSide}));
 const ray=new Raycaster(new Vector3(-44.24655,24,-113),new Vector3(0,0,-1));
 expect(ray.intersectObject(mesh)).toHaveLength(0);
 ray.ray.origin.x=-60;expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
 ray.ray.origin.set(-44.24655,35,-113);expect(ray.intersectObject(mesh).length).toBeGreaterThan(0);
 expect(opened.getAttribute('uv').count).toBe(opened.getAttribute('position').count);
 expect([...opened.getAttribute('normal').array].every(Number.isFinite)).toBe(true);
 expect(openFifteenBeeGate(opened)).toBe(opened);
 const other=new BoxGeometry(5,5,5).translate(-44,24,-119);
 expect(openFifteenBeeGate(other)).toBe(other);
 source.dispose();opened.dispose();other.dispose();mesh.material.dispose();
});
