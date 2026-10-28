import { BADGES, BADGE_RANKS, BADGE_TICKETS } from "../game/data/support";
import { badgeProgress, badgeCount, claimBadge } from "../game/systems/badges";
import { useGame, sound } from "../game/systems/store";
const format = (n: number) =>
  n >= 1e9
    ? `${+(n / 1e9).toFixed(2)}B`
    : n >= 1e6
      ? `${+(n / 1e6).toFixed(2)}M`
      : Math.floor(n).toLocaleString();
export default function BadgesPanel() {
  const { game: s, revision } = useGame();
  void revision;
  return (
    <>
      <p className="menu-intro">
        {badgeCount(s)} badges earned · 15 badges unlock the Badge Bearer’s
        Guild. Each claimed rank awards tickets and a permanent bonus.
      </p>
      <div className="badge-grid">
        {BADGES.map((def) => {
          const rank = s.badges[def.id] ?? 0,
            progress = badgeProgress(s, def.id),
            target = def.thresholds[rank] ?? def.thresholds[4],
            ready = rank < 5 && progress >= target;
          return (
            <article
              className={`badge-card ${ready ? "ready" : ""}`}
              key={def.id}
            >
              <div className={`badge-medal tier-${rank}`}>
                ✿<b>{rank || "—"}</b>
              </div>
              <div>
                <h3>{def.name} Badge</h3>
                <b>{BADGE_RANKS[rank]}</b>
                <p>{def.bonus}</p>
              </div>
              <div className="badge-progress">
                <span>
                  {format(progress)} / {format(target)}
                </span>
                <div className="progress">
                  <i
                    style={{
                      width: `${Math.min(100, (progress / target) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <button
                className="button small"
                disabled={!ready}
                onClick={() => {
                  claimBadge(s, def.id);
                  useGame.getState().refresh();
                  useGame.getState().save();
                  sound();
                }}
              >
                {rank === 5
                  ? "Grandmaster"
                  : ready
                    ? `Claim ${BADGE_RANKS[rank + 1]} · ${BADGE_TICKETS[rank]} Tickets`
                    : `Next: ${BADGE_RANKS[rank + 1]}`}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
