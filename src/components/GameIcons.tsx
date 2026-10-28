export function MenuIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    inventory: (
      <>
        <path d="M8 40C3 35 7 14 15 8c5-4 14-4 19 0 8 7 12 27 7 32-6 5-27 5-33 0Z" />
        <ellipse
          cx="17"
          cy="14"
          rx="3"
          ry="5"
          fill="#7d8b87"
          transform="rotate(25 17 14)"
        />
      </>
    ),
    quests: (
      <>
        <path d="M4 7 19 4l6 5 17-3v36l-17 2-6-5-15 3Z" />
        <text x="16" y="34" fontSize="31" fontWeight="bold" fill="#7d8b87">
          ?
        </text>
      </>
    ),
    bees: (
      <>
        <path d="M7 7h34v35H7Z" />
        <path
          d="M15 14v7m16-7v7m-16 6q9 13 17 0"
          stroke="#7d8b87"
          strokeWidth="4"
          fill="none"
        />
      </>
    ),
    hive: (
      <>
        <path d="m14 29-5 16 12-5 5 5 4-17m2 0 9 17-12-5-5 5" />
        <path d="m24 2 5 5 7-1 2 7 6 4-3 7 1 7-7 3-4 6-7-3-7 3-4-6-7-3 1-7-3-7 6-4 2-7 7 1Z" />
        <path d="m24 10 4 7 8 1-6 6 1 8-7-4-7 4 1-8-6-6 8-1Z" fill="#7d8b87" />
      </>
    ),
    settings: (
      <path
        d="m19 2-2 7-6 3-7-1-3 9 6 4v5l-5 5 5 8 7-2 6 3 3 6 9-2 1-7 5-4 7 1 3-9-6-4-1-6 4-6-6-7-7 3-5-2-3-6Zm5 13a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z"
        fillRule="evenodd"
      />
    ),
    shop: (
      <>
        <path d="M9 16h30l7 28H2Z" />
        <path
          d="M17 16V9a7 7 0 0 1 14 0v7"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <text x="16" y="38" fontSize="25" fill="#7d8b87">
          $
        </text>
      </>
    ),
    map: (
      <>
        <path d="m3 8 14-4 14 5 14-5v35l-14 5-14-5-14 4Z" />
        <path d="M17 6v32M31 10v32" stroke="#7d8b87" strokeWidth="2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="currentColor">
      {paths[kind] ?? paths.inventory}
    </svg>
  );
}
export function ItemIcon({ id }: { id: string }) {
  return (
    <svg className="bss-item-icon" viewBox="0 0 80 80" aria-hidden="true">
      <g stroke="#252828" strokeWidth="3" strokeLinejoin="round">
        {id === "egg" ? (
          <>
            <path
              d="M63 51c0 24-46 24-46 0 0-15 15-39 23-39s23 24 23 39Z"
              fill="#f3de20"
            />
            <path
              d="M22 33q18 12 36 0l4 12q-22 12-44 0ZM19 54q21 12 42 0l-5 10q-16 8-32 0Z"
              fill="#26272c"
            />
          </>
        ) : id === "jelly" ? (
          <>
            <path d="M20 28h40v39q-20 10-40 0Z" fill="#4be4e5" />
            <path d="m22 24-6-15 13 7 10-11 11 11 13-7-6 15Z" fill="#ffdc24" />
            <path d="M19 26h42v9H19Z" fill="#fbf0be" />
            <path d="M30 46q10-16 20 0v12q-10 10-20 0Z" fill="#ee80ed" />
            <path d="M40 39v23M32 49h16" stroke="#a2ffff" />
          </>
        ) : id === "treat" || id === "starTreat" ? (
          <>
            <path
              d={
                id === "starTreat"
                  ? "m40 7 9 20 23 3-17 17 4 23-19-11-20 11 4-23L7 30l24-3Z"
                  : "M17 22 51 17l16 13-5 29-30 9-18-18Z"
              }
              fill={id === "starTreat" ? "#ffe648" : "#a66f32"}
            />
            {id === "treat" && (
              <g fill="#634016" stroke="none">
                <circle cx="29" cy="34" r="4" />
                <circle cx="48" cy="32" r="3" />
                <circle cx="44" cy="52" r="4" />
                <circle cx="26" cy="51" r="3" />
              </g>
            )}
          </>
        ) : id === "ticket" ? (
          <>
            <path
              d="M9 22h62v13a7 7 0 0 0 0 14v12H9V49a7 7 0 0 0 0-14Z"
              fill="#ffd52e"
            />
            <path
              d="M28 26v31M52 26v31"
              stroke="#f08c23"
              strokeDasharray="3 3"
            />
            <text x="32" y="50" stroke="none" fontSize="25" fill="#ef7930">
              ⌘
            </text>
          </>
        ) : id === "converter" ? (
          <>
            <path d="m22 20 36-6 13 18-8 32-42 7L9 50Z" fill="#faf6d1" />
            <path d="m25 28 24-5 10 12-6 19-24 6-9-17Z" fill="#f3cc33" />
            <path d="m28 32 18-4 8 10-5 12-16 5-7-13Z" fill="#c5eac1" />
          </>
        ) : (
          <>
            <rect x="16" y="15" width="48" height="51" rx="6" fill="#e4dfdc" />
            <circle cx="28" cy="28" r="5" fill="#576a8a" />
            <circle cx="52" cy="28" r="5" fill="#576a8a" />
            <circle cx="40" cy="40" r="5" fill="#576a8a" />
            <circle cx="28" cy="54" r="5" fill="#576a8a" />
            <circle cx="52" cy="54" r="5" fill="#576a8a" />
          </>
        )}
      </g>
    </svg>
  );
}
