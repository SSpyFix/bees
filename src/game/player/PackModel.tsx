/** Procedural containers change silhouette with the equipped capacity upgrade. */
export default function PackModel({ level = 0 }: { level?: number }) {
  const color =
    [
      "#b99458",
      "#a4d5eb",
      "#338bd2",
      "#9dabb0",
      "#ffe12d",
      "#f3f3ed",
      "#a77b49",
      "#b5e6ac",
    ][level] ?? "#b99458";
  return (
    <group position={[0, 1.5, -0.65]}>
      {[1, 3, 6].includes(level) ? (
        <mesh rotation={[0, 0, level === 6 ? Math.PI / 2 : 0]}>
          <cylinderGeometry
            args={[
              level === 6 ? 0.65 : 0.52,
              level === 6 ? 0.65 : 0.46,
              1.1,
              12,
            ]}
          />
          <meshStandardMaterial
            color={color}
            metalness={level === 3 ? 0.6 : 0}
            roughness={0.5}
          />
        </mesh>
      ) : (
        <mesh>
          <boxGeometry args={[1.05, 1.1, 0.65]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      {level === 1 && (
        <mesh position={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.37, 0.37, 0.8, 10]} />
          <meshStandardMaterial color="#fbc52b" />
        </mesh>
      )}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.1, 0.15, 0.7]} />
        <meshStandardMaterial color={level > 3 ? "#fff" : "#696a65"} />
      </mesh>
      <mesh position={[0, -0.05, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.08, level >= 4 ? 6 : 12]} />
        <meshStandardMaterial color={level === 5 ? "#a4d6ff" : "#ffe797"} />
      </mesh>
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, 0, 0.4]}>
          <boxGeometry args={[0.12, 1.2, 0.1]} />
          <meshStandardMaterial color="#6b6b61" />
        </mesh>
      ))}
    </group>
  );
}
