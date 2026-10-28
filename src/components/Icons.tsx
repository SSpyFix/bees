import { beeFaceMarkup } from "../game/bees/faces";
export function BeeIcon({
  color = "#f6dd78",
  size = 32,
  face = "basic",
}: {
  color?: string;
  size?: number;
  face?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="bee-face"
      dangerouslySetInnerHTML={{ __html: beeFaceMarkup(face, color) }}
    />
  );
}
export function HoneyIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="m20 3 15 9v17l-15 8-15-8V12Z" fill="#edc35f" />
      <path d="m20 10 9 5v10l-9 5-9-5V15Z" stroke="#a67f35" strokeWidth="1.4" />
      <path
        d="M20 14c-1 4-5 6-5 9a5 5 0 0 0 10 0c0-3-4-5-5-9Z"
        fill="#fff0ae"
      />
    </svg>
  );
}
export function ItemIcon({ kind, size = 48 }: { kind: string; size?: number }) {
  const egg = kind.toLowerCase().includes("egg");
  const color =
    kind === "silverEgg"
      ? "#d8e1e9"
      : kind === "goldEgg"
        ? "#ffd533"
        : kind === "diamondEgg"
          ? "#77deff"
          : kind === "mythicEgg"
            ? "#d895f8"
            : kind === "egg"
              ? "#cb994c"
              : kind === "starTreat" || kind === "starJelly"
                ? "#ffdc3e"
                : kind === "strawberry" || kind === "redExtract"
                  ? "#ed4445"
                  : kind === "blueberry" || kind === "blueExtract"
                    ? "#4384ec"
                    : kind === "gumdrops"
                      ? "#d77aea"
                      : "#f2cf67";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className="item-icon"
    >
      {egg ? (
        <>
          <path
            d="M51 39c0 21-38 21-38 0C13 22 25 6 32 6s19 16 19 33Z"
            fill={color}
            stroke="#3a3a3a"
            strokeWidth="2"
          />
          <path
            d="M23 20c-4 6-6 11-6 17"
            stroke="#fff"
            strokeWidth="4"
            opacity=".5"
            fill="none"
          />
          {kind === "diamondEgg" && (
            <path d="m32 16 10 17-10 19-10-19Z" fill="#fff" opacity=".65" />
          )}
        </>
      ) : kind === "treat" || kind === "starTreat" ? (
        <>
          <rect
            x="10"
            y="15"
            width="44"
            height="35"
            rx="8"
            fill={kind === "treat" ? "#ad7b4e" : color}
            stroke="#684c31"
            strokeWidth="2"
          />
          {kind === "starTreat" ? (
            <path
              d="m32 20 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1Z"
              fill="#fff8b7"
            />
          ) : (
            [20, 32, 44].map((x, i) => (
              <circle
                key={x}
                cx={x}
                cy={i % 2 ? 38 : 28}
                r="3"
                fill="#724e32"
              />
            ))
          )}
        </>
      ) : kind === "jelly" || kind === "starJelly" ? (
        <>
          <rect
            x="13"
            y="13"
            width="38"
            height="41"
            rx="10"
            fill={kind === "jelly" ? "#729afa" : color}
            stroke="#333"
            strokeWidth="2"
          />
          <rect
            x="20"
            y="5"
            width="24"
            height="11"
            fill="#eee"
            stroke="#333"
            strokeWidth="2"
          />
          <path d="m22 29 7 3 3-10 4 10 7-3-3 13H25Z" fill="#fff6a7" />
        </>
      ) : kind === "ticket" ? (
        <>
          <path
            d="M7 15h50v11a6 6 0 0 0 0 12v11H7V38a6 6 0 0 0 0-12Z"
            fill="#ffda32"
            stroke="#6d5821"
            strokeWidth="2"
          />
          <path
            d="M44 18v28"
            stroke="#9b7f2d"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <text
            x="25"
            y="40"
            textAnchor="middle"
            fontSize="25"
            fontWeight="bold"
            fill="#7a5e12"
          >
            T
          </text>
        </>
      ) : kind === "booster" ? (
        <>
          <rect
            x="10"
            y="10"
            width="44"
            height="44"
            rx="7"
            fill="#fff"
            stroke="#666"
            strokeWidth="2"
          />
          {[
            [21, 21],
            [43, 21],
            [32, 32],
            [21, 43],
            [43, 43],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#333" />
          ))}
        </>
      ) : kind === "converter" ? (
        <>
          <rect
            x="12"
            y="10"
            width="40"
            height="45"
            rx="3"
            fill="#f4bf42"
            stroke="#555"
            strokeWidth="2"
          />
          <path d="m35 15-15 22h12l-3 14 17-23H33Z" fill="#fff8c8" />
        </>
      ) : (
        <>
          <circle
            cx="32"
            cy="33"
            r="22"
            fill={color}
            stroke="#444"
            strokeWidth="2"
          />
          <path
            d="m32 18 5 9 10 2-7 7 1 10-9-5-9 5 1-10-7-7 10-2Z"
            fill="#fff"
            opacity=".65"
          />
        </>
      )}
    </svg>
  );
}
export function GearArt({ type, level = 0 }: { type: string; level?: number }) {
  const color = ["#d4ab61", "#bfcdb4", "#94bcc0", "#cd9c93"][level % 4];
  return (
    <svg viewBox="0 0 100 80" aria-hidden="true">
      <ellipse cx="50" cy="67" rx="30" ry="5" fill="#47624b" opacity=".09" />
      {type === "tool" ? (
        <g transform="rotate(30 50 40)">
          <rect x="47" y="26" width="6" height="42" rx="3" fill="#9e8055" />
          <path
            d={
              level % 2
                ? "M28 15v20h44V15M39 15v20M50 15v20M61 15v20"
                : "M28 20q22-22 44 0v18q-22 15-44 0Z"
            }
            fill={color}
            stroke="#7e8e70"
            strokeWidth="3"
          />
          <path d="M47 48h6" stroke="#e7ce9d" strokeWidth="9" />
        </g>
      ) : type === "bag" ? (
        <g>
          <rect x="29" y="17" width="43" height="48" rx="11" fill={color} />
          <path d="M42 18v-5h18v5" stroke="#7c926f" strokeWidth="4" />
          <rect x="36" y="36" width="29" height="20" rx="5" fill="#eee2b7" />
          <path d="m50 39 7 4v8l-7 4-7-4v-8Z" fill="#d4ac5c" />
          <path
            d="M28 29h-4v24h5M73 29h4v24h-4"
            stroke="#a7b999"
            strokeWidth="4"
          />
        </g>
      ) : type === "egg" ? (
        <path
          d="M72 45c0 18-44 18-44 0S42 10 50 10s22 17 22 35Z"
          fill={color}
          stroke="#b4b895"
          strokeWidth="2"
        />
      ) : type === "hat" ? (
        <>
          <path d="M30 42V22q20-13 40 0v20" fill={color} />
          <ellipse cx="50" cy="44" rx="36" ry="9" fill="#e5c377" />
          <path d="M30 34h40" stroke="#779775" strokeWidth="5" />
        </>
      ) : (
        <>
          <path d="M35 21h27v28l16 4v13H29V47Z" fill={color} />
          <path d="M29 62h49" stroke="#6f8669" strokeWidth="5" />
        </>
      )}
    </svg>
  );
}
