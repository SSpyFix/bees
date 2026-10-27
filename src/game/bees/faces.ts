import { beeAppearance, BEE_APPEARANCES } from "./appearance";
/** Vector redraws of the supplied face sheet, shared by UI portraits and 3D decals. */
export function beeFaceMarkup(face: string, body: string) {
  const a = beeAppearance(face),
    ink = a.ink;
  const p = (d: string, c = ink, w = 3, fill = "none") =>
    `<path d="${d}" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const e = (x: number, y: number, rx: number, ry = rx, c = ink) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
  const r = (x: number, y: number, w: number, h: number, c = ink, rx = 0) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${c}"/>`;
  const eyes = (c = ink) => e(20, 25, 4, 8, c) + e(44, 25, 4, 8, c);
  const grin = (c = ink) => p("M15 40 Q32 54 49 40", c, 3);
  const stripes = (c = ink) =>
    p("M3 29l14 6M1 38l16 2M61 29l-14 6M63 38l-16 2", c, 2);
  let art = "";
  switch (face) {
    case "basic":
      art =
        p("M18 17q4-3 4 3v11h-4m26-14q4-3 4 3v11h-4", ink, 5) +
        p("m22 44 9 9 13-13", ink, 4);
      break;
    case "rad":
      art =
        p(
          "M5 17q24 10 54 0l-2 17q-11 8-23 0l-3-7-2 7q-12 9-23 0Z",
          ink,
          1,
          ink,
        ) + p("M28 43q5 6 10 5", ink, 4);
      break;
    case "exhausted":
      art =
        p("M13 17q10-2 12-8M39 9q4 7 12 9", ink, 3) +
        p("M9 27q10 2 18-5M37 22q10 7 18 5", ink, 4) +
        p("M11 30q8 1 14-4M39 26q7 5 14 4", "#778b96", 6) +
        p("M27 47h10", ink, 2);
      break;
    case "baby":
      art =
        e(23, 29, 4) +
        e(42, 29, 4) +
        e(13, 35, 5, 3, "#c788b0") +
        e(52, 35, 5, 3, "#c788b0") +
        e(33, 36, 2, 1.5) +
        p("M29 42q4 4 8 0", ink, 2);
      break;
    case "shy":
      art =
        e(22, 26, 2.5) +
        e(42, 26, 2.5) +
        [12, 16, 20, 46, 50, 54].map((x) => p(`m${x} 31-2 6`, ink, 2)).join("");
      break;
    case "bear":
      art =
        e(15, 30, 15, 14, "#9d754a") +
        e(49, 30, 15, 14, "#9d754a") +
        p("M21 18v13m22-13v13", ink, 5) +
        e(32, 46, 13, 13, "#c49861") +
        p("M27 43q5-5 10 0l-2 6q-3 3-6 0Z", ink, 1, ink);
      break;
    case "puppy":
      art =
        e(16, 26, 13, 12, "#8f8763") +
        e(50, 26, 6, 7, "#8f8763") +
        p("M23 23q5 1 4 5m18-14q7-4 7 2M43 24q5-1 5 3", ink, 4) +
        p("m29 37 8 0-4 5Z", ink, 1, ink) +
        p("M26 46q8 7 16 0", ink, 2);
      break;
    case "bomber":
      art =
        e(18, 28, 12) +
        e(46, 28, 12) +
        r(24, 25, 16, 5) +
        r(0, 27, 8, 5) +
        r(56, 27, 8, 5) +
        e(14, 24, 3, 2, "#cbd7db") +
        e(42, 24, 3, 2, "#cbd7db");
      break;
    case "rage":
      art =
        p("M15 27q5-4 10 0m14 0q5-4 10-1", ink, 4) +
        p("M24 39q8 8 16 0l5 5v10q-12 11-25 0V45Z", ink, 1, ink);
      break;
    case "fire":
      art =
        p(
          "M15 6q4 10 2 14l4-3q4 12-4 16-11 1-10-10l3-8 1 7Zm32 0q-4 10-2 14l-4-3q-4 12 4 16 11 1 10-10l-3-8-1 7Z",
          ink,
          1,
          ink,
        ) + p("m12 44 9 9 10-11 10 11 10-12", ink, 3);
      break;
    case "carpenter":
      art =
        e(21, 25, 7, 10, "#f8f4e9") +
        e(44, 25, 7, 10, "#f8f4e9") +
        e(23, 29, 3, 6) +
        e(42, 29, 3, 6) +
        r(6, 35, 13, 6) +
        r(48, 35, 12, 6) +
        p("M26 48q7 6 14 0", ink, 2);
      break;
    case "buoyant":
      art =
        e(12, 19, 3) +
        e(51, 11, 3) +
        p("M10 31q8-8 12 0m18-9q8 10 12-1m-9 16q-1 10-10 12-8-1-8-7", ink, 5) +
        p("m5 34 5-7 8 3M48 29l6-4", ink, 2);
      break;
    case "cobalt":
      art =
        p(
          "m0 5 32 15L64 5v10l-10 7 10 4-12 6 12 4-17 5H17L0 36l12-4L0 26l10-4L0 15Z",
          ink,
          0,
          ink,
        ) +
        e(32, 39, 12, 8, a.background) +
        p("M22 43q10 5 20 0", ink, 3);
      break;
    case "tabby":
      art =
        p("M19 0l2 9m11-9v11M43 0l-2 9", ink, 3) +
        p("M8 27q8-7 15 0m18 0q8-7 15 0", ink, 6) +
        stripes() +
        p("m27 35 10 0-5 6Z", ink, 1, ink) +
        p("M21 43q3 9 11 3 8 6 11-3M32 39v8", ink, 2);
      break;
    case "brave":
      art =
        p("M9 16q10 7 18 3m10 0q9 4 18-3", ink, 3) +
        p("M21 22q4 8-3 9m26-9q-4 8 3 9", ink, 5) +
        r(4, 38, 14, 5) +
        r(47, 38, 13, 5) +
        p("m26 38 6-3 5 3-3 5 5 7-7-3-7 3 4-7Z", ink, 1, ink);
      break;
    case "stubborn":
      art =
        p("M2 10h60", ink, 4) +
        e(24, 27, 2, 4) +
        e(39, 27, 2, 4) +
        p("M14 44h36m-34-3-2 7m34-6 2 6", ink, 3);
      break;
    case "frosty":
      art =
        e(19, 24, 5, 7) +
        e(44, 24, 5, 7) +
        p("M10 23h19m6 0h19", a.background, 2) +
        p("m8 32 18 2-18 7m49-9-18 2 18 7", ink, 1, ink) +
        [12, 20, 29, 38, 47, 54]
          .map((x, i) => e(x, 43 + Math.sin((i / 5) * Math.PI) * 6, 3))
          .join("");
      break;
    case "spicy":
      art =
        p(
          "M18 8q-7 10 1 15 6 3 1 10-8 3-8-5m33-20q7 10-1 15-6 3-1 10 8 3 8-5",
          ink,
          4,
        ) + p("m13 44 9 5 5-8 6 13 8-9 5 4 7-11", ink, 3);
      break;
    case "fuzzy":
      art =
        p(
          "m6 17 5 6 2-10 2 10 4-6-2 9 9-4-6 8-10-2m48-11-5 6-2-10-2 10-4-6 2 9-9-4 6 8 10-2",
          ink,
          1.5,
        ) +
        p("m17 31 9 1m13-1 9 1m-31 9 7 2 1 8 8-4 7 7 7-7 8 4 1-8 6-2", ink, 2);
      break;
    case "crimson":
      art =
        p(
          "M0 0h13l19 16L51 0h13v15L46 32l18 17v15H51L32 45 13 64H0V49l18-17L0 15Z",
          ink,
          0,
          ink,
        ) +
        p("M11 25q7-5 12 0m18 0q7-5 12 0", a.background, 4) +
        p("M27 42q5 4 10 0", ink, 2);
      break;
    case "vicious":
      art =
        p(
          "M7 8q5 20 18 26Q12 33 7 8m50 0q-5 20-18 26Q52 33 57 8",
          ink,
          1,
          ink,
        ) + p("M23 44q6-4 9 1 6 4 11-1", ink, 5);
      break;
    case "bumble":
      art =
        e(22, 22, 3, 5) +
        e(42, 24, 3, 5) +
        e(32, 33, 3, 2) +
        p("M12 46q16 9 35 0M16 41l-4 7m34-6 3 5", ink, 4);
      break;
    case "bubble":
      art =
        p("M14 15q7 8 0 15m30-15q-7 8 0 15", ink, 8) +
        e(32, 46, 9, 9) +
        e(32, 46, 4, 5, a.background);
      break;
    case "honey":
      art =
        p("M9 28q4-7 12-2m23 0q7-5 11 1", ink, 5) +
        p("M9 42q21 14 46 0m-43-3-4 8m45-8 4 7", ink, 2);
      break;
    case "diamond":
      art =
        p(
          "m17 9 3 11 6 5-6 6-3 12-3-12-6-6 6-5Zm29 0 3 11 6 5-6 6-3 12-3-12-6-6 6-5Z",
          ink,
          0.5,
          ink,
        ) + p("M22 44q10 15 20 0l-10 3Z", ink, 1, ink);
      break;
    case "precise":
      art =
        r(32, 0, 32, 64, "#ee4757") +
        p("M8 27q7-7 14 0m20-1q7-7 14 0", ink, 3) +
        p("M16 27v13m33-14v14", ink, 5);
      break;
    case "digital": {
      const points = [
        [19, 23],
        [18, 22],
        [18, 23],
        [18, 24],
        [19, 22],
        [19, 24],
        [20, 22],
        [20, 23],
        [20, 24],
        [19, 25],
        [43, 22],
        [42, 22],
        [42, 23],
        [42, 24],
        [43, 23],
        [43, 24],
        [44, 22],
        [44, 23],
        [44, 24],
        [43, 25],
        [18, 44],
        [19, 45],
        [20, 46],
        [22, 47],
        [24, 48],
        [27, 49],
        [30, 50],
        [33, 50],
        [36, 49],
        [39, 48],
        [42, 47],
        [44, 46],
        [46, 44],
      ];
      art = points.map(([x, y]) => r(x - 1, y - 1, 2.3, 2.3)).join("");
      break;
    }
    case "windy":
      art =
        p(
          "M17 20q-13-4-12 8 5 10 10 2 2-8-4-3m36-16q11 6 7 17-8 9-10-1-1-7 4-4",
          ink,
          3,
        ) + p("M34 38q-11 17-2 17 7-4 3-9", ink, 5);
      break;
    case "cool":
      art =
        p("M10 22q8 5 13 0m18 0q8 5 13 0", ink, 7) +
        p("M14 40q5 17 17 12 9-2 15-12l-10 2-3 5-11-4Z", ink, 1, ink);
      break;
    case "bucko":
      art =
        p("m14 18 10-3m16 0 11 4", ink, 4) +
        p("M18 22q-7 11 2 12m24-12q7 11-2 12", ink, 5) +
        p("M14 41q19 17 35-2l-10 2-2 6-9-5Z", ink, 1, ink) +
        p("m3 35 10 6-10 5 10 4m48-15-10 6 10 5-10 4", ink, 3);
      break;
    case "riley":
      art =
        p("M10 17q11 0 17 9m10 0q6-9 17-9", ink, 4) +
        p("M20 25q-6 10 1 10m22-10q6 10-1 10", ink, 4) +
        p("M23 48q9-9 18 0", ink, 2);
      break;
    case "lion":
      art =
        p("m8 13 14 8m20 0 14-8", ink, 4) +
        e(20, 28, 4, 7) +
        e(45, 28, 4, 7) +
        p("m28 35 7 0-2 7h-2Z", ink, 1, ink) +
        p("M18 44q2 10 14 6 12 4 14-6M32 40v10", ink, 2) +
        [16, 23, 43, 50].map((x, i) => e(x, 38 + (i % 2) * 6, 1.8)).join("");
      break;
    case "demon":
      art =
        p(
          "M17 7 22 17 22 32 17 39 12 32 12 17Zm30 0-5 10v15l5 7 5-7V17Z",
          ink,
          1,
          ink,
        ) + p("m5 37 9 8 12 2m33-10-9 8-12 2m-11 5 5 4 6-4", ink, 3);
      break;
    case "festive":
      art =
        p("M14 29q4 3 7-2l1 4m19-2q4 3 7-2l1 4", ink, 2) +
        p("M26 43q6 6 12 0", ink, 3);
      break;
    case "hasty":
      art =
        p("M15 11q5-7 10-1m15-1q5-6 10 1", ink, 2) +
        p("M18 23q10 9 1 14-6-3-1-8m27-6q9 10-1 14-5-3-1-8", ink, 2) +
        p("m13 46 5-1m29 0 5 1m-22 6 6-3", ink, 2);
      break;
    case "commander":
      art =
        r(6, 18, 23, 7) +
        r(35, 18, 23, 7) +
        p("M19 24v9m26-9v9", ink, 5) +
        p("m7 41 4-2-1 6m44-4-4-2 1 6m-28 2 7 4 8-4", ink, 3);
      break;
    case "rascal":
      art =
        p("m15 19 8 3m18 0 8-3m-35 7h11m14 0h11", ink, 3) +
        p("M18 32h7m14 0h7", ink, 4) +
        p("m11 34-8 5 8 7-8 4m50-16 8 5-8 7 8 4", ink, 2, ink) +
        p("M24 44q8 8 17 0", ink, 3);
      break;
    case "music":
      art =
        p("M20 10v26m0-22 13 2M45 4l3 25", ink, 1.5) +
        e(15, 38, 6, 4) +
        e(43, 30, 6, 4) +
        p("M18 49q17 16 29-4", ink, 1.5) +
        e(52, 27, 1);
      break;
    case "tadpole":
      art =
        p(
          "M19 23q-1-15-7-5l-1 12q7 3 8-7m26 0q1-15 7-5l1 12q-7 3-8-7",
          ink,
          3,
        ) +
        p("M9 25h13m21 0h13", ink, 2) +
        p("M24 43q1 7 8 3 6 6 10-3", ink, 2);
      break;
    case "gummy":
      art =
        p("M17 17q7-8 7 4l-7 12m23-16q7-8 7 4l-7 12", ink, 6) +
        p("M17 43q13 18 29 0l-6-1-8 6-9-6Z", ink, 1, ink);
      break;
    case "looker":
      art =
        e(18, 28, 9, 14, "#f4f4e8") +
        e(46, 28, 9, 14, "#f4f4e8") +
        e(21, 29, 6, 13) +
        e(49, 29, 6, 13);
      break;
    case "demo":
      art =
        p("M0 15h22q10 12 0 27H0Zm64 0H42q-10 12 0 27h22Z", ink, 0, ink) +
        e(18, 28, 4, 9, a.background) +
        e(46, 28, 4, 9, a.background);
      break;
    case "shocked":
      art =
        p("M14 13v11m0-14 3 2m30 1v11m0-14-3 2", ink, 4) +
        p("m25 36 8-3 5 6 1 15-7-4-7 3Z", ink, 1, ink) +
        p("m30 40-1 6m5-6 1 6", a.background, 2);
      break;
    case "ninja":
      art =
        p("M0 10q32 19 64 0v27q-32 13-64 0Z", ink, 0, ink) +
        p("m15 27 9 4m16 0 9-4", a.background, 5);
      break;
    case "vector":
      art =
        p("M0 0q16 2 32 64Q47 2 64 0Z", ink, 0, ink) +
        p("m14 33 6 10m30-10-6 10", ink, 2);
      break;
    case "photon":
      art =
        p("M0 6q32 11 64 0v9H0Z", ink, 0, ink) +
        [4, 13, 22, 31, 40, 49, 58].map((x) => r(x, 16, 4, 19)).join("") +
        p("m23 45 9 7 9-7", ink, 4);
      break;
    default:
      art = eyes() + grin();
  }
  return `<rect width="64" height="64" fill="${BEE_APPEARANCES[face] ? a.background : body}"/>${art}`;
}
export function beeFaceSvg(face: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">${beeFaceMarkup(face, body)}</svg>`;
}
