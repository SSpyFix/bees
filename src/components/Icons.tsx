export function BeeIcon({
  color = "#e6b847",
  size = 32,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="17"
        cy="12"
        rx="10"
        ry="7"
        transform="rotate(-25 17 12)"
        fill="#e4ecd6"
      />
      <ellipse
        cx="33"
        cy="12"
        rx="10"
        ry="7"
        transform="rotate(25 33 12)"
        fill="#e4ecd6"
      />
      <rect x="8" y="16" width="33" height="24" rx="10" fill={color} />
      <path d="M18 17v22M29 17v22" stroke="#4c4a32" strokeWidth="5" />
      <circle cx="37" cy="24" r="2" fill="#34493b" />
      <path d="m4 28 5-3v6Z" fill="#4c4a32" />
    </svg>
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
