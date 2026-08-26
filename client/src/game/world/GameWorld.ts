import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import { Vehicle, type VehicleControls } from "../actors/Vehicle";
import { AIRacer } from "../actors/AIRacer";
import { CameraController } from "../systems/CameraController";
import { EnvironmentBuilder, type WeatherMode } from "../systems/EnvironmentBuilder";
import { InputManager } from "../systems/InputManager";
import { RaceManager } from "../systems/RaceManager";
import { buildJizzaxTrack, buildRegionalTrack, buildSirdaryoTrack, buildTashkentTrack, type TrackData } from "../systems/TrackBuilder";
import { AudioEngine } from "../systems/AudioEngine";
import { HudController, type MapMarker } from "../ui/HudController";
import { CARS, getCar } from "../data/cars";
import { getRegion, REGIONS, type RegionConfig } from "../data/regions";
import { loadProgress, saveProgress, type GameProgress } from "../data/progress";

type RaceState = "menu" | "countdown" | "racing" | "paused" | "finished";
export type GraphicsProfile = "HIGH" | "MEDIUM" | "LOW";

export class GameWorld {
  track: TrackData;
  player!: Vehicle;
  rivals: AIRacer[] = [];
  traffic: AIRacer[] = [];
  readonly camera: CameraController;
  private readonly environment: EnvironmentBuilder;
  private readonly input: InputManager;
  private readonly race: RaceManager;
  private readonly hud: HudController;
  private readonly audio: AudioEngine;
  private readonly progress: GameProgress;
  private readonly region: RegionConfig;
  private readonly regionIndex: number;
  private raceState: RaceState = "menu";
  private graphics: GraphicsProfile = "MEDIUM";
  private countdown = 0;
  private elapsed = 0;
  private warning = "";
  private warningTimer = 0;
  private readonly demo: boolean;
  private readonly fastDemo: boolean;
  private readonly resultsPreview: boolean;
  private readonly preview: boolean;
  private demoProgress = 0;

  constructor(private readonly scene: Scene, private readonly engine: Engine, private readonly canvas: HTMLCanvasElement) {
    const query = new URLSearchParams(window.location.search);
    this.progress = loadProgress();
    const requestedRegion = query.get("region") ?? this.progress.selectedRegionId;
    const candidate = getRegion(requestedRegion);
    const candidateIndex = REGIONS.findIndex((region) => region.id === candidate.id);
    this.preview = query.has("preview");
    this.regionIndex = candidateIndex <= this.progress.highestUnlockedRegion || this.preview ? candidateIndex : 0;
    this.region = REGIONS[this.regionIndex];
    if (!this.preview) { this.progress.selectedRegionId = this.region.id; saveProgress(this.progress); }
    const previewCarId = query.get("car");
    if (this.preview && previewCarId && CARS.some((car) => car.id === previewCarId)) {
      const previewCar = getCar(previewCarId);
      this.progress.garage.selectedCarId = previewCar.id;
      this.progress.garage.paint = previewCar.defaultColor;
    }
    this.demo = query.has("demo"); this.fastDemo = query.has("fast"); this.resultsPreview = query.has("result");
    this.track = this.region.id === "jizzax" ? buildJizzaxTrack(scene) : this.region.id === "sirdaryo" ? buildSirdaryoTrack(scene) : this.region.id === "tashkent" ? buildTashkentTrack(scene) : buildRegionalTrack(scene, this.region.id);
    this.environment = new EnvironmentBuilder(scene, this.track, this.region.id);
    this.camera = new CameraController(scene);
    if (query.has("cockpit")) this.camera.setMode("COCKPIT");
    this.createPlayer();
    this.createRivals();
    this.hud = new HudController({
      onStart: () => this.startRace(),
      onProfile: (profile) => this.setGraphics(profile),
      onWeather: () => this.nextWeather(),
      onCamera: () => this.toggleCamera(),
      onPause: () => this.togglePause(),
      onRestart: () => this.startRace(),
      onContinue: () => this.openNextRegion(),
      onSection: (section) => this.showSection(section),
      onSelectRegion: (regionId) => this.selectRegion(regionId),
      onSelectCar: (carId) => this.selectCar(carId),
      onPaint: (paint) => this.setPaint(paint),
      onUpgrade: (kind) => this.upgrade(kind),
    });
    const uiRoot = document.querySelector<HTMLElement>("#game-ui"); if (!uiRoot) throw new Error("Game UI root was not initialized");
    this.input = new InputManager(uiRoot); this.race = new RaceManager(); this.audio = new AudioEngine(); this.resetVehicles(); this.setGraphics("MEDIUM", false); window.addEventListener("keydown", this.handleKey);
    const requestedSection = query.get("section"); if (requestedSection === "garage" || requestedSection === "regions" || requestedSection === "settings") this.hud.openSection(requestedSection);
    if (this.demo) window.setTimeout(() => this.startRace(), 550);
    if (this.resultsPreview) window.setTimeout(() => this.finishRace(), 240);
  }

