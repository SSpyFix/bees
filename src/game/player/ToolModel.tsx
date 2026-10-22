function Box({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  color,
}: {
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
function Ball({
  position = [0, 0, 0],
  scale,
  color,
}: {
  position?: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
export default function ToolModel({ level = 0 }: { level?: number }) {
  const tint = level === 12 ? "#ffcf14" : level >= 14 ? "#eeeeee" : "#b0b8bb";
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 1.45, 6]} />
        <meshStandardMaterial color={level >= 14 ? "#e5d9af" : "#9f7239"} />
      </mesh>
      <group position={[0, 0.16, 0]}>
        {[1, 12].includes(level) ? (
          <>
            <Box scale={[1.25, 0.12, 0.2]} color={tint} />
            {[-0.5, -0.25, 0, 0.25, 0.5].map((x) => (
              <Box
                key={x}
                position={[x, 0.25, 0]}
                scale={[0.09, 0.5, 0.12]}
                color={tint}
              />
            ))}
          </>
        ) : [2, 8].includes(level) ? (
          <>
            <Box
              position={[-0.1, 0.2, 0]}
              scale={[0.12, 1.2, 0.16]}
              rotation={[0, 0, 0.4]}
              color={tint}
            />
            <Box
              position={[0.1, 0.2, 0]}
              scale={[0.12, 1.2, 0.16]}
              rotation={[0, 0, -0.4]}
              color={tint}
            />
          </>
        ) : [3, 7].includes(level) ? (
          <>
            <Box
              position={[-0.42, 0.15, 0]}
              scale={[0.2, 0.8, 0.25]}
              color="#e62929"
            />
            <Box
              position={[0.42, 0.15, 0]}
              scale={[0.2, 0.8, 0.25]}
              color="#3263e1"
            />
            <Box position={[0, -0.2, 0]} scale={[1, 0.2, 0.25]} color={tint} />
          </>
        ) : [11, 17].includes(level) ? (
          <>
            <Box
              position={[0.5, 0.28, 0]}
              scale={[1.4, 0.15, 0.22]}
              rotation={[0, 0, -0.35]}
              color={level === 17 ? "#e82131" : "#d9dcdf"}
            />
            <Box
              position={[1.05, 0.05, 0]}
              scale={[0.6, 0.12, 0.18]}
              rotation={[0, 0, -0.8]}
              color={level === 17 ? "#e82131" : "#d9dcdf"}
            />
          </>
        ) : level === 10 ? (
          <mesh>
            <torusGeometry args={[0.55, 0.09, 6, 14]} />
            <meshStandardMaterial color="#35b6e6" />
          </mesh>
        ) : level === 15 ? (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <Ball
                key={i}
                position={[
                  Math.cos(i * 1.256) * 0.4,
                  Math.sin(i * 1.256) * 0.4,
                  0,
                ]}
                scale={[0.32, 0.32, 0.12]}
                color="#fff"
              />
            ))}
            <Ball scale={[0.22, 0.22, 0.16]} color="#ffdd22" />
          </>
        ) : [6, 13, 16, 18].includes(level) ? (
          <>
            <Ball
              scale={[0.55, 0.55, 0.55]}
              color={
                level === 16 ? "#3ac6fc" : level === 18 ? "#ee9de4" : "#e9faff"
              }
            />
            {[0, 1, 2].map((i) => (
              <mesh key={i} rotation={[i * 0.7, 0, i]}>
                <torusGeometry args={[0.6, 0.05, 4, 12]} />
                <meshStandardMaterial
                  color={level === 18 ? "#6ff2c2" : "#ffdf22"}
                />
              </mesh>
            ))}
          </>
        ) : (
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[
                level === 9 ? 0.3 : 0.48,
                level === 9 ? 0.3 : 0.4,
                level === 9 ? 1 : 0.24,
                10,
              ]}
            />
            <meshStandardMaterial color={level === 4 ? "#7a8894" : tint} />
          </mesh>
        )}
      </group>
    </group>
  );
}
