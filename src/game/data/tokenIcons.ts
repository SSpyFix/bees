/** Locally drawn token symbols based on the supplied ability-icon reference. */
const aliases: Record<string, string> = {
  bomb: "buzz-bomb",
  blue: "blue-boost",
  red: "red-boost",
  white: "white-boost",
  pollen: "inspire",
  convert: "honey-gift",
  critical: "focus",
  precision: "precision",
  luck: "baby-love",
  "festive-blessing": "festive-gift",
};
export function tokenIconKind(kind: string) {
  if (kind.startsWith("field:")) return "pollen-mark";
  if (kind.startsWith("corrupt:")) return "glitch";
  if (kind.startsWith("hacked:")) return "mind-hack";
  return aliases[kind] ?? kind;
}
export function tokenIconMarkup(input: string) {
  const kind = tokenIconKind(input),
    plus = kind.endsWith("-plus");
  let bg = "#f1f2ef",
    ink = "#1b2428",
    art = "";
  const p = (d: string, c = ink, w = 3, fill = "none") =>
    `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}"/>`;
  const c = (x: number, y: number, r: number, fill = ink) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const e = (x: number, y: number, rx: number, ry: number, fill = ink) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
  const r = (x: number, y: number, w: number, h: number, fill = ink) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  const flower = (color: string, center: string) =>
    [0, 1, 2, 3]
      .map((i) => {
        const a = (i * Math.PI) / 2;
        return c(32 + Math.cos(a) * 12, 32 + Math.sin(a) * 12, 10, color);
      })
      .join("") + c(32, 32, 7, center);
  const star = p(
    "m32 5 8 18 20 2-15 14 5 20-18-10-18 10 5-20L4 25l20-2Z",
    "#fff000",
    1,
    "#fff000",
  );
  const robot = (color: string) =>
    p("M31 9v7", color, 3) +
    c(31, 8, 3, "#f0e764") +
    r(20, 16, 24, 19, "#cfd4ce") +
    r(23, 20, 18, 12, "#63766f") +
    c(27, 25, 2, "#7dff4b") +
    c(36, 25, 2, "#7dff4b") +
    r(23, 36, 18, 15, color) +
    r(10, 34, 12, 8, "#cfd4ce") +
    r(42, 34, 12, 8, "#cfd4ce") +
    r(20, 51, 10, 8, "#cfd4ce") +
    r(35, 51, 10, 8, "#cfd4ce");
  if (
    kind.includes("bomb") &&
    !kind.includes("sync") &&
    kind !== "fuzz-bombs"
  ) {
    bg = kind.startsWith("blue")
      ? "#3285ed"
      : kind.startsWith("red")
        ? "#ee3927"
        : "#ffab16";
    art =
      e(33, 39, 13, 12) +
      e(13, 26, 8, 10) +
      e(29, 15, 8, 10) +
      e(47, 19, 8, 10) +
      e(52, 37, 7, 10);
  } else
    switch (kind) {
      case "baby-love":
        bg = "#8bdaec";
        art =
          p(
            "M32 55 11 35C-3 17 20 4 32 20 44 4 67 17 53 35Z",
            "#293136",
            1.7,
            "#f7a8d1",
          ) +
          e(24, 27, 2, 3) +
          e(41, 27, 2, 3) +
          e(17, 34, 4, 2, "#eb6d9d") +
          e(48, 34, 4, 2, "#eb6d9d") +
          p("M27 36q5 6 11 0", ink, 2);
        break;
      case "token-link":
        bg = "#758076";
        art =
          p("M12 23 32 42 51 21", "#e5e3ae", 5) +
          [10, 30, 49]
            .map(
              (x, i) =>
                r(x - 6, i % 2 ? 33 : 12, 18, 17, "#d4d8cd") +
                r(x - 3, i % 2 ? 39 : 18, 3, 4, "#30382d") +
                r(x + 5, i % 2 ? 39 : 18, 3, 4, "#30382d"),
            )
            .join("");
        break;
      case "bear-morph":
        bg = "#ed382b";
        art =
          robot("#ba783b") + c(22, 18, 4, "#714323") + c(41, 18, 4, "#714323");
        break;
      case "haste":
        bg = "#f4f6f5";
        ink = "#8c9697";
        art =
          c(36, 12, 5, ink) +
          p(
            "m31 22-6 12 11 5-8 13m0-27-12 7m17-5 9 4 6-5m-21 9-7 9-10-1",
            ink,
            6,
          );
        break;
      case "focus":
        bg = "#f2f3ed";
        art = [0, 1, 2, 3, 4, 5, 6, 7]
          .map((i) => {
            const a = (i * Math.PI) / 4;
            return p(
              `M${32 + Math.cos(a) * 13} ${32 + Math.sin(a) * 13} ${32 + Math.cos(a) * 25} ${32 + Math.sin(a) * 25}`,
              "#161c1a",
              3,
            );
          })
          .join("");
        break;
      case "rage":
        bg = "#ed0b16";
        ink = "#0d1515";
        art =
          p("M14 43q18-24 36 0", ink, 4) +
          c(22, 23, 5) +
          c(43, 23, 5) +
          c(22, 23, 2, bg) +
          c(43, 23, 2, bg);
        break;
      case "melody":
        bg = "#fff";
        art =
          p("M23 13v31m0-28 24-5v26", ink, 4) +
          e(16, 45, 9, 7) +
          e(40, 39, 9, 7) +
          p("M23 13 47 8v7l-24 6Z", ink, 1, ink);
        break;
      case "inspire":
        bg = "#a592b9";
        art = star;
        break;
      case "blue-boost":
      case "red-boost":
      case "white-boost":
        bg = kind.startsWith("blue")
          ? "#174bf3"
          : kind.startsWith("red")
            ? "#f21a27"
            : "#aaaeb5";
        art = p("m14 9 22 23-22 23m17-46 22 23-22 23", "#fff", 5);
        break;
      case "honey":
      case "honey-gift":
      case "honey-gift-plus":
        bg = "#f4d044";
        art =
          p(
            "M34 6q-2 12 11 24C67 55 15 67 13 43 13 29 28 25 34 6Z",
            "#be8e18",
            2,
            "#ffe970",
          ) + p("M28 27q-12 13-8 20", "#fff5b8", 3);
        break;
      case "pollen-mark":
      case "pollen-mark-plus":
        bg = "#9bdba6";
        art =
          flower("#f2f4ef", "#c4d6c1") + p("M32 9v46M9 32h46", "#8b9e86", 1);
        break;
      case "honey-mark":
      case "honey-mark-plus":
        bg = "#a5c1aa";
        art = flower("#edf4e8", "#f1d75a") + c(32, 32, 4, "#fffab9");
        break;
      case "precise-mark":
        bg = "#df945d";
        art =
          p("M32 7v50M7 32h50", "#8545d5", 8) +
          `<circle cx="32" cy="32" r="17" fill="none" stroke="#6427a1" stroke-width="5"/>` +
          p("M32 18v28M18 32h28", "#211d3b", 2);
        break;
      case "precision":
        bg = "#21f32b";
        art =
          p("M5 32q25-35 54 0-25 35-54 0Z", "#0b190f", 1, "#0b190f") +
          e(32, 32, 7, 21, bg);
        break;
      case "inflate-balloons":
        bg = "#c68666";
        art =
          e(32, 27, 16, 20, "#6e3cc7") +
          p("m32 44-4 7h8Z", "#47266f", 1, "#47266f") +
          p("M32 49q-8 6 0 12", "#eee6c7", 2) +
          p("M23 15q-6 9-2 15", "#aa87f4", 3);
        break;
      case "surprise-party":
        bg = "#ffe221";
        art =
          p("m16 48 19-37 16 39Z", "#2164bf", 1, "#247df3") +
          c(36, 12, 3, "#f5453b") +
          [16, 25, 49, 53, 13, 45]
            .map((x, i) =>
              c(x, 15 + ((i * 7) % 35), 2, i % 2 ? "#df3f8b" : "#30bb69"),
            )
            .join("") +
          c(31, 37, 3, "#f8ca36");
        break;
      case "fuzz-bombs":
      case "pollen-haze":
        bg = kind === "pollen-haze" ? "#a8bf87" : "#8e7357";
        art = [
          [-12, -7],
          [13, 2],
          [1, 14],
        ]
          .map(
            ([x, y]) =>
              `<g transform="translate(${x} ${y}) scale(.5)">${flower("#edf2dc", "#dfc263")}</g>`,
          )
          .join("");
        break;
      case "target-practice":
        bg = "#ff9225";
        art =
          p("M11 16q10 2 15 13m12 0q5-11 15-13", "#fff", 4) +
          e(23, 30, 3, 6, "#fff") +
          e(42, 30, 3, 6, "#fff") +
          p("M23 47q10-11 19 0", "#fff", 3);
        break;
      case "inferno":
      case "flame-fuel":
        bg = kind === "inferno" ? "#e92821" : "#ea4526";
        art =
          p(
            "M32 5q-2 15 9 20l4-13q26 44-9 48C4 57 11 29 19 20l2 18q9-4 11-33Z",
            "#702014",
            1,
            "#702014",
          ) + p("M32 30q-5 13-4 21 15-4 4-21Z", "#ffdd31", 1, "#ffdd31");
        break;
      case "summon-frog":
        bg = "#46bb92";
        art =
          e(33, 41, 18, 11, "#238361") +
          c(23, 27, 7, "#238361") +
          c(43, 27, 7, "#238361") +
          c(23, 25, 2, "#102c24") +
          c(43, 25, 2, "#102c24") +
          p("M20 46 8 52m37-7 11 7", "#238361", 5);
        break;
      case "triangulate":
        bg = "#b0afb8";
        art = p("m10 12 44 0-22 44Z", "#e2e3c9", 1, "#fff6a4");
        break;
      case "mark-surge":
        bg = "#a6dab6";
        art =
          flower("#f8fff0", "#a5ba83") +
          p("m32 7-5 17h10l-5 18 13-22H35l6-13Z", "#4a8b56", 1, "#4a8b56");
        break;
      case "blue-pulse":
      case "red-pulse":
        bg = kind.startsWith("blue") ? "#2b61e7" : "#ef3145";
        art = p("M9 32h9l5-17 9 35 8-27 4 9h11", "#fff", 4);
        break;
      case "blue-bomb-sync":
      case "red-bomb-sync":
        bg = kind.startsWith("blue") ? "#3a72ec" : "#f43845";
        art =
          c(22, 32, 14, "#b6efc9") +
          c(43, 32, 14, "#e8efbf") +
          p("M20 15q24-8 30 14M44 49q-24 8-30-14", "#fff", 3);
        break;
      case "glitch":
      case "map-corruption":
        bg = kind === "glitch" ? "#2bfa20" : "#ef3b35";
        art = robot("#5376c7");
        break;
      case "mind-hack":
        bg = "#32e28e";
        art =
          p(
            "M17 39C4 25 21 10 29 18c8-12 26-1 21 9 12 7 0 24-12 18-9 8-21 3-21-6Z",
            "#153a2a",
            2,
            "#64b987",
          ) + p("M30 19v26m-10-19 11 7 12-7m-22 12 10-6 12 7", "#24583d", 2);
        break;
      case "festive-gift":
        bg = "#42bc95";
        art =
          r(15, 26, 34, 25, "#d93c33") +
          r(12, 20, 40, 10, "#f0d89b") +
          r(28, 20, 8, 31, "#eee8c9") +
          p(
            "M31 20q-21-4-13-13 8-7 13 13 5-20 13-13 8 9-13 13Z",
            "#f1d7ad",
            2,
            "#f1d7ad",
          );
        break;
      case "glob":
      case "gumdrop-barrage":
        bg = "#ed8df0";
        art =
          kind === "glob"
            ? p(
                "m32 8 7 15 17-5-8 14 14 9-18 2-4 16-11-14-17 7 7-17L4 25l20 1Z",
                "#73fa9a",
                1,
                "#73fa9a",
              )
            : [18, 32, 46]
                .map((x, i) =>
                  p(
                    `M${x - 6} ${22 + (i % 2) * 12}q6-13 12 0v14h-12Z`,
                    "#6cf595",
                    1,
                    "#6cf595",
                  ),
                )
                .join("");
        break;
      case "beamstorm":
        bg = "#171e20";
        art =
          [13, 23, 33, 43, 53]
            .map((x, i) => r(x, 10, 4, 32 + (i % 2) * 10, "#dfff1c"))
            .join("") + p("m23 48 9 7 9-7", "#dfff1c", 3);
        break;
      case "puppy-love":
        bg = "#d6c07f";
        art =
          e(17, 24, 11, 12, "#887f55") +
          e(48, 24, 7, 10, "#887f55") +
          p("m27 35 11 0-5 7Z", "#334233", 1, "#334233") +
          p("M22 45q5 9 11 2 7 7 12-2", "#334233", 3) +
          e(25, 26, 3, 4, "#334233") +
          e(43, 27, 3, 3, "#334233");
        break;
      case "fetch":
        bg = "#deff3b";
        art = p("M3 23q25 8 43-19M7 50q18-23 51-7", "#fff", 4);
        break;
      case "scratch":
        bg = "#aab6ba";
        art = p("m14 19 7 27m10-35 5 36m10-30 5 27", "#fff", 6);
        break;
      case "tabby-love":
        bg = "#f5a12a";
        art =
          p("m18 20-5-13 14 9m10 0L51 7l-5 13", "#382f20", 2, "#382f20") +
          p("m9 28 14 4m-18 7 16 1m34-12-14 4m18 7-16 1", "#382f20", 2) +
          p("m26 31 13 0-6 8Z", "#382f20", 1, "#382f20") +
          p("M21 42q6 12 12 3 6 9 12-3", "#382f20", 2);
        break;
      case "impale":
        bg = "#111a1d";
        art = p(
          "m15 8-6 40h11Zm17-4-5 47h10Zm17 5-5 33h10Z",
          "#96eeff",
          1,
          "#96eeff",
        );
        break;
      case "rain-cloud":
        bg = "#aab3b9";
        art =
          e(32, 24, 22, 10, "#f6fbfd") +
          c(25, 19, 10, "#f6fbfd") +
          c(39, 17, 12, "#f6fbfd") +
          [17, 25, 33, 41, 49]
            .map((x) => p(`m${x} 38-5 14`, "#e5f7ff", 2))
            .join("");
        break;
      case "tornado":
        bg = "#7f929b";
        art = p(
          "M17 15q-15 9 15 12 29-1 15-12m-28 3q-8 7 13 9 20-2 12-7M12 29q20 16 41 0M20 40q15 11 25 0M27 50q8 4 10-1",
          "#eff7f9",
          3,
        );
        break;
      case "ticket":
        bg = "#f4ce31";
        art =
          p(
            "M11 18h42v9a6 6 0 0 0 0 12v8H11v-8a6 6 0 0 0 0-12Z",
            "#9d7620",
            2,
            "#fff09c",
          ) + p("M25 22v22m15-22v22", "#c49125", 2);
        break;
      case "treat":
        bg = "#ddbb86";
        art =
          p("m18 18 29-2 9 12-2 22-25 7-15-14Z", "#6b4828", 2, "#a8753f") +
          [22, 32, 44, 27, 43]
            .map((x, i) => c(x, 25 + ((i * 9) % 24), 3, "#593c24"))
            .join("");
        break;
      default:
        bg = "#b5d6a7";
        art = star;
    }
  const plusMark = plus
    ? c(51, 51, 11, "#fff8ce") + p("M51 44v14m-7-7h14", "#344538", 3)
    : "";
  return `<circle cx="32" cy="32" r="31" fill="${bg}"/>${art}${plusMark}`;
}
export const tokenIconSvg = (kind: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 64 64">${tokenIconMarkup(kind)}</svg>`;
