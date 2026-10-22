import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
/** Bake original procedural geometry by material: hundreds of props, tens of draw calls. */
export default function StaticBatch({ children }: { children: ReactNode }) {
  const source = useRef<THREE.Group>(null),
    destination = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!source.current || !destination.current) return;
    source.current.updateWorldMatrix(true, true);
    const groups = new Map<
        string,
        { material: THREE.Material; geometries: THREE.BufferGeometry[] }
      >(),
      hidden: THREE.Mesh[] = [],
      merged: THREE.Mesh[] = [];
    source.current.traverse((obj) => {
      if (
        !(obj instanceof THREE.Mesh) ||
        obj instanceof THREE.InstancedMesh ||
        Array.isArray(obj.material)
      )
        return;
      const material = obj.material as THREE.MeshStandardMaterial;
      if (!material.color) return;
      const key = [
        material.type,
        material.color.getHexString(),
        material.roughness,
        material.metalness,
        material.side,
        material.map?.uuid ?? "",
        material.transparent,
        material.opacity,
      ].join(":");
      const geo = obj.geometry.clone().applyMatrix4(obj.matrixWorld);
      if (!geo.getAttribute("uv"))
        geo.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute(
            new Float32Array(geo.getAttribute("position").count * 2),
            2,
          ),
        );
      if (!groups.has(key)) groups.set(key, { material, geometries: [] });
      groups.get(key)!.geometries.push(geo);
      obj.visible = false;
      hidden.push(obj);
    });
    for (const { material, geometries } of groups.values()) {
      const geo = mergeGeometries(geometries);
      geometries.forEach((g) => g.dispose());
      if (!geo) continue;
      geo.computeBoundingSphere();
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      destination.current.add(mesh);
      merged.push(mesh);
    }
    return () => {
      hidden.forEach((m) => (m.visible = true));
      merged.forEach((m) => {
        m.removeFromParent();
        m.geometry.dispose();
      });
    };
  }, []);
  return (
    <group>
      <group ref={source}>{children}</group>
      <group ref={destination} />
    </group>
  );
}
