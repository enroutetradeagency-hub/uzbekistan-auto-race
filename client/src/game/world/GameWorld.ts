import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import { Vehicle, type VehicleControls } from "../actors/Vehicle";
import { AIRacer } from "../actors/AIRacer";
import { CameraController } from "../systems/CameraController";
import { EnvironmentBuilder, type WeatherMode } from "../systems/EnvironmentBuilder";
import { InputManager } from "../systems/InputManager";
import { RaceManager } from "../systems/RaceManager";
import { buildTashkentTrack, type TrackData } from "../systems/TrackBuilder";
import { AudioEngine } from "../systems/AudioEngine";
import { HudController } from "../ui/HudController";

type RaceState = "menu" | "countdown" | "racing" | "finished";
export type GraphicsProfile = "HIGH" | "MEDIUM" | "LOW";

export class GameWorld {
  readonly track: TrackData;
  readonly player: Vehicle;
  readonly rivals: AIRacer[];
  readonly camera: CameraController;
  private readonly environment: EnvironmentBuilder;
  private readonly input: InputManager;
  private readonly race: RaceManager;
  private readonly hud: HudController;
  private readonly audio: AudioEngine;
  private raceState: RaceState = "menu";
  private graphics: GraphicsProfile = "MEDIUM";
  private countdown = 0;
  private warning = "";
  private warningTimer = 0;
  private readonly demo: boolean;
  private demoProgress = 90;

  constructor(private readonly scene: Scene, private readonly engine: Engine, private readonly canvas: HTMLCanvasElement) {
    this.demo = new URLSearchParams(window.location.search).has("demo");
    this.track = buildTashkentTrack(scene);
    this.environment = new EnvironmentBuilder(scene, this.track);
    this.player = new Vehicle(scene, "cobalt-player", "#F0F0EB", { maxSpeed: 58, acceleration: 19, handling: 1.05 });
    this.rivals = [
      new AIRacer(scene, "ai-gentra", "#3E566B", 43, 1.8),
      new AIRacer(scene, "ai-lacetti", "#A9A69D", 41.5, -1.7),
      new AIRacer(scene, "ai-onix", "#B63731", 40.2, 0.9),
      new AIRacer(scene, "ai-malibu", "#1E232B", 38.5, -0.9),
    ];
    this.camera = new CameraController(scene);
    this.hud = new HudController({ onStart: () => this.startRace(), onProfile: (profile) => this.setGraphics(profile), onWeather: () => this.nextWeather() });
    const uiRoot = document.querySelector<HTMLElement>("#game-ui");
    if (!uiRoot) throw new Error("Game UI root was not initialized");
    this.input = new InputManager(uiRoot);
    this.race = new RaceManager();
    this.audio = new AudioEngine();
    this.resetVehicles();
    this.setGraphics("MEDIUM", false);
    window.addEventListener("keydown", this.handleStartKey);
    if (this.demo) window.setTimeout(() => this.startRace(), 550);
  }

