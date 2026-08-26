import "./hud.css";
import { ASSETS } from "../assets";
import { REGIONS } from "../data/regions";
import type { CameraMode } from "../systems/CameraController";

export interface MapMarker { x: number; y: number; }
export interface HudState {
  speed: number;
  nitro: number;
  lap: number;
  totalLaps: number;
  position: number;
  countdown: number | null;
  weather: string;
  raceState: "menu" | "countdown" | "racing" | "finished";
  graphics: "HIGH" | "MEDIUM" | "LOW";
  elapsed: number;
  cameraMode: CameraMode;
  drifting: boolean;
  playerMap: MapMarker;
  rivalsMap: MapMarker[];
  sirdaryoUnlocked: boolean;
  warning?: string;
}

interface Callbacks {
  onStart: () => void;
  onProfile: (profile: "HIGH" | "MEDIUM" | "LOW") => void;
  onWeather: () => void;
  onCamera: () => void;
  onRestart: () => void;
  onContinue: () => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  const hundredths = Math.floor((totalSeconds % 1) * 100).toString().padStart(2, "0");
  return `${minutes}:${seconds}.${hundredths}`;
}

export class HudController {
  private readonly root: HTMLElement;
  private readonly speed: HTMLElement;
  private readonly nitro: HTMLElement;
  private readonly position: HTMLElement;
  private readonly lap: HTMLElement;
  private readonly countdown: HTMLElement;
  private readonly message: HTMLElement;
  private readonly menu: HTMLElement;
  private readonly weather: HTMLElement;
  private readonly timer: HTMLElement;
  private readonly camera: HTMLElement;
  private readonly drift: HTMLElement;
  private readonly results: HTMLElement;
  private readonly resultPosition: HTMLElement;
  private readonly resultTime: HTMLElement;
  private readonly playerMarker: HTMLElement;
  private readonly rivalMarkers: HTMLElement[];
  private readonly sirdaryoChip: HTMLElement;
  private readonly profileButtons: HTMLElement[];