  private createPlayer(): void {
    this.player?.root.dispose(false, true);
    const car = getCar(this.progress.garage.selectedCarId);
    const { engineLevel, handlingLevel, nitroLevel, paint } = this.progress.garage;
    this.player = new Vehicle(this.scene, `player-${car.id}`, paint, {
      maxSpeed: car.maxSpeed + engineLevel * 2.3,
      acceleration: car.acceleration + engineLevel * 1.8,
      handling: car.handling + handlingLevel * 0.07,
      nitroCapacity: 100 + nitroLevel * 24,
      bodyStyle: car.bodyStyle,
      modelId: car.id,
    });
  }

  private createRivals(): void {
    this.rivals.forEach((rival) => rival.vehicle.root.dispose(false, true));
    this.traffic.forEach((vehicle) => vehicle.vehicle.root.dispose(false, true));
    const rivalIds = this.region.id === "sirdaryo" ? ["onix", "tracker", "malibu", "gentra"] : ["gentra", "lacetti", "onix", "malibu"];
    this.rivals = rivalIds.map((id, index) => {
      const car = getCar(id);
      return new AIRacer(this.scene, `ai-${this.region.id}-${car.id}`, car.defaultColor, car.maxSpeed * 0.74 - index * 0.9, index % 2 ? -1.65 : 1.65);
    });
    this.traffic = [new AIRacer(this.scene, `traffic-${this.region.id}-damas`, "#E8E7DE", 22, -3.1), new AIRacer(this.scene, `traffic-${this.region.id}-service`, "#8E9B9A", 25, 3.15)];
  }