  private handleStartKey = (event: KeyboardEvent): void => { if (event.key === "Enter" && (this.raceState === "menu" || this.raceState === "finished")) this.startRace(); };
  private resetVehicles(): void {
    const startIndex = 90; const start = this.track.pointAt(startIndex, 0); const tangent = this.track.tangents[startIndex];
    this.player.reset(start, Math.atan2(tangent.x, tangent.z)); this.demoProgress = startIndex; this.rivals.forEach((rival, index) => rival.reset(this.track, startIndex + 3 + index * 4)); this.race.reset(this.track); this.camera.update(1, this.player, false);
  }
  startRace(): void {
    if (this.raceState === "countdown" || this.raceState === "racing") return;
    this.audio.unlock(); this.resetVehicles(); this.raceState = "countdown"; this.countdown = 3.2; this.warning = "";
  }
  private getAutopilotControls(): VehicleControls {
    const closest = this.track.closestIndex(this.player.root.position); const targetIndex = (closest + 7) % this.track.points.length; const target = this.track.pointAt(targetIndex, 0); const desiredHeading = Math.atan2(target.x - this.player.root.position.x, target.z - this.player.root.position.z);
    let delta = desiredHeading - this.player.heading; while (delta > Math.PI) delta -= Math.PI * 2; while (delta < -Math.PI) delta += Math.PI * 2;
    return { throttle: 1, brake: Math.abs(delta) > 1.15 ? 0.7 : 0, steer: Math.max(-1, Math.min(1, delta * 1.8)), nitro: this.player.speed > 33 && Math.abs(delta) < 0.15 && this.player.nitro > 15 };
  }
  private updateDemo(delta: number): void {
    this.demoProgress += 10.2 * delta;
    const pointIndex = Math.floor(this.demoProgress) % this.track.points.length;
    const point = this.track.pointAt(pointIndex, 0.25 + Math.sin(this.demoProgress * 0.22) * 0.22);
    const tangent = this.track.tangents[pointIndex];
    this.player.root.position.copyFrom(point);
    this.player.root.position.y = 0.06;
    this.player.heading = Math.atan2(tangent.x, tangent.z);
    this.player.root.rotation.y = this.player.heading;
    this.player.speed = 46 + Math.sin(this.demoProgress * 0.1) * 4;
    this.player.nitro = 72 + Math.sin(this.demoProgress * 0.2) * 20;
    this.player.drift = Math.sin(this.demoProgress * 0.09) * 0.12;
  }
  private nextWeather(): void { const current = this.environment.nextWeather(); this.warning = current === "YOMG‘IR" ? "YO‘L NAM: BURILISHDA EHTIYOT BO‘L." : `${current} REJIMI FAOL`; this.warningTimer = 2.4; }
  private setGraphics(profile: GraphicsProfile, announce = true): void {
    this.graphics = profile;
    const hardwareScale: Record<GraphicsProfile, number> = { HIGH: 1, MEDIUM: 1.2, LOW: 1.55 };
    this.engine.setHardwareScalingLevel(hardwareScale[profile]); this.canvas.dataset.graphics = profile;
    if (announce) { this.warning = `${profile} GRAFIKA REJIMI`; this.warningTimer = 1.4; }
  }
  update(delta: number): void {
    const safeDelta = Math.min(0.05, delta); this.warningTimer = Math.max(0, this.warningTimer - safeDelta); if (this.warningTimer === 0) this.warning = ""; this.environment.update(safeDelta);
    if (this.raceState === "countdown") { this.countdown -= safeDelta; if (this.countdown <= 0) { this.raceState = "racing"; this.countdown = 0; } }
    const racing = this.raceState === "racing";
    const controls = racing ? (this.demo ? { throttle: 1, brake: 0, steer: 0, nitro: true } : this.input.controls()) : { throttle: 0, brake: 0, steer: 0, nitro: false };
    if (racing) {
      if (this.demo) this.updateDemo(safeDelta); else this.player.update(safeDelta, controls, this.track); this.rivals.forEach((rival) => rival.update(safeDelta, this.track, true));
      this.rivals.forEach((rival) => { if (Vector3.DistanceSquared(rival.position, this.player.root.position) < 5.4) { this.player.impact(); this.warning = "TO‘QNASHUV — TEZLIK PASAYDI"; this.warningTimer = 0.8; } });
      if (this.race.update(this.player, this.rivals, this.track)) this.raceState = "finished";
    }
    this.camera.update(safeDelta, this.player, controls.nitro && controls.throttle > 0.3); this.audio.update(this.player.speed, controls.nitro);
    this.hud.update({ speed: Math.round(Math.max(0, this.player.speed) * 3.6), nitro: this.player.nitro, lap: this.race.lap, totalLaps: this.race.totalLaps, position: this.race.position, countdown: this.raceState === "countdown" ? this.countdown : null, weather: this.environment.currentWeather, raceState: this.raceState, graphics: this.graphics, warning: this.warning });
  }
  dispose(): void { window.removeEventListener("keydown", this.handleStartKey); this.input.dispose(); this.hud.dispose(); this.audio.dispose(); }
  get weather(): WeatherMode { return this.environment.currentWeather; }
}
