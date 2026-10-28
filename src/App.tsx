import { Component, type ReactNode } from "react";
import { useGame } from "./game/systems/store";
import Scene from "./game/player/Scene";
import AdminPanel from "./components/AdminPanel";
import HUD from "./components/HUD";
import Menus from "./components/Menus";
import ItemDropConfirmation from './components/ItemDropConfirmation';
class SceneBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="webgl-error">
        <h2>The mountain couldn’t render.</h2>
        <p>
          This game needs WebGL. Enable hardware acceleration in your browser,
          then reload.
        </p>
        <button onClick={() => location.reload()}>Reload game</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const quality = useGame((s) => s.game.settings.quality);
  return (
    <main className={`game-shell ${quality === "low" ? "low-quality" : ""}`}>
      <div className="world-canvas">
        <SceneBoundary>
          <Scene />
        </SceneBoundary>
      </div>
      <div className="scene-vignette" />
      <HUD />
      <AdminPanel />
      <Menus />
      <ItemDropConfirmation />
    </main>
  );
}