  private handleKey = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && (this.raceState === "menu" || this.raceState === "finished")) this.startRace();
    if (event.key.toLowerCase() === "c") this.toggleCamera();
    if (event.key.toLowerCase() === "p") this.togglePause();
  };

  private resetVehicles(): void {
    const startIndex = this.region.startIndex % this.track.points.length;
    const start = this.track.pointAt(startIndex, 0); const tangent = this.track.tangents[startIndex];
    this.player.reset(start, Math.atan2(tangent.x, tangent.z)); this.demoProgress = startIndex;
    this.rivals.forEach((rival, index) => rival.reset(this.track, startIndex + 3 + index * 4));
    this.traffic.forEach((vehicle, index) => vehicle.reset(this.track, startIndex + 28 + index * 36));
    this.race.reset(this.track); this.camera.update(1, this.player, false); this.elapsed = 0;
  }

  startRace(): void { if (this.raceState === "countdown" || this.raceState === "racing") return; this.audio.unlock(); this.resetVehicles(); this.raceState = "countdown"; this.countdown = 3; this.warning = ""; }
  private toggleCamera(): void { const mode = this.camera.toggle(); this.warning = mode === "CHASE" ? "ORQA KAMERA" : "ICHKI KAMERA"; this.warningTimer = 1.2; }
  private togglePause(): void { if (this.raceState === "racing") { this.raceState = "paused"; this.warning = "PAUZA"; this.warningTimer = 99; } else if (this.raceState === "paused") { this.raceState = "racing"; this.warning = ""; this.warningTimer = 0; } }
  private updateDemo(delta: number): void {
    this.demoProgress += (this.fastDemo ? 1100 : 10.2) * delta;
    const pointIndex = Math.floor(this.demoProgress) % this.track.points.length; const point = this.track.pointAt(pointIndex, 0.25 + Math.sin(this.demoProgress * 0.22) * 0.22); const tangent = this.track.tangents[pointIndex];
    this.player.root.position.copyFrom(point); this.player.root.position.y = 0.06; this.player.heading = Math.atan2(tangent.x, tangent.z); this.player.root.rotation.y = this.player.heading; this.player.speed = 46 + Math.sin(this.demoProgress * 0.1) * 4; this.player.nitro = 72 + Math.sin(this.demoProgress * 0.2) * 20; this.player.drift = Math.sin(this.demoProgress * 0.09) * 0.12;
  }
  private nextWeather(): void { const current = this.environment.nextWeather(); this.warning = current === "YOMG‘IR" ? "YO‘L NAM: BURILISHDA EHTIYOT BO‘L." : `${current} REJIMI FAOL`; this.warningTimer = 2.4; }
  private setGraphics(profile: GraphicsProfile, announce = true): void { this.graphics = profile; const hardwareScale: Record<GraphicsProfile, number> = { HIGH: 1, MEDIUM: 1.2, LOW: 1.55 }; this.engine.setHardwareScalingLevel(hardwareScale[profile]); this.canvas.dataset.graphics = profile; if (announce) { this.warning = `${profile} GRAFIKA REJIMI`; this.warningTimer = 1.4; } }
  private finishRace(): void {
    this.raceState = "finished";
    this.progress.highestUnlockedRegion = Math.max(this.progress.highestUnlockedRegion, Math.min(REGIONS.length - 1, this.regionIndex + 1));
    if (!this.preview) saveProgress(this.progress);
  }
  private openNextRegion(): void {
    const nextIndex = Math.min(this.progress.highestUnlockedRegion, this.regionIndex + 1);
    if (nextIndex <= this.regionIndex) { this.raceState = "menu"; return; }
    const next = REGIONS[nextIndex];
    this.progress.selectedRegionId = next.id; saveProgress(this.progress); window.location.assign(`/?region=${next.id}`);
  }
  private selectRegion(regionId: string): void {
    const index = REGIONS.findIndex((region) => region.id === regionId);
    if (index < 0 || index > this.progress.highestUnlockedRegion) { this.warning = "AVVAL OLDINGI BOSQICHNI YUTING"; this.warningTimer = 1.8; return; }
    this.progress.selectedRegionId = regionId; saveProgress(this.progress); window.location.assign(`/?region=${regionId}`);
  }
  private selectCar(carId: string): void { if (!CARS.some((car) => car.id === carId)) return; this.progress.garage.selectedCarId = carId; this.progress.garage.paint = getCar(carId).defaultColor; saveProgress(this.progress); this.createPlayer(); this.resetVehicles(); }
  private setPaint(paint: string): void { this.progress.garage.paint = paint; saveProgress(this.progress); this.createPlayer(); this.resetVehicles(); }
  private upgrade(kind: "engine" | "handling" | "nitro"): void {
    const key = kind === "engine" ? "engineLevel" : kind === "handling" ? "handlingLevel" : "nitroLevel";
    this.progress.garage[key] = Math.min(3, this.progress.garage[key] + 1); saveProgress(this.progress); this.createPlayer(); this.resetVehicles();
  }
  private showSection(section: "race" | "garage" | "regions" | "settings"): void { this.hud.openSection(section); }
  private mapPoint(position: Vector3): MapMarker { return { x: Math.max(8, Math.min(92, 50 + position.x * (this.region.id === "sirdaryo" ? 0.43 : 0.62))), y: Math.max(10, Math.min(90, 50 - position.z * (this.region.id === "sirdaryo" ? 0.68 : 0.86))) }; }

  update(delta: number): void {
    const safeDelta = Math.min(0.05, delta); this.warningTimer = Math.max(0, this.warningTimer - safeDelta); if (this.warningTimer === 0) this.warning = ""; this.environment.update(safeDelta);
    if (this.raceState === "countdown") { this.countdown -= safeDelta; if (this.countdown <= 0) { this.raceState = "racing"; this.countdown = 0; } }
    const racing = this.raceState === "racing"; const controls: VehicleControls = racing ? (this.demo ? { throttle: 1, brake: 0, steer: 0, nitro: true } : this.input.controls()) : { throttle: 0, brake: 0, steer: 0, nitro: false };
    if (racing) {
      this.elapsed += safeDelta; if (this.demo) this.updateDemo(safeDelta); else this.player.update(safeDelta, controls, this.track); this.rivals.forEach((rival) => rival.update(safeDelta, this.track, true)); this.traffic.forEach((vehicle) => vehicle.update(safeDelta, this.track, false));
      this.rivals.forEach((rival) => { if (Vector3.DistanceSquared(rival.position, this.player.root.position) < 5.4) { this.player.impact(); this.audio.collision(); this.warning = "TO‘QNASHUV — TEZLIK PASAYDI"; this.warningTimer = 0.8; } });
      this.traffic.forEach((vehicle) => { if (Vector3.DistanceSquared(vehicle.position, this.player.root.position) < 5.4) { this.player.impact(); this.audio.collision(); this.warning = "TRAFFIC TO‘QNASHUVI — TEZLIK PASAYDI"; this.warningTimer = 0.8; } });
      if (this.race.update(this.player, this.rivals, this.track)) this.finishRace();
    }
    this.player.setHeadlights(this.environment.currentWeather === "TUN" || this.environment.currentWeather === "YOMG‘IR"); this.camera.update(safeDelta, this.player, controls.nitro && controls.throttle > 0.3); this.audio.update(this.player.speed, controls.nitro, this.player.braking, this.player.drifting, this.player.offRoad);
    this.hud.update({ speed: this.player.speedKph, nitro: this.player.nitroPercent, lap: this.race.lap, totalLaps: this.race.totalLaps, position: this.race.position, countdown: this.raceState === "countdown" ? this.countdown : null, weather: this.environment.currentWeather, raceState: this.raceState, graphics: this.graphics, elapsed: this.elapsed, cameraMode: this.camera.currentMode, drifting: this.player.drifting, playerMap: this.mapPoint(this.player.root.position), rivalsMap: this.rivals.map((rival) => this.mapPoint(rival.position)), highestUnlockedRegion: this.progress.highestUnlockedRegion, selectedRegion: this.region, garage: this.progress.garage, warning: this.warning });
  }
  dispose(): void { window.removeEventListener("keydown", this.handleKey); this.input.dispose(); this.hud.dispose(); this.audio.dispose(); }
  get weather(): WeatherMode { return this.environment.currentWeather; }
}
