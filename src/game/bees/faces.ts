/** Reconstructed species portraits: shared between inventory tiles and cube faces. */
export function beeFaceMarkup(face: string, body: string) {
  const dark = ["ninja", "bucko", "demon", "vicious", "riley", "rage"].includes(
      face,
    ),
    ink = dark ? "#ffffff" : "#161616";
  const circle = (x: number, y: number, r: number, c = ink) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const path = (d: string, c = ink, w = 3, fill = "none") =>
    `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let eyes = circle(20, 25, 4) + circle(44, 25, 4),
    mouth = path("M19 39 Q32 54 45 39");
  let extra = "";
  if (
    [
      "brave",
      "bucko",
      "commander",
      "rage",
      "riley",
      "demon",
      "precise",
      "vicious",
      "spicy",
    ].includes(face)
  ) {
    extra += path("M12 14 L26 20 M52 14 L38 20", ink, 5);
    mouth = path("M21 45 Q32 36 43 45");
  }
  if (["bumble", "exhausted", "stubborn", "shy"].includes(face)) {
    eyes = path("M14 25 Q20 21 26 25 M38 25 Q44 21 50 25", ink, 4);
    mouth = path("M22 43 L42 43");
  }
  if (["cool", "demo"].includes(face)) {
    eyes = `<path d="M9 18h46v6H9Z" fill="#111"/><rect x="11" y="20" width="19" height="14" rx="5" fill="#111"/><rect x="34" y="20" width="19" height="14" rx="5" fill="#111"/>`;
    mouth = path("M22 43 Q32 49 42 41");
  }
  if (face === "looker") {
    eyes =
      circle(19, 25, 9) +
      circle(45, 25, 9) +
      circle(19, 23, 4, "white") +
      circle(45, 23, 4, "white");
  }
  if (
    [
      "hasty",
      "rad",
      "buoyant",
      "honey",
      "gummy",
      "festive",
      "bear",
      "puppy",
      "tabby",
    ].includes(face)
  ) {
    mouth = `<path d="M17 37 Q32 43 47 37 Q46 57 32 55 Q18 54 17 37Z" fill="${ink}"/><path d="M21 40h22v5H21Z" fill="white"/>`;
  }
  if (["shocked", "tadpole", "baby"].includes(face))
    mouth = `<ellipse cx="32" cy="45" rx="7" ry="9" fill="${ink}"/>`;
  if (face === "baby") {
    extra += `<path d="M15 30q-9 12 0 12t0-12M49 30q-9 12 0 12t0-12" fill="#328fe8"/>`;
    eyes = path("M11 24q8-8 15 0M38 24q8-8 15 0", ink, 4);
  }
  if (face === "ninja") {
    extra += `<path d="M0 17h64v19H0Z" fill="#101627"/>`;
    eyes = path("M12 24l14 4M52 24l-14 4", "#fff", 4);
    mouth = "";
  }
  if (["diamond", "photon", "frosty"].includes(face)) {
    eyes = `<path d="m20 13 7 12-7 12-7-12Zm24 0 7 12-7 12-7-12Z" fill="${face === "photon" ? "#444" : "#f4ffff"}"/>`;
  }
  if (["fire", "spicy"].includes(face)) {
    extra += `<path d="m2 64 5-24 7 11 7-30 8 23 8-7 5 17 9-26 11 36" fill="#ffac00"/>`;
  }
  if (face === "demon") {
    extra += `<path d="M7 16 4 1l18 15M57 16 60 1 42 16" fill="#17101b"/>`;
    mouth = '<path d="M19 38h26L33 54Z" fill="white"/>';
  }
  if (face === "rage")
    mouth =
      '<path d="M19 36h26v20H19Z" fill="#191010"/><path d="M19 37h26v5H19Z" fill="white"/>';
  if (["bear", "puppy"].includes(face)) {
    extra +=
      circle(8, 8, 8, "#755031") +
      circle(56, 8, 8, "#755031") +
      `<ellipse cx="32" cy="42" rx="17" ry="13" fill="#d9b77d"/>`;
    mouth = circle(32, 38, 5, "#242019") + path("M24 46q8 7 16 0");
  }
  if (face === "tabby") {
    extra += `<path d="m4 18 2-16 16 14M60 18 58 2 42 16M6 38l16 4M3 46l17 0M58 38l-16 4M61 46l-17 0M24 0l5 13M40 0l-5 13" stroke="#704c25" stroke-width="4" fill="#b47e2f"/>`;
    mouth = path("M25 43q7 9 14 0") + path("m28 36 4 4 4-4", ink, 2, ink);
  }
  if (face === "music") {
    extra += `<path d="M12 5v12m0-9 9-2M44 4v10m0-8 8-1" stroke="#313343" stroke-width="4"/>`;
    eyes = path("M13 26q7-7 14 0M37 26q7-7 14 0");
  }
  if (face === "vector") {
    eyes = '<path d="M11 17h16L19 32ZM37 17h16L45 32Z" fill="#b22721"/>';
    mouth = '<path d="m20 48 12-21 12 21Z" fill="#b22721"/>';
  }
  if (face === "precise") {
    eyes = [20, 44]
      .map(
        (x) =>
          `<circle cx="${x}" cy="25" r="9" fill="none" stroke="#fff" stroke-width="2"/><path d="M${x - 12} 25h24M${x} 13v24" stroke="#fff" stroke-width="2"/>`,
      )
      .join("");
  }
  if (face === "digital") {
    eyes =
      '<path d="M12 15h16v6h-6v7H12Zm24 0h16v13H42v-7h-6Z" fill="#183f20"/>';
    mouth = '<path d="M15 38h8v7h18v-7h8v14H15Z" fill="#183f20"/>';
    extra +=
      '<path d="M0 4h64M0 11h64M0 57h64" stroke="#79e487" opacity=".45"/>';
  }
  if (["cobalt", "crimson"].includes(face)) {
    eyes = '<path d="m6 15 26 8L58 15 45 35H19Z" fill="white"/>';
    mouth = path("M22 45h20", "#fff");
  }
  if (face === "windy") {
    eyes = path("M10 24q9-9 19 0M36 24q9-9 19 0", "#626c76", 3);
    extra += path("M9 9q18-9 25 0t22-1", "#d0d8df", 3);
    mouth = path("M20 39q12 14 24 0", "#7b8790", 3);
  }
  if (face === "fuzzy")
    extra +=
      '<path d="m0 0 7 5L13 0l7 5L28 0l6 5L41 0l7 5L55 0l9 5v59l-8-5-8 5-8-5-8 5-8-5-8 5-8-5-8 5Z" fill="none" stroke="#ad7b38" stroke-width="7"/>';
  if (face === "festive")
    extra +=
      '<path d="M0 0h64v12H0Z" fill="#e11c24"/><path d="M0 10h64v7H0Z" fill="white"/><path d="m8 45 24 19 24-19-12 2-12 9-12-9Z" fill="white"/>';
  if (face === "vicious")
    extra +=
      '<path d="M4 0 11 12 18 0 25 12 32 0 39 12 46 0 53 12 60 0" fill="#17202c"/><path d="m18 39 8 13 6-13 6 13 8-13" fill="white"/>';
  if (face === "carpenter")
    extra +=
      '<path d="M6 3v58M58 3v58M31 1v9" stroke="#99714c" stroke-width="3"/>';
  return `<rect width="64" height="64" fill="${body}"/>${extra}${eyes}${mouth}`;
}
export function beeFaceSvg(face: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">${beeFaceMarkup(face, body)}</svg>`;
}