  constructor(callbacks: Callbacks) {
    const root = document.querySelector<HTMLElement>("#game-ui");
    if (!root) throw new Error("Game UI mount not found");
    this.root = root;
    const mapCards = REGIONS.map((region) => `<span class="region-chip ${region.unlocked ? "is-open" : "is-locked"}" data-region="${region.id}">${region.unlocked ? "01" : "—"} ${region.title}</span>`).join("");
    root.innerHTML = `
      <section class="game-menu is-visible" data-menu>
        <div class="menu-art" style="background-image:url('${ASSETS.visualTarget}')"></div><div class="menu-scrim"></div><div class="menu-side-rule"></div>
        <div class="menu-content"><div class="brand-lockup"><img src="${ASSETS.logo}" alt="" /><span>UZBEKISTAN<br/>AUTO RACE</span></div><p class="eyebrow">01 / OCHIQ BOSQICH</p><h1>TOSHKENT<br/><em>HALQASI</em></h1><p class="menu-copy">Tog‘oldi magistrali. Uch aylana. To‘rtta raqib. Burilish oldidan nitroni saqla.</p><div class="menu-meta"><span>3 AYLANMA</span><span>·</span><span>ANDROID READY</span><span>·</span><span>DRIVING DEMO</span></div><button class="launch-button" type="button" data-start><b>POYGANI BOSHLASH</b><span>ENTER</span></button><p class="controls-hint">TELEFON: RUL / GAZ / TORMOZ · KAMERA: CAM</p></div>
        <div class="region-strip"><span class="strip-label">VILOYATLAR / 01—12</span><div>${mapCards}</div></div>
      </section>
      <section class="race-hud" data-hud>
        <div class="telemetry-stack"><div class="location-tag"><img src="${ASSETS.logo}" alt="" /><div><span>TOSHKENT / 01</span><b>HALQA YO‘LI</b></div></div><div class="minimap-card"><span class="minimap-title">MINI XARITA</span><div class="minimap-route"></div><i class="map-dot player" data-map-player></i><i class="map-dot rival" data-map-rival="0"></i><i class="map-dot rival" data-map-rival="1"></i><i class="map-dot rival" data-map-rival="2"></i><i class="map-dot rival" data-map-rival="3"></i></div></div>
        <div class="race-status"><span>POZITSIYA</span><b data-position>5<small>/5</small></b><i></i><span>AYLANA</span><b data-lap>1<small>/3</small></b></div><div class="race-timer" data-time>00:00.00</div><div class="camera-card"><button type="button" data-camera>KAMERA: <span data-camera-name>ORQA</span></button></div>
        <div class="countdown" data-countdown></div><div class="finish-message" data-message></div><div class="drift-badge" data-drift>DRIFT</div>
        <div class="hud-bottom"><div class="weather-card"><button type="button" data-weather><span>OB-HAVO</span><b data-weather-name>KUN</b></button><small>TEGIB ALMASHTIR</small></div><div class="speed-cluster"><div class="speed-value"><b data-speed>000</b><span>KM/H</span></div><div class="nitro-track"><i data-nitro></i></div><span class="nitro-label">NITRO</span></div><div class="graphics-card"><span>GRAFIKA</span><div><button type="button" data-profile="HIGH">H</button><button type="button" data-profile="MEDIUM">M</button><button type="button" data-profile="LOW">L</button></div></div></div>
        <div class="touch-controls" aria-label="Mobil boshqaruvlar"><div class="steer-controls"><button class="touch-control" data-drive-action="left" type="button" aria-label="Chapga burish">‹</button><button class="touch-control" data-drive-action="right" type="button" aria-label="O‘ngga burish">›</button></div><div class="pedal-controls"><button class="touch-control brake" data-drive-action="brake" type="button">TORMOZ</button><button class="touch-control nitro" data-drive-action="nitro" type="button">N₂O</button><button class="touch-control throttle" data-drive-action="throttle" type="button">GAZ</button></div></div>
      </section>
      <section class="results-panel" data-results><div class="results-card"><p class="results-kicker">TOSHKENT / NATIJA</p><h2>MARRA<br/><em>YAKUN</em></h2><div class="results-stats"><span>JOYLASHUV<b data-result-position>—</b></span><span>VAQT<b data-result-time>00:00.00</b></span></div><p class="unlock-note"><b>SIRDARYO BOSQICHI OCHILDI.</b> Keyingi viloyat yo‘nalishi profilingizda saqlandi.</p><div class="result-actions"><button type="button" class="secondary" data-restart>QAYTA POYGA</button><button type="button" data-continue>SIRDARYONI OCH</button></div></div></section>`;
    this.speed = this.require("[data-speed]"); this.nitro = this.require("[data-nitro]"); this.position = this.require("[data-position]"); this.lap = this.require("[data-lap]"); this.countdown = this.require("[data-countdown]"); this.message = this.require("[data-message]"); this.menu = this.require("[data-menu]"); this.weather = this.require("[data-weather-name]"); this.timer = this.require("[data-time]"); this.camera = this.require("[data-camera-name]"); this.drift = this.require("[data-drift]"); this.results = this.require("[data-results]"); this.resultPosition = this.require("[data-result-position]"); this.resultTime = this.require("[data-result-time]"); this.playerMarker = this.require("[data-map-player]"); this.rivalMarkers = Array.from(root.querySelectorAll<HTMLElement>("[data-map-rival]")); this.sirdaryoChip = this.require("[data-region='sirdaryo']"); this.profileButtons = Array.from(root.querySelectorAll<HTMLElement>("[data-profile]"));
    this.require("[data-start]").addEventListener("click", callbacks.onStart); this.require("[data-weather]").addEventListener("click", callbacks.onWeather); this.require("[data-camera]").addEventListener("click", callbacks.onCamera); this.require("[data-restart]").addEventListener("click", callbacks.onRestart); this.require("[data-continue]").addEventListener("click", callbacks.onContinue); this.profileButtons.forEach((button) => button.addEventListener("click", () => callbacks.onProfile(button.dataset.profile as "HIGH" | "MEDIUM" | "LOW")));
  }

  private require(selector: string): HTMLElement { const element = this.root.querySelector<HTMLElement>(selector); if (!element) throw new Error(`Missing HUD element: ${selector}`); return element; }
  private place(marker: HTMLElement, point: MapMarker): void { marker.style.left = `${point.x}%`; marker.style.top = `${point.y}%`; }

  update(state: HudState): void {
    this.speed.textContent = state.speed.toString().padStart(3, "0"); this.nitro.style.width = `${Math.max(0, Math.min(100, state.nitro))}%`; this.position.innerHTML = `${state.position}<small>/5</small>`; this.lap.innerHTML = `${Math.min(state.lap, state.totalLaps)}<small>/${state.totalLaps}</small>`; this.weather.textContent = state.weather; this.timer.textContent = formatTime(state.elapsed); this.camera.textContent = state.cameraMode === "CHASE" ? "ORQA" : "ICHKI"; this.countdown.textContent = state.countdown ? String(Math.max(1, Math.ceil(state.countdown))) : "";
    this.menu.classList.toggle("is-visible", state.raceState === "menu"); this.results.classList.toggle("is-visible", state.raceState === "finished"); this.message.textContent = state.warning ?? ""; this.message.classList.toggle("is-visible", Boolean(state.warning)); this.drift.classList.toggle("is-active", state.drifting); this.profileButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.profile === state.graphics)); this.place(this.playerMarker, state.playerMap); state.rivalsMap.forEach((point, index) => { if (this.rivalMarkers[index]) this.place(this.rivalMarkers[index], point); }); this.sirdaryoChip.classList.toggle("is-unlocked-now", state.sirdaryoUnlocked); this.sirdaryoChip.textContent = `${state.sirdaryoUnlocked ? "02" : "—"} SIRDARYO`;
    this.resultPosition.textContent = `${state.position}/5`; this.resultTime.textContent = formatTime(state.elapsed);
  }

  dispose(): void { this.root.innerHTML = ""; }
}
