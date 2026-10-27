type Vec = [number, number, number];
const block = (key: string, p: Vec, s: Vec, c: string, r: Vec = [0, 0, 0]) => (
  <mesh key={key} position={p} scale={s} rotation={r}>
    <boxGeometry />
    <meshStandardMaterial color={c} />
  </mesh>
);
const ball = (key: string, p: Vec, s: Vec, c: string) => (
  <mesh key={key} position={p} scale={s}>
    <sphereGeometry args={[1, 10, 8]} />
    <meshStandardMaterial color={c} />
  </mesh>
);
const cone = (
  key: string,
  p: Vec,
  r: number,
  h: number,
  c: string,
  rotation: Vec = [0, 0, 0],
) => (
  <mesh key={key} position={p} rotation={rotation}>
    <coneGeometry args={[r, h, 5]} />
    <meshStandardMaterial color={c} />
  </mesh>
);
/** Recognizable species details are part of every 3D bee, including hive displays. */
export default function BeeDecorations({ face }: { face: string }) {
  switch (face) {
    case "frosty":
      return (
        <group>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.76, 0.76, 0.12, 16]} />
            <meshStandardMaterial color="#172b35" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.62, 12]} />
            <meshStandardMaterial color="#172b35" />
          </mesh>
          <mesh position={[0, 0.86, 0]}>
            <cylinderGeometry args={[0.46, 0.46, 0.15, 12]} />
            <meshStandardMaterial color="#76bde9" />
          </mesh>
        </group>
      );
    case "carpenter":
      return (
        <group position={[0.67, 0.55, -0.1]} rotation={[0, 0, -0.25]}>
          {block("handle", [0, 0.25, 0], [0.12, 0.9, 0.12], "#b48b56")}
          {block("hammer", [0, 0.8, 0], [0.85, 0.34, 0.4], "#574639")}
          {block("cap", [-0.38, 0.8, 0], [0.12, 0.39, 0.43], "#9ca3a2")}
        </group>
      );
    case "demon":
      return (
        <group>
          {[-1, 1].map((i) =>
            cone(String(i), [i * 0.45, 1, 0], 0.22, 0.9, "#250a14", [
              0,
              0,
              -i * 0.3,
            ]),
          )}
        </group>
      );
    case "vicious":
      return (
        <group>
          {[-0.48, 0, 0.48].flatMap((x, i) =>
            [-0.32, 0.32].map((z, j) =>
              cone(
                `${i}-${j}`,
                [x, 0.98, z],
                0.15,
                0.8 + (i === 1 ? 0.15 : 0),
                "#13202b",
                [j === 0 ? -0.18 : 0.18, 0, -x * 0.3],
              ),
            ),
          )}
        </group>
      );
    case "diamond":
      return (
        <mesh position={[0, 1.02, 0]} scale={[0.45, 0.65, 0.45]}>
          <octahedronGeometry />
          <meshStandardMaterial
            color="#a8efff"
            emissive="#2c8bbc"
            emissiveIntensity={0.25}
            metalness={0.3}
            roughness={0.25}
          />
        </mesh>
      );
    case "lion":
      return (
        <group>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return cone(
              String(i),
              [Math.sin(a) * 0.76, Math.cos(a) * 0.76, 0.06],
              0.24,
              0.5,
              "#ba7628",
              [0, 0, -a],
            );
          })}
        </group>
      );
    case "music":
      return (
        <group>
          {block("stem", [-0.2, 1.05, -0.18], [0.055, 0.68, 0.055], "#eff2ef")}
          {ball("note", [-0.35, 0.76, -0.18], [0.19, 0.11, 0.12], "#eff2ef")}
          {block(
            "flag",
            [-0.05, 1.34, -0.18],
            [0.35, 0.06, 0.07],
            "#eff2ef",
            [0, 0, -0.2],
          )}
        </group>
      );
    case "ninja":
      return (
        <group>
          {block("headband", [0, 0.5, 0], [1.32, 0.17, 1.32], "#176fb1")}
          {block(
            "tail-1",
            [0.65, 0.55, -0.8],
            [0.16, 0.15, 0.85],
            "#176fb1",
            [0, 0.45, 0.2],
          )}
          {block(
            "tail-2",
            [0.6, 0.35, -0.8],
            [0.15, 0.15, 0.8],
            "#176fb1",
            [0, -0.2, 0.15],
          )}
        </group>
      );
    case "buoyant":
      return (
        <group>
          {block("string", [0, 1.1, -0.15], [0.035, 0.9, 0.035], "#e4eff8")}
          {ball("balloon", [0, 1.94, -0.15], [0.48, 0.66, 0.48], "#3c8cef")}
          {cone("knot", [0, 1.3, -0.15], 0.09, 0.15, "#3c8cef")}
        </group>
      );
    case "fuzzy":
      return (
        <group>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * Math.PI) / 8;
            return cone(
              String(i),
              [Math.sin(a) * 0.66, Math.cos(a) * 0.66, -0.03],
              0.22,
              0.32,
              "#bd9063",
              [0, 0, -a],
            );
          })}
        </group>
      );
    case "precise":
      return (
        <group>
          {block("mount", [0, 0.72, -0.12], [0.5, 0.2, 0.5], "#761322")}
          <mesh position={[0, 0.92, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.23, 0.23, 0.65, 12]} />
            <meshStandardMaterial color="#7f1120" />
          </mesh>
          <mesh position={[0, 0.92, 0.31]}>
            <circleGeometry args={[0.18, 12]} />
            <meshBasicMaterial color="#ff8792" />
          </mesh>
        </group>
      );
    case "spicy":
      return (
        <group>
          {[-0.4, 0.4].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.93, -0.35]}>
                <cylinderGeometry args={[0.17, 0.17, 0.8, 10]} />
                <meshStandardMaterial color="#d7432a" />
              </mesh>
              <mesh position={[x, 1.34, -0.35]}>
                <cylinderGeometry args={[0.19, 0.19, 0.1, 10]} />
                <meshStandardMaterial color="#f8a335" />
              </mesh>
              <mesh position={[x, 1.4, -0.35]}>
                <cylinderGeometry args={[0.12, 0.12, 0.025, 10]} />
                <meshBasicMaterial color="#20272c" />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "vector":
      return (
        <group>
          {[-1, 1].map((i) => (
            <mesh
              key={i}
              position={[i * 0.75, 0.5, -0.1]}
              rotation={[0, 0, -i * 0.6]}
            >
              <coneGeometry args={[0.3, 0.9, 3]} />
              <meshStandardMaterial color="#f3f5ee" />
            </mesh>
          ))}
        </group>
      );
    case "bear":
      return (
        <group>
          {[-0.55, 0.55].map((x) =>
            ball(String(x), [x, 0.65, 0], [0.3, 0.3, 0.18], "#845a34"),
          )}
        </group>
      );
    case "puppy":
      return (
        <group>
          {[-0.7, 0.7].map((x) =>
            ball(String(x), [x, 0.12, 0.1], [0.21, 0.5, 0.18], "#786d48"),
          )}
        </group>
      );
    case "tabby":
      return (
        <group>
          {[-0.5, 0.5].map((x) =>
            cone(String(x), [x, 0.87, 0.04], 0.25, 0.55, "#c77a23"),
          )}
          {block(
            "tail",
            [0.5, -0.15, -0.9],
            [0.17, 0.16, 0.85],
            "#a56622",
            [0, -0.5, 0.2],
          )}
        </group>
      );
    case "cobalt":
    case "crimson":
      return (
        <group>
          {[-1, 1].map((i) => (
            <mesh
              key={i}
              position={[i * 0.7, 0.35, -0.1]}
              rotation={[0, 0, -i * 0.8]}
            >
              <coneGeometry args={[0.27, 0.65, 3]} />
              <meshStandardMaterial color="#f3f6fa" />
            </mesh>
          ))}
        </group>
      );
    case "digital":
      return (
        <group>
          {block("antenna", [0, 1, -0.1], [0.05, 0.7, 0.05], "#353d3a")}
          {ball("tip", [0, 1.39, -0.1], [0.14, 0.14, 0.14], "#f067e9")}
          {block("base", [0, 0.66, 0], [1.38, 0.11, 1.36], "#aab0ad")}
          {[-0.76, 0.76].map((x) =>
            block(String(x), [x, 0, 0], [0.2, 0.6, 0.8], "#727d7d"),
          )}
        </group>
      );
    case "festive":
      return (
        <group>
          {block("lid", [0, 0.69, 0], [1.42, 0.2, 1.42], "#c62b31")}
          {block("ribbon-x", [0, 0.8, 0], [1.43, 0.035, 0.18], "#f3f2df")}
          {block("ribbon-z", [0, 0.8, 0], [0.18, 0.035, 1.43], "#f3f2df")}
          {[-0.22, 0.22].map((x) => (
            <mesh
              key={x}
              position={[x, 0.94, 0]}
              rotation={[Math.PI / 2, 0, x < 0 ? -0.5 : 0.5]}
            >
              <torusGeometry args={[0.19, 0.065, 5, 10]} />
              <meshStandardMaterial color="#f3f2df" />
            </mesh>
          ))}
        </group>
      );
    case "gummy":
      return (
        <group>
          {[-0.35, 0, 0.35].map((x, i) =>
            ball(
              String(x),
              [x, 0.75, i % 2 ? -0.2 : 0.1],
              [0.21, 0.24, 0.21],
              i % 2 ? "#66edb0" : "#ec7dec",
            ),
          )}
        </group>
      );
    case "photon":
      return (
        <group>
          {block("crest", [0, 0.72, 0], [1.3, 0.15, 0.2], "#f4ff95")}
          {[-0.7, 0.7].map((x) =>
            block(String(x), [x, 0.1, -0.1], [0.1, 1.2, 0.55], "#f7ffcf", [
              0,
              0,
              x < 0 ? -0.5 : 0.5,
            ]),
          )}
        </group>
      );
    case "windy":
      return (
        <group>
          {[-0.45, 0, 0.45].map((x, i) =>
            ball(
              String(x),
              [x, 0.78 + (i === 1 ? 0.1 : 0), 0],
              [0.35, 0.28, 0.3],
              "#effaff",
            ),
          )}
        </group>
      );
    default:
      return null;
  }
}
