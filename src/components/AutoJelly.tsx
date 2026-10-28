import { useGame } from "../game/systems/store";
import { cancelAutoJelly } from "../game/systems/simulation";
export const jellyTarget = (rarity: string, gifted: boolean) =>
  `${gifted ? "Gifted " : ""}${rarity === "Any" ? "bee" : rarity + " bee"}`;
export default function AutoJelly({
  settings = false,
}: {
  settings?: boolean;
}) {
  const { game: s, refresh, save } = useGame();
  const run = s.jellyRun;
  const update = (fn: () => void) => {
    fn();
    refresh();
    save();
  };
  return (
    <section className="auto-jelly">
      {settings && (
        <>
          <h3>Auto Royal Jelly</h3>
          <div className="settings-grid">
            <label>
              Until rarity
              <select
                aria-label="Auto Royal Jelly rarity"
                value={s.settings.jellyRarity}
                disabled={!!run?.running}
                onChange={(e) =>
                  update(() => {
                    s.settings.jellyRarity = e.target
                      .value as typeof s.settings.jellyRarity;
                  })
                }
              >
                <option value="Any">
                  Any · single roll unless gifted required
                </option>
                <option value="Legendary">Legendary</option>
                <option value="Mythic">Mythic</option>
              </select>
            </label>
            <label>
              Require gifted
              <input
                type="checkbox"
                checked={s.settings.jellyGifted}
                disabled={!!run?.running}
                onChange={(e) =>
                  update(() => {
                    s.settings.jellyGifted = e.target.checked;
                  })
                }
              />
            </label>
          </div>
        </>
      )}
      <p data-testid="jelly-target">
        {s.settings.jellyRarity === "Any" && !s.settings.jellyGifted
          ? "Single roll · 1 RJ"
          : `Auto roll until ${jellyTarget(s.settings.jellyRarity, s.settings.jellyGifted)}`}
      </p>
      <small>
        Every roll costs 1 RJ. Legendary: 3% · Mythic: 1/25,000 · Gifted: 1/250.
        Combined filters must both match. Gifted Legendary averages 8,333 RJ;
        Gifted Mythic averages 6,250,000 RJ. Averages are not guarantees.
      </small>
      {run && (
        <div className="jelly-progress" role="status">
          <b>
            {run.running ? "Rolling" : "Finished"}: {run.used.toLocaleString()}{" "}
            RJ used
          </b>
          <span>{s.inventory.jelly.toLocaleString()} remaining</span>
          {run.running && (
            <button
              className="button danger"
              onClick={() => update(() => cancelAutoJelly(s))}
            >
              Stop auto Royal Jelly
            </button>
          )}
        </div>
      )}
    </section>
  );
}
