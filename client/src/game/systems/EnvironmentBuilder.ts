import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import type { Scene } from "@babylonjs/core/scene";
import { ASSETS } from "../assets";
import type { TrackData } from "./TrackBuilder";

export type WeatherMode = "KUN" | "SHOM" | "YOMG‘IR" | "TUN";

export class EnvironmentBuilder {
  private readonly hemisphere: HemisphericLight;
  private readonly sun: DirectionalLight;
  private readonly skyMaterial: StandardMaterial;
  private readonly lamps: StandardMaterial[] = [];
  private weather: WeatherMode = "KUN";
  private time = 0;

  constructor(private readonly scene: Scene, track: TrackData) {
    this.scene.clearColor = new Color4(0.41, 0.68, 0.82, 1);
    this.hemisphere = new HemisphericLight("sky-fill", new Vector3(0.2, 1, 0.1), scene);
    this.hemisphere.intensity = 0.88;
    this.hemisphere.groundColor = new Color3(0.28, 0.21, 0.15);
    this.sun = new DirectionalLight("sun", new Vector3(-0.45, -1, -0.2), scene);
    this.sun.position = new Vector3(55, 70, -40);
    this.sun.intensity = 1.18;

    const ground = MeshBuilder.CreateGround("tashkent-steppe", { width: 260, height: 220, subdivisions: 2 }, scene);
    const groundMaterial = new StandardMaterial("steppe-material", scene);
    const steppeTexture = new Texture(ASSETS.steppe, scene);
    steppeTexture.uScale = 16;
    steppeTexture.vScale = 14;
    groundMaterial.diffuseTexture = steppeTexture;
    groundMaterial.specularColor = Color3.Black();
    ground.material = groundMaterial;

    const backdrop = MeshBuilder.CreatePlane("tashkent-foothills", { width: 520, height: 105 }, scene);
    backdrop.position = new Vector3(0, 42, 210);
    backdrop.rotation.y = Math.PI;
    const backdropMaterial = new StandardMaterial("foothills-material", scene);
    backdropMaterial.diffuseTexture = new Texture(ASSETS.foothills, scene);
    backdropMaterial.emissiveColor = new Color3(0.33, 0.33, 0.33);
    backdropMaterial.backFaceCulling = false;
    backdrop.material = backdropMaterial;

    const sky = MeshBuilder.CreateSphere("sky-dome", { diameter: 420, segments: 16, sideOrientation: 1 }, scene);
    this.skyMaterial = new StandardMaterial("sky-material", scene);
    this.skyMaterial.backFaceCulling = false;
    this.skyMaterial.diffuseColor = new Color3(0.22, 0.52, 0.7);
    this.skyMaterial.emissiveColor = new Color3(0.1, 0.24, 0.35);
    this.skyMaterial.specularColor = Color3.Black();
    sky.material = this.skyMaterial;
    this.addRoadsideProps(track);
    this.setWeather("KUN");
  }

