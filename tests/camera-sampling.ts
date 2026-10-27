import { _roots } from "@react-three/fiber";
export function sampleCameraFrames(count = 40) {
  const canvas = document.querySelector(
    'canvas[data-interactive="true"]',
  ) as HTMLCanvasElement;
  const root = _roots.get(canvas)!;
  return new Promise<{ offset: number[]; position: number[] }[]>((resolve) => {
    const samples: { offset: number[]; position: number[] }[] = [];
    const capture = () => {
      const { scene, camera } = root.store.getState(),
        player = scene.getObjectByName("player")!;
      samples.push({
        offset: camera.position.clone().sub(player.position).toArray(),
        position: player.position.toArray(),
      });
      if (samples.length === count) resolve(samples);
      else requestAnimationFrame(capture);
    };
    requestAnimationFrame(capture);
  });
}
