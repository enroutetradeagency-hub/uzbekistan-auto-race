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

  constructor(private readonly scene: Scene, track: TrackData, private readonly regionId = "tashkent") {
    this.scene.clearColor = new Color4(0.34, 0.56, 0.68, 1);
    this.hemisphere = new HemisphericLight("sky-fill", new Vector3(0.2, 1, 0.1), scene);
    this.hemisphere.intensity = 0.88;
    this.hemisphere.groundColor = new Color3(0.22, 0.17, 0.11);
    this.sun = new DirectionalLight("sun", new Vector3(-0.45, -1, -0.2), scene);
    this.sun.position = new Vector3(55, 70, -40);
    this.sun.intensity = 1.18;

    const isSirdaryo = regionId === "sirdaryo";
    const isJizzax = regionId === "jizzax";
    const ground = MeshBuilder.CreateGround(`${regionId}-ground`, { width: isSirdaryo ? 390 : isJizzax ? 310 : 260, height: isSirdaryo ? 290 : isJizzax ? 270 : 220, subdivisions: 2 }, scene);
    const groundMaterial = new StandardMaterial("steppe-material", scene);
    const steppeTexture = new Texture(ASSETS.steppe, scene);
    steppeTexture.uScale = isSirdaryo ? 28 : isJizzax ? 22 : 16;
    steppeTexture.vScale = isSirdaryo ? 22 : isJizzax ? 20 : 14;
    groundMaterial.diffuseTexture = steppeTexture;
    groundMaterial.specularColor = Color3.Black();
    ground.material = groundMaterial;

    if (regionId === "tashkent") {
      const backdrop = MeshBuilder.CreatePlane("tashkent-foothills", { width: 520, height: 105 }, scene);
      backdrop.position = new Vector3(0, 42, 210);
      backdrop.rotation.y = Math.PI;
      const backdropMaterial = new StandardMaterial("foothills-material", scene);
      backdropMaterial.diffuseTexture = new Texture(ASSETS.foothills, scene);
      backdropMaterial.emissiveColor = new Color3(0.33, 0.33, 0.33);
      backdropMaterial.backFaceCulling = false;
      backdrop.material = backdropMaterial;
    }

    const sky = MeshBuilder.CreateSphere("sky-dome", { diameter: 420, segments: 16, sideOrientation: 1 }, scene);
    this.skyMaterial = new StandardMaterial("sky-material", scene);
    this.skyMaterial.backFaceCulling = false;
    this.skyMaterial.diffuseColor = new Color3(0.17, 0.38, 0.48);
    this.skyMaterial.emissiveColor = new Color3(0.065, 0.14, 0.18);
    this.skyMaterial.specularColor = Color3.Black();
    sky.material = this.skyMaterial;
    if (isSirdaryo) this.addSirdaryoProps(track); else if (isJizzax) this.addJizzaxProps(track); else if (regionId === "tashkent") this.addRoadsideProps(track); else this.addRegionalProps(track);
    this.setWeather("KUN");
  }

  private addRegionalProps(track: TrackData): void {
    const desert = ["buxoro", "navoiy"].includes(this.regionId);
    const historic = ["samarqand", "xorazm"].includes(this.regionId);
    const valley = ["andijon", "namangan", "fargona", "surxondaryo"].includes(this.regionId);
    const trunkMaterial = new StandardMaterial(`${this.regionId}-trunk`, this.scene); trunkMaterial.diffuseColor = new Color3(.24,.16,.09);
    const leafMaterial = new StandardMaterial(`${this.regionId}-leaf`, this.scene); leafMaterial.diffuseColor = valley ? new Color3(.08,.33,.13) : new Color3(.18,.28,.12);
    const wallMaterial = new StandardMaterial(`${this.regionId}-wall`, this.scene); wallMaterial.diffuseColor = historic ? new Color3(.67,.49,.28) : desert ? new Color3(.61,.47,.27) : new Color3(.64,.58,.46);
    const roofMaterial = new StandardMaterial(`${this.regionId}-roof`, this.scene); roofMaterial.diffuseColor = historic ? new Color3(.14,.34,.39) : new Color3(.36,.17,.08);
    const terrainMaterial = new StandardMaterial(`${this.regionId}-terrain`, this.scene); terrainMaterial.diffuseColor = desert ? new Color3(.45,.34,.16) : new Color3(.28,.28,.17);
    const blueMaterial = new StandardMaterial(`${this.regionId}-sign`, this.scene); blueMaterial.diffuseColor = new Color3(.03,.22,.5);
    for (let index = 5; index < track.points.length; index += valley ? 4 : 7) {
      const side = index % 2 ? 1 : -1; const point = track.pointAt(index, side * (track.width / 2 + 9 + (index % 3) * 2));
      if (desert) {
        const dune = MeshBuilder.CreateSphere(`${this.regionId}-dune-${index}`, { diameterX: 13, diameterY: 3.5, diameterZ: 9, segments: 10 }, this.scene); dune.position = point.add(new Vector3(0, .8, 0)); dune.material = terrainMaterial;
      } else {
        const trunk = MeshBuilder.CreateCylinder(`${this.regionId}-tree-trunk-${index}`, { height: 5.2, diameter:.25, tessellation:6 }, this.scene); trunk.position = point.add(new Vector3(0,2.6,0)); trunk.material = trunkMaterial;
        const foliage = MeshBuilder.CreateSphere(`${this.regionId}-tree-leaf-${index}`, { diameterX: valley ? 3.1 : 2, diameterY: valley ? 3 : 5.1, diameterZ: valley ? 3 : 2, segments:8 }, this.scene); foliage.position = point.add(new Vector3(0, valley ? 4.8 : 5.7, 0)); foliage.material = leafMaterial;
      }
    }
    [16, 48, 79].forEach((trackIndex, houseIndex) => {
      const point = track.pointAt(trackIndex, houseIndex % 2 ? 19 : -19); const home = MeshBuilder.CreateBox(`${this.regionId}-home-${houseIndex}`, { width:8, height:historic ? 4.1 : 3.2, depth:6.3 }, this.scene); home.position = point.add(new Vector3(0, historic ? 2.05 : 1.6, 0)); home.material = wallMaterial;
      const roof = historic ? MeshBuilder.CreateSphere(`${this.regionId}-dome-${houseIndex}`, { diameter:4.7, segments:12 }, this.scene) : MeshBuilder.CreateBox(`${this.regionId}-roof-${houseIndex}`, { width:8.6, height:.35, depth:6.9 }, this.scene); roof.position = point.add(new Vector3(0, historic ? 4.45 : 3.4, 0)); roof.material = roofMaterial;
    });
    if (historic) [28, 58].forEach((trackIndex, towerIndex) => { const point = track.pointAt(trackIndex, towerIndex ? -24 : 24); const tower = MeshBuilder.CreateCylinder(`${this.regionId}-tower-${towerIndex}`, { height:12, diameter:2.4, tessellation:10 }, this.scene); tower.position = point.add(new Vector3(0,6,0)); tower.material = wallMaterial; });
    if (!desert && !historic && !valley) [[-120,40],[105,-60]].forEach(([x,z], index) => { const hill = MeshBuilder.CreateSphere(`${this.regionId}-hill-${index}`, { diameterX:54, diameterY:23, diameterZ:42, segments:12 }, this.scene); hill.position = new Vector3(x,5,z); hill.material = terrainMaterial; });
    [24, 65, 100].forEach((trackIndex) => { const point = track.pointAt(trackIndex, track.width / 2 + 2.4); const post = MeshBuilder.CreateCylinder(`${this.regionId}-sign-post-${trackIndex}`, { height:2.6, diameter:.1, tessellation:6 }, this.scene); post.position = point.add(new Vector3(0,1.3,0)); post.material = blueMaterial; const sign = MeshBuilder.CreateBox(`${this.regionId}-sign-${trackIndex}`, { width:2.8, height:1.1, depth:.1 }, this.scene); sign.position = point.add(new Vector3(0,2.35,0)); sign.rotation.y = Math.atan2(track.tangents[trackIndex].x, track.tangents[trackIndex].z); sign.material = blueMaterial; });
  }

  private addJizzaxProps(track: TrackData): void {
    const rockMaterial = new StandardMaterial("jizzax-rock", this.scene); rockMaterial.diffuseColor = new Color3(0.32, 0.27, 0.2); rockMaterial.specularColor = Color3.Black();
    const slopeMaterial = new StandardMaterial("jizzax-slope", this.scene); slopeMaterial.diffuseColor = new Color3(0.42, 0.35, 0.2); slopeMaterial.specularColor = Color3.Black();
    const trunkMaterial = new StandardMaterial("jizzax-trunk", this.scene); trunkMaterial.diffuseColor = new Color3(0.22, 0.15, 0.08);
    const leafMaterial = new StandardMaterial("jizzax-leaf", this.scene); leafMaterial.diffuseColor = new Color3(0.12, 0.3, 0.12);
    const wallMaterial = new StandardMaterial("jizzax-wall", this.scene); wallMaterial.diffuseColor = new Color3(0.63, 0.57, 0.46);
    const roofMaterial = new StandardMaterial("jizzax-roof", this.scene); roofMaterial.diffuseColor = new Color3(0.32, 0.15, 0.08);
    const signMaterial = new StandardMaterial("jizzax-sign", this.scene); signMaterial.diffuseColor = new Color3(0.04, 0.24, 0.52);
    [[-144, 75, 34], [-118, -108, 29], [132, 92, 36], [148, -85, 32], [10, 148, 26]].forEach(([x, z, height], index) => {
      const base = MeshBuilder.CreateSphere(`jizzax-mountain-base-${index}`, { diameterX: 58 + index * 5, diameterY: height * 1.45, diameterZ: 46 + index * 4, segments: 14 }, this.scene);
      base.position = new Vector3(x, height * .24 - 2, z); base.material = index % 2 ? slopeMaterial : rockMaterial;
      const cap = MeshBuilder.CreateSphere(`jizzax-mountain-cap-${index}`, { diameterX: 30 + index * 3, diameterY: height * .75, diameterZ: 24 + index * 2, segments: 12 }, this.scene);
      cap.position = new Vector3(x + 7, height * .72 - 2, z - 4); cap.material = rockMaterial;
    });
    for (let index = 5; index < track.points.length; index += 5) {
      const side = index % 2 ? 1 : -1; const point = track.pointAt(index, side * (track.width / 2 + 8 + (index % 3) * 1.8));
      const trunk = MeshBuilder.CreateCylinder(`jizzax-tree-trunk-${index}`, { height: 4.8, diameter: 0.28, tessellation: 6 }, this.scene); trunk.position = point.add(new Vector3(0, 2.4, 0)); trunk.material = trunkMaterial;
      const foliage = MeshBuilder.CreateSphere(`jizzax-tree-leaf-${index}`, { diameterX: 2.1, diameterY: 4.4, diameterZ: 2, segments: 8 }, this.scene); foliage.position = point.add(new Vector3(0, 5, 0)); foliage.material = leafMaterial;
    }
    [11, 46, 82, 115].forEach((trackIndex, houseIndex) => {
      const point = track.pointAt(trackIndex, houseIndex % 2 ? 18 : -18); const home = MeshBuilder.CreateBox(`jizzax-home-${houseIndex}`, { width: 7.5, height: 3.3, depth: 6.4 }, this.scene); home.position = point.add(new Vector3(0, 1.65, 0)); home.material = wallMaterial;
      const roof = MeshBuilder.CreateBox(`jizzax-roof-${houseIndex}`, { width: 8.1, height: .35, depth: 7 }, this.scene); roof.position = point.add(new Vector3(0, 3.45, 0)); roof.material = roofMaterial;
    });
    [23, 67, 105].forEach((trackIndex) => {
      const point = track.pointAt(trackIndex, track.width / 2 + 2.4); const post = MeshBuilder.CreateCylinder(`jizzax-sign-post-${trackIndex}`, { height: 2.7, diameter: .1, tessellation: 6 }, this.scene); post.position = point.add(new Vector3(0, 1.35, 0)); post.material = signMaterial;
      const sign = MeshBuilder.CreateBox(`jizzax-sign-${trackIndex}`, { width: 2.8, height: 1.1, depth: .1 }, this.scene); sign.position = point.add(new Vector3(0, 2.38, 0)); sign.rotation.y = Math.atan2(track.tangents[trackIndex].x, track.tangents[trackIndex].z); sign.material = signMaterial;
    });
  }

  private addSirdaryoProps(track: TrackData): void {
    const trunkMaterial = new StandardMaterial("sirdaryo-poplar-trunk", this.scene); trunkMaterial.diffuseColor = new Color3(0.28, 0.19, 0.1);
    const leafMaterial = new StandardMaterial("sirdaryo-poplar-leaf", this.scene); leafMaterial.diffuseColor = new Color3(0.16, 0.34, 0.11);
    const fieldMaterial = new StandardMaterial("sirdaryo-field", this.scene); fieldMaterial.diffuseColor = new Color3(0.31, 0.34, 0.12);
    const dryFieldMaterial = new StandardMaterial("sirdaryo-dry-field", this.scene); dryFieldMaterial.diffuseColor = new Color3(0.43, 0.35, 0.16);
    const waterMaterial = new StandardMaterial("sirdaryo-canal-water", this.scene); waterMaterial.diffuseColor = new Color3(0.09, 0.34, 0.38); waterMaterial.emissiveColor = new Color3(0.02, 0.08, 0.1);
    const wallMaterial = new StandardMaterial("sirdaryo-village-wall", this.scene); wallMaterial.diffuseColor = new Color3(0.72, 0.67, 0.55);
    const roofMaterial = new StandardMaterial("sirdaryo-village-roof", this.scene); roofMaterial.diffuseColor = new Color3(0.2, 0.28, 0.23);
    const siloMaterial = new StandardMaterial("sirdaryo-silo", this.scene); siloMaterial.diffuseColor = new Color3(0.58, 0.62, 0.59); siloMaterial.specularColor = new Color3(0.32, 0.32, 0.32);
    const signMaterial = new StandardMaterial("sirdaryo-sign", this.scene); signMaterial.diffuseColor = new Color3(0.03, 0.25, 0.58);

    [[-112, -54], [-102, 66], [-52, -80], [54, -74], [98, 48], [17, 80]].forEach(([x, z], index) => {
      const field = MeshBuilder.CreateBox(`sirdaryo-field-${index}`, { width: index % 2 ? 32 : 42, height: 0.035, depth: index % 2 ? 48 : 27 }, this.scene);
      field.position = new Vector3(x, 0.03, z); field.material = index % 2 ? fieldMaterial : dryFieldMaterial;
    });
    [[-20, -115], [58, 93]].forEach(([x, z], index) => {
      const canal = MeshBuilder.CreateBox(`sirdaryo-canal-${index}`, { width: index ? 88 : 122, height: 0.05, depth: 2.6 }, this.scene);
      canal.position = new Vector3(x, 0.07, z); canal.rotation.y = index ? 0.28 : -0.18; canal.material = waterMaterial;
    });
    for (let index = 4; index < track.points.length; index += 6) {
      const side = index % 3 === 0 ? 1 : -1;
      const point = track.pointAt(index, side * (track.width / 2 + 8 + (index % 4) * 2));
      const trunk = MeshBuilder.CreateCylinder(`sirdaryo-poplar-trunk-${index}`, { height: 6.2, diameter: 0.28, tessellation: 6 }, this.scene);
      trunk.position = point.add(new Vector3(0, 3.1, 0)); trunk.material = trunkMaterial;
      const foliage = MeshBuilder.CreateSphere(`sirdaryo-poplar-leaf-${index}`, { diameterX: 1.8, diameterY: 6.2, diameterZ: 1.8, segments: 8 }, this.scene);
      foliage.position = point.add(new Vector3(0, 6.65, 0)); foliage.material = leafMaterial;
    }
    [17, 39, 73, 101].forEach((trackIndex, villageIndex) => {
      const base = track.pointAt(trackIndex, villageIndex % 2 ? 19 : -20);
      const house = MeshBuilder.CreateBox(`sirdaryo-house-${villageIndex}`, { width: 8, height: 3.1, depth: 6.5 }, this.scene);
      house.position = base.add(new Vector3(0, 1.55, 0)); house.material = wallMaterial;
      const roof = MeshBuilder.CreateBox(`sirdaryo-roof-${villageIndex}`, { width: 8.6, height: 0.32, depth: 7.1 }, this.scene);
      roof.position = base.add(new Vector3(0, 3.27, 0)); roof.material = roofMaterial;
    });
    [80, 83, 86].forEach((trackIndex, cityIndex) => {
      const base = track.pointAt(trackIndex, cityIndex === 1 ? 22 : -22);
      const shop = MeshBuilder.CreateBox(`sirdaryo-roadside-shop-${cityIndex}`, { width: 10 + cityIndex * 2, height: 4.1 + cityIndex * 0.7, depth: 7.5 }, this.scene);
      shop.position = base.add(new Vector3(0, 2.05 + cityIndex * 0.35, 0)); shop.material = cityIndex === 1 ? wallMaterial : siloMaterial;
      const awning = MeshBuilder.CreateBox(`sirdaryo-roadside-awning-${cityIndex}`, { width: 10.7 + cityIndex * 2, height: 0.25, depth: 1.1 }, this.scene);
      awning.position = base.add(new Vector3(0, 3.5 + cityIndex * 0.7, 4.2)); awning.material = roofMaterial;
    });
    [25, 27, 29].forEach((trackIndex, siloIndex) => {
      const base = track.pointAt(trackIndex, -26);
      const silo = MeshBuilder.CreateCylinder(`sirdaryo-silo-${siloIndex}`, { height: 9, diameter: 3.2, tessellation: 16 }, this.scene);
      silo.position = base.add(new Vector3(siloIndex * 3.6, 4.5, 0)); silo.material = siloMaterial;
    });
    [12, 57, 92].forEach((trackIndex) => {
      const point = track.pointAt(trackIndex, track.width / 2 + 2.4);
      const post = MeshBuilder.CreateCylinder(`sirdaryo-sign-post-${trackIndex}`, { height: 2.6, diameter: 0.1, tessellation: 6 }, this.scene);
      post.position = point.add(new Vector3(0, 1.3, 0)); post.material = signMaterial;
      const sign = MeshBuilder.CreateBox(`sirdaryo-sign-${trackIndex}`, { width: 2.8, height: 1.08, depth: 0.1 }, this.scene);
      sign.position = point.add(new Vector3(0, 2.34, 0)); sign.rotation.y = Math.atan2(track.tangents[trackIndex].x, track.tangents[trackIndex].z); sign.material = signMaterial;
    });
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
      KUN: { clear: new Color4(0.34, 0.56, 0.68, 1), sky: new Color3(0.17, 0.38, 0.48), sun: 1.08, fill: 0.77, fog: 0.00055, lamp: 0.14 },
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
