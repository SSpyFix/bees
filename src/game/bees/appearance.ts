/** Shared visual identities, matched to the supplied 46-bee face reference. */
export type BeeAppearance = {
  body: string;
  background: string;
  ink: string;
  stripe: string;
};
const navy = "#1b2a35",
  paper = "#eff2ef";
const look = (
  background: string,
  ink: string,
  body = background,
  stripe = navy,
): BeeAppearance => ({ body, background, ink, stripe });
export const BEE_APPEARANCES: Record<string, BeeAppearance> = {
  basic: look(navy, paper, navy, "#e5cf38"),
  bomber: look(paper, navy),
  brave: look("#9f9f9f", navy, "#9f9f9f", paper),
  bumble: look(navy, "#3b8ed1", navy, "#3b8ed1"),
  cool: look("#3b5e9d", "#b3d5f2", "#3b5e9d", "#3b8ed1"),
  hasty: look(paper, navy, paper, "#e5cf38"),
  looker: look("#32be4e", navy),
  rad: look(paper, "#a52717", paper, "#f3492d"),
  rascal: look(navy, "#de4934", navy, "#f3492d"),
  stubborn: look(navy, "#fffac1", navy, "#fdffbc"),
  bubble: look("#b2d8f1", "#539dd0"),
  bucko: look(navy, "#3b8ed1", navy, "#3b8ed1"),
  commander: look("#2cbb56", "#071508", "#254b31", "#8db64e"),
  demo: look(navy, "#e5cf38", navy, "#e5cf38"),
  exhausted: look(navy, "#b6bec2", navy, "#9f9f9f"),
  fire: look("#b52515", "#f8d72d"),
  frosty: look(paper, "#5ba9d6"),
  honey: look("#e5cf38", "#27362a"),
  rage: look(navy, "#f3492d", navy, "#f3492d"),
  riley: look("#f2cc6e", "#d83d25"),
  shocked: look(navy, paper, navy, paper),
  baby: look(navy, paper, "#b4d8f7", paper),
  carpenter: look("#b9896d", "#202223", "#966a55", "#ffc812"),
  demon: look("#b7191c", "#270d10"),
  diamond: look("#a9d4ef", paper),
  lion: look("#e5b238", "#263528", "#e5b238", "#e5cf38"),
  music: look(navy, paper, navy, paper),
  ninja: look(navy, "#1c73b4", navy, "#1c73b4"),
  shy: look("#a4a6a4", "#f05262"),
  buoyant: look("#1d66d4", "#35c9e6"),
  fuzzy: look("#ad825e", "#57432f"),
  precise: look("#a90f1b", "#851018", "#a90f1b", "#ef4857"),
  spicy: look(navy, "#ed4b31", navy, "#ed4b31"),
  tadpole: look("#4dd3a2", "#285b4e"),
  vector: look("#b9bdc6", paper),
  bear: look("#e4a45f", "#493c2b", "#9a6c40", "#d8ac72"),
  cobalt: look("#1011f6", paper, "#1011f6", paper),
  crimson: look("#ee002c", paper, "#ee002c", paper),
  digital: look("#073d1d", "#91d853", "#929997", "#e5dbac"),
  festive: look("#b51f24", paper, "#b51f24", paper),
  gummy: look("#ed75ef", "#51efae", "#51d6a9", "#ed75ef"),
  photon: look("#e7ff2c", navy, "#e7ff2c", paper),
  puppy: look("#f8d97e", "#3b3c2c", "#b18b57", "#f8d97e"),
  tabby: look("#f49d20", "#4c351d", "#f49d20", "#8c591f"),
  vicious: look("#101820", "#d4f8ff", "#133a50", "#89d6ee"),
  windy: look("#f0faf8", "#7895a6", "#dce9ee", paper),
};
export const beeAppearance = (face: string): BeeAppearance =>
  BEE_APPEARANCES[face] ?? BEE_APPEARANCES.basic;
