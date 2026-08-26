import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { GameWorld } from "./world/GameWorld";

export interface GameHandle { scene: Scene; dispose: () => void; }

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  const world = new GameWorld(scene, engine, canvas);
  const observer = scene.onBeforeRenderObservable.add(() => world.update(scene.getEngine().getDeltaTime() / 1000));
  return { scene, dispose: () => { scene.onBeforeRenderObservable.remove(observer); world.dispose(); scene.dispose(); } };
}
