import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { tokenIconSvg } from "../data/tokenIcons";
/** One local SVG source supplies world tokens, marker signs, and UI icons. */
export default function TokenIconMesh({
  kind,
  radius = 0.65,
}: {
  kind: string;
  radius?: number;
}) {
  const group = useRef<THREE.Group>(null),
    invalidate = useThree((s) => s.invalidate);
  const map = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [kind]);
  useEffect(() => {
    const img = new Image();
    let active = true;
    img.onload = () => {
      if (!active) return;
      const ctx = (map.image as HTMLCanvasElement).getContext("2d")!;
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(img, 0, 0, 128, 128);
      map.needsUpdate = true;
      invalidate();
    };
    img.src =
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(tokenIconSvg(kind));
    return () => {
      active = false;
      img.onload = null;
      map.dispose();
    };
  }, [kind, map, invalidate]);
  useFrame(({ camera }) => {
    group.current?.quaternion.copy(camera.quaternion);
  });
  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, 0.08, 32]} />
        <meshStandardMaterial color="#e8ece6" />
      </mesh>
      <mesh position={[0, 0, 0.051]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial
          map={map}
          transparent
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
