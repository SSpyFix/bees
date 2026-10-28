import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ToolModel from "../game/player/ToolModel";
import PackModel from "../game/player/PackModel";
import { BeeModel, Box, Ball } from "../game/world/models";
import { ItemIcon } from "./GameIcons";
export default function ShopPreview({
  type,
  level = 0,
  id,
  bee,
}: {
  type: string;
  level?: number;
  id: string;
  bee?: { body: string; face: string; rarity: string };
}) {
  if(id==='hive-slot')return <div className="shop-item-illustration">
    <svg viewBox="0 0 160 160" role="img" aria-label="Empty hive slot">
      <polygon points="80,8 143,44 143,116 80,152 17,116 17,44" fill="#e9b52a" stroke="#674b0e" strokeWidth="5" />
      <polygon points="80,27 127,54 127,106 80,133 33,106 33,54" fill="#fff3a4" />
      <path d="M60 80H100M80 60V100" stroke="#89651c" strokeWidth="10" />
    </svg>
  </div>;
  if (["treat", "jelly", "booster", "converter", "starTreat"].includes(id))
    return (
      <div className="shop-item-illustration">
        <ItemIcon id={id} />
      </div>
    );
  return (
    <Canvas
      key={id}
      frameloop="demand"
      dpr={1}
      camera={{ position: [3, 2.1, 6], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[4, 6, 5]} intensity={3} />
      <group rotation={[0, -0.2, 0]}>
        {bee ? (
          <BeeModel
            color={bee.body}
            face={bee.face}
            rarity={bee.rarity}
            animate={false}
          />
        ) : type === "tool" ? (
          <group rotation={[-Math.PI / 2, 0, -0.4]} scale={2}>
            <ToolModel level={level} />
          </group>
        ) : type === "bag" ? (
          <group position={[0, -2, 0]} scale={1.5}>
            <PackModel level={level} />
          </group>
        ) : type === "hat" ? (
          <group scale={1.4}>
            <mesh>
              <cylinderGeometry args={[0.75, 0.9, 0.85, 16]} />
              <meshStandardMaterial
                color={level === 1 ? "#e34031" : "#adf1f4"}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry
                args={[0.73, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <meshStandardMaterial
                color={level === 1 ? "#f0d72b" : "#d4feff"}
              />
            </mesh>
            <Box
              position={[0, -0.08, 0.8]}
              scale={[0.5, 0.2, 0.3]}
              color="#b2dfe1"
            />
            {[-0.27, 0.27].map((x) => (
              <Ball
                key={x}
                position={[x, 0.1, 0.68]}
                scale={[0.1, 0.15, 0.05]}
                color="#304d78"
              />
            ))}
          </group>
        ) : type === "boots" ? (
          <group>
            {[-0.6, 0.6].map((x) => (
              <group key={x}>
                <Box
                  position={[x, 0, 0]}
                  scale={[0.8, 1.1, 0.8]}
                  color="#e5cf55"
                />
                <Box
                  position={[x, -0.4, 0.4]}
                  scale={[0.85, 0.4, 1.4]}
                  color="#7c895f"
                />
              </group>
            ))}
          </group>
        ) : (
          <EggDispenser />
        )}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.7}
        maxPolarAngle={2}
      />
    </Canvas>
  );
}

function EggDispenser() {
  return (
    <group>
      <Box position={[0, -0.1, 0]} scale={[2.2, 3.3, 1.2]} color="#8a8c8c" />
      <Box position={[0, 1.65, 0]} scale={[2.4, 0.3, 1.4]} color="#bfc1bc" />
      <Box
        position={[0, 0.15, 0.65]}
        scale={[1.85, 2.25, 0.13]}
        color="#b4261a"
      />
      <Box position={[0, 0.15, 0.73]} scale={[1.55, 2, 0.1]} color="#202221" />
      <group position={[0, 0.2, 0.9]} scale={[0.57, 0.57, 0.35]}>
        <mesh scale={[1, 1.4, 1]}>
          <sphereGeometry args={[0.95, 20, 16]} />
          <meshStandardMaterial color="#f4de1a" />
        </mesh>
        {[-0.48, 0.32].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <cylinderGeometry args={[0.98, 0.98, 0.25, 24]} />
            <meshStandardMaterial color="#24262b" />
          </mesh>
        ))}
      </group>
      <Box
        position={[0, -1.35, 0.7]}
        scale={[0.65, 0.5, 0.1]}
        color="#202321"
      />
      <Box
        position={[0, -1.6, 0.77]}
        scale={[1.4, 0.28, 0.12]}
        color="#3489f4"
      />
    </group>
  );
}
