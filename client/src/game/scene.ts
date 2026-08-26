import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { MotionBlurPostProcess } from "@babylonjs/core/PostProcesses/motionBlurPostProcess";
import { GameWorld } from "./world/GameWorld";

export interface GameHandle { scene: Scene; dispose: () => void; }

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  const world = new GameWorld(scene, engine, canvas);
  scene.imageProcessingConfiguration.toneMappingEnabled = false;
  scene.imageProcessingConfiguration.exposure = 1.08;
  scene.imageProcessingConfiguration.contrast = 1.02;
  const cinematic = new DefaultRenderingPipeline("cinematic-mobile-pipeline", true, scene, [world.camera.camera]);
  cinematic.fxaaEnabled = true;
  cinematic.sharpenEnabled = true;
  cinematic.sharpen.edgeAmount = 0.26;
  cinematic.sharpen.colorAmount = 0.12;
  cinematic.bloomEnabled = true;
  cinematic.bloomThreshold = 0.76;
  cinematic.bloomWeight = 0.12;
  cinematic.bloomKernel = 46;
  cinematic.chromaticAberrationEnabled = false;
  const motionBlur = new MotionBlurPostProcess("mobile-speed-motion-blur", scene, 0.65, world.camera.camera);
  motionBlur.isObjectBased = false;
  motionBlur.motionStrength = 0.34;
  motionBlur.motionBlurSamples = 24;
  motionBlur.motionStrength = 0;
  (scene.metadata ??= {}).cinematicPipeline = cinematic;
  scene.metadata.cinematicMotionBlur = motionBlur;
  const observer = scene.onBeforeRenderObservable.add(() => world.update(scene.getEngine().getDeltaTime() / 1000));
  return { scene, dispose: () => { scene.onBeforeRenderObservable.remove(observer); motionBlur.dispose(); cinematic.dispose(); world.dispose(); scene.dispose(); } };
}