  private addRoadsideProps(track: TrackData): void {
    const trunkMaterial = new StandardMaterial("poplar-trunk", this.scene); trunkMaterial.diffuseColor = new Color3(0.27, 0.19, 0.12);
    const leafMaterial = new StandardMaterial("poplar-leaf", this.scene); leafMaterial.diffuseColor = new Color3(0.08, 0.25, 0.16);
    const plasterMaterial = new StandardMaterial("village-plaster", this.scene); plasterMaterial.diffuseColor = new Color3(0.72, 0.64, 0.51);
    const roofMaterial = new StandardMaterial("village-roof", this.scene); roofMaterial.diffuseColor = new Color3(0.45, 0.16, 0.09);
    const blueMaterial = new StandardMaterial("road-sign-blue", this.scene); blueMaterial.diffuseColor = new Color3(0.04, 0.24, 0.53); blueMaterial.emissiveColor = new Color3(0.005, 0.015, 0.04);
    const signalRed = new StandardMaterial("signal-red", this.scene); signalRed.diffuseColor = new Color3(0.55, 0.02, 0.01); signalRed.emissiveColor = new Color3(0.35, 0, 0);
    const signalGreen = new StandardMaterial("signal-green", this.scene); signalGreen.diffuseColor = new Color3(0.02, 0.45, 0.09); signalGreen.emissiveColor = new Color3(0, 0.26, 0.03);

    for (let index = 5; index < track.points.length; index += 5) {
      const side = index % 2 ? 1 : -1;
      const point = track.pointAt(index, side * (track.width / 2 + 8 + (index % 3) * 2));
      const trunk = MeshBuilder.CreateCylinder(`poplar-trunk-${index}`, { height: 5.5, diameter: 0.32, tessellation: 6 }, this.scene);
      trunk.position = point.add(new Vector3(0, 2.75, 0)); trunk.material = trunkMaterial;
      const foliage = MeshBuilder.CreateSphere(`poplar-foliage-${index}`, { diameterX: 2.1, diameterY: 5.4, diameterZ: 2.1, segments: 8 }, this.scene);
      foliage.position = point.add(new Vector3(0, 6.1, 0)); foliage.material = leafMaterial;
    }
    [12, 35, 61, 78].forEach((index, houseNumber) => {
      const base = track.pointAt(index, houseNumber % 2 ? 17 : -18);
      const home = MeshBuilder.CreateBox(`village-home-${houseNumber}`, { width: 8, height: 3.2, depth: 6.2 }, this.scene);
      home.position = base.add(new Vector3(0, 1.6, 0)); home.material = plasterMaterial;
      const roof = MeshBuilder.CreateBox(`village-roof-${houseNumber}`, { width: 8.55, height: 0.35, depth: 6.75 }, this.scene);
      roof.position = base.add(new Vector3(0, 3.38, 0)); roof.material = roofMaterial;
    });
    [20, 54].forEach((index) => {
      const point = track.pointAt(index, track.width / 2 + 2.3);
      const post = MeshBuilder.CreateCylinder(`sign-post-${index}`, { height: 2.5, diameter: 0.12, tessellation: 6 }, this.scene);
      post.position = point.add(new Vector3(0, 1.25, 0)); post.material = blueMaterial;
      const panel = MeshBuilder.CreateBox(`sign-panel-${index}`, { width: 2.7, height: 1.05, depth: 0.1 }, this.scene);
      panel.position = point.add(new Vector3(0, 2.25, 0)); panel.rotation.y = Math.atan2(track.tangents[index].x, track.tangents[index].z); panel.material = blueMaterial;
    });
    const junction = track.pointAt(3, -track.width / 2 - 2.5);
    const pole = MeshBuilder.CreateCylinder("junction-signal-pole", { height: 4.6, diameter: 0.16, tessellation: 8 }, this.scene);
    pole.position = junction.add(new Vector3(0, 2.3, 0)); pole.material = roofMaterial;
    const redLamp = MeshBuilder.CreateSphere("junction-red", { diameter: 0.38, segments: 12 }, this.scene); redLamp.position = junction.add(new Vector3(0, 4.1, 0)); redLamp.material = signalRed;
    const greenLamp = MeshBuilder.CreateSphere("junction-green", { diameter: 0.38, segments: 12 }, this.scene); greenLamp.position = junction.add(new Vector3(0, 3.55, 0)); greenLamp.material = signalGreen;
    for (let index = 2; index < track.points.length; index += 10) {
      const point = track.pointAt(index, -track.width / 2 - 3);
      const lampPole = MeshBuilder.CreateCylinder(`lamp-pole-${index}`, { height: 5.5, diameter: 0.09, tessellation: 6 }, this.scene);
      lampPole.position = point.add(new Vector3(0, 2.75, 0)); lampPole.material = roofMaterial;
      const lamp = MeshBuilder.CreateSphere(`lamp-glow-${index}`, { diameter: 0.28, segments: 8 }, this.scene);
      lamp.position = point.add(new Vector3(0, 5.45, 0));
      const lampMaterial = new StandardMaterial(`lamp-material-${index}`, this.scene);
      lampMaterial.diffuseColor = new Color3(0.95, 0.62, 0.18); lampMaterial.emissiveColor = new Color3(0.2, 0.08, 0.01); lamp.material = lampMaterial; this.lamps.push(lampMaterial);
    }
  }

  setWeather(mode: WeatherMode): void {
    this.weather = mode;
    const profiles: Record<WeatherMode, { clear: Color4; sky: Color3; sun: number; fill: number; fog: number; lamp: number }> = {
      KUN: { clear: new Color4(0.41, 0.68, 0.82, 1), sky: new Color3(0.22, 0.52, 0.7), sun: 1.18, fill: 0.88, fog: 0, lamp: 0.14 },
      SHOM: { clear: new Color4(0.64, 0.38, 0.23, 1), sky: new Color3(0.42, 0.16, 0.1), sun: 0.72, fill: 0.65, fog: 0.0018, lamp: 0.32 },
      "YOMG‘IR": { clear: new Color4(0.3, 0.37, 0.41, 1), sky: new Color3(0.11, 0.15, 0.18), sun: 0.46, fill: 0.5, fog: 0.0043, lamp: 0.42 },
      TUN: { clear: new Color4(0.015, 0.035, 0.08, 1), sky: new Color3(0.01, 0.02, 0.06), sun: 0.16, fill: 0.23, fog: 0.003, lamp: 0.95 },
    };
    const profile = profiles[mode];
    this.scene.clearColor = profile.clear; this.skyMaterial.diffuseColor = profile.sky; this.skyMaterial.emissiveColor = profile.sky.scale(0.4); this.sun.intensity = profile.sun; this.hemisphere.intensity = profile.fill;
    this.scene.fogEnabled = Boolean(profile.fog); this.scene.fogDensity = profile.fog; this.scene.fogColor = new Color3(profile.clear.r, profile.clear.g, profile.clear.b);
    this.lamps.forEach((material) => { material.emissiveColor = new Color3(profile.lamp, profile.lamp * 0.38, profile.lamp * 0.05); });
  }

  nextWeather(): WeatherMode { const variants: WeatherMode[] = ["KUN", "SHOM", "YOMG‘IR", "TUN"]; const index = (variants.indexOf(this.weather) + 1) % variants.length; this.setWeather(variants[index]); return this.weather; }
  update(delta: number): void { this.time += delta; const signalPulse = 0.72 + Math.sin(this.time * 1.8) * 0.28; this.lamps.forEach((material) => { material.alpha = Math.min(1, 0.85 + signalPulse * 0.15); }); }
  get currentWeather(): WeatherMode { return this.weather; }
}
