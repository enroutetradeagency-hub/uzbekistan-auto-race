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
import { HudController, type MapMarker } from "../ui/HudController";

type RaceState = "menu" | "countdown" | "racing" | "finished";
export type GraphicsProfile = "HIGH" | "MEDIUM" | "LOW";
const PROGRESS_KEY = "uzbekistan-auto-race-progress";

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
  private elapsed = 0;
  private warning = "";
  private warningTimer = 0;
  private readonly demo: boolean;
  private readonly fastDemo: boolean;
  private readonly resultsPreview: boolean;
  private demoProgress = 90;
  private sirdaryoUnlocked = false;

  constructor(private readonly scene: Scene, private readonly engine: Engine, private readonly canvas: HTMLCanvasElement) {
    const query = new URLSearchParams(window.location.search);
    this.demo = query.has("demo");
    this.fastDemo = query.has("fast");
    this.resultsPreview = query.has("result");
    this.sirdaryoUnlocked = localStorage.getItem(PROGRESS_KEY) === "sirdaryo";
    this.track = buildTashkentTrack(scene); this.environment = new EnvironmentBuilder(scene, this.track);
    this.player = new Vehicle(scene, "cobalt-player", "#F0F0EB", { maxSpeed: 58, acceleration: 19, handling: 1.05 });
    this.rivals = [new AIRacer(scene, "ai-gentra", "#3E566B", 43, 1.8), new AIRacer(scene, "ai-lacetti", "#A9A69D", 41.5, -1.7), new AIRacer(scene, "ai-onix", "#B63731", 40.2, 0.9), new AIRacer(scene, "ai-malibu", "#1E232B", 38.5, -0.9)];
    this.camera = new CameraController(scene);
    if (query.has("cockpit")) this.camera.setMode("COCKPIT");
    this.hud = new HudController({ onStart: () => this.startRace(), onProfile: (profile) => this.setGraphics(profile), onWeather: () => this.nextWeather(), onCamera: () => this.toggleCamera(), onRestart: () => this.startRace(), onContinue: () => this.openSirdaryo() });
    const uiRoot = document.querySelector<HTMLElement>("#game-ui"); if (!uiRoot) throw new Error("Game UI root was not initialized");
    this.input = new InputManager(uiRoot); this.race = new RaceManager(); this.audio = new AudioEngine(); this.resetVehicles(); this.setGraphics("MEDIUM", false); window.addEventListener("keydown", this.handleKey);
    if (this.demo) window.setTimeout(() => this.startRace(), 550);
    if (this.resultsPreview) window.setTimeout(() => this.finishRace(), 240);
  }

  private handleKey = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && (this.raceState === "menu" || this.raceState === "finished")) this.startRace();
    if (event.key.toLowerCase() === "c") this.toggleCamera();
  };
  private resetVehicles(): void {
    const startIndex = 90; const start = this.track.pointAt(startIndex, 0); const tangent = this.track.tangents[startIndex];
    this.player.reset(start, Math.atan2(tangent.x, tangent.z)); this.demoProgress = startIndex; this.rivals.forEach((rival, index) => rival.reset(this.track, startIndex + 3 + index * 4)); this.race.reset(this.track); this.camera.update(1, this.player, false); this.elapsed = 0;
  }
  startRace(): void {
    if (this.raceState === "countdown" || this.raceState === "racing") return;
    this.audio.unlock(); this.resetVehicles(); this.raceState = "countdown"; this.countdown = 3; this.warning = "";
  }
  private toggleCamera(): void { const mode = this.camera.toggle(); this.warning = mode === "CHASE" ? "ORQA KAMERA" : "ICHKI KAMERA"; this.warningTimer = 1.2; }
  private updateDemo(delta: number): void {
    this.demoProgress += (this.fastDemo ? 1100 : 10.2) * delta;
    const pointIndex = Math.floor(this.demoProgress) % this.track.points.length; const point = this.track.pointAt(pointIndex, 0.25 + Math.sin(this.demoProgress * 0.22) * 0.22); const tangent = this.track.tangents[pointIndex];
    this.player.root.position.copyFrom(point); this.player.root.position.y = 0.06; this.player.heading = Math.atan2(tangent.x, tangent.z); this.player.root.rotation.y = this.player.heading; this.player.speed = 46 + Math.sin(this.demoProgress * 0.1) * 4; this.player.nitro = 72 + Math.sin(this.demoProgress * 0.2) * 20; this.player.drift = Math.sin(this.demoProgress * 0.09) * 0.12;
  }
  private nextWeather(): void { const current = this.environment.nextWeather(); this.warning = current === "YOMG‘IR" ? "YO‘L NAM: BURILISHDA EHTIYOT BO‘L." : `${current} REJIMI FAOL`; this.warningTimer = 2.4; }
  private setGraphics(profile: GraphicsProfile, announce = true): void { this.graphics = profile; const hardwareScale: Record<GraphicsProfile, number> = { HIGH: 1, MEDIUM: 1.2, LOW: 1.55 }; this.engine.setHardwareScalingLevel(hardwareScale[profile]); this.canvas.dataset.graphics = profile; if (announce) { this.warning = `${profile} GRAFIKA REJIMI`; this.warningTimer = 1.4; } }
  private openSirdaryo(): void { this.sirdaryoUnlocked = true; localStorage.setItem(PROGRESS_KEY, "sirdaryo"); this.raceState = "menu"; this.warning = "SIRDARYO OCHILDI — KEYINGI XARITA NAVBATDA"; this.warningTimer = 2.6; }
  private finishRace(): void { this.raceState = "finished"; this.sirdaryoUnlocked = true; localStorage.setItem(PROGRESS_KEY, "sirdaryo"); }
  private mapPoint(position: Vector3): MapMarker { return { x: Math.max(8, Math.min(92, 50 + position.x * 0.62)), y: Math.max(10, Math.min(90, 50 - position.z * 0.86)) }; }

  update(delta: number): void {
    const safeDelta = Math.min(0.05, delta); this.warningTimer = Math.max(0, this.warningTimer - safeDelta); if (this.warningTimer === 0) this.warning = ""; this.environment.update(safeDelta);
    if (this.raceState === "countdown") { this.countdown -= safeDelta; if (this.countdown <= 0) { this.raceState = "racing"; this.countdown = 0; } }
    const racing = this.raceState === "racing"; const controls: VehicleControls = racing ? (this.demo ? { throttle: 1, brake: 0, steer: 0, nitro: true } : this.input.controls()) : { throttle: 0, brake: 0, steer: 0, nitro: false };
    if (racing) {
      this.elapsed += safeDelta; if (this.demo) this.updateDemo(safeDelta); else this.player.update(safeDelta, controls, this.track); this.rivals.forEach((rival) => rival.update(safeDelta, this.track, true));
      this.rivals.forEach((rival) => { if (Vector3.DistanceSquared(rival.position, this.player.root.position) < 5.4) { this.player.impact(); this.warning = "TO‘QNASHUV — TEZLIK PASAYDI"; this.warningTimer = 0.8; } });
      if (this.race.update(this.player, this.rivals, this.track)) this.finishRace();
    }
    this.camera.update(safeDelta, this.player, controls.nitro && controls.throttle > 0.3); this.audio.update(this.player.speed, controls.nitro);
    this.hud.update({ speed: this.player.speedKph, nitro: this.player.nitro, lap: this.race.lap, totalLaps: this.race.totalLaps, position: this.race.position, countdown: this.raceState === "countdown" ? this.countdown : null, weather: this.environment.currentWeather, raceState: this.raceState, graphics: this.graphics, elapsed: this.elapsed, cameraMode: this.camera.currentMode, drifting: this.player.drifting, playerMap: this.mapPoint(this.player.root.position), rivalsMap: this.rivals.map((rival) => this.mapPoint(rival.position)), sirdaryoUnlocked: this.sirdaryoUnlocked, warning: this.warning });
  }
  dispose(): void { window.removeEventListener("keydown", this.handleKey); this.input.dispose(); this.hud.dispose(); this.audio.dispose(); }
  get weather(): WeatherMode { return this.environment.currentWeather; }
}
