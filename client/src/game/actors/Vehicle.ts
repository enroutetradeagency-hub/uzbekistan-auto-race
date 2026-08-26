import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { TrackData } from "../systems/TrackBuilder";

export interface VehicleControls { throttle: number; brake: number; steer: number; nitro: boolean; }
const ZERO_CONTROLS: VehicleControls = { throttle: 0, brake: 0, steer: 0, nitro: false };

export class Vehicle {
  readonly root: TransformNode;
  readonly wheels: TransformNode[] = [];
  readonly name: string;
  speed = 0;
  heading = 0;
  nitro = 100;
  drift = 0;
  offRoad = false;
  braking = false;
  collisionFlash = 0;
  private readonly maxSpeed: number;
  private readonly acceleration: number;
  private readonly handling: number;
  private impactTimer = 0;
  private readonly brakeMaterials: StandardMaterial[] = [];
  private readonly cabin: Mesh;

  constructor(scene: Scene, name: string, color: string, options?: { maxSpeed?: number; acceleration?: number; handling?: number }) {
    this.name = name;
    this.maxSpeed = options?.maxSpeed ?? 56;
    this.acceleration = options?.acceleration ?? 18;
    this.handling = options?.handling ?? 1;
    this.root = new TransformNode(`${name}-root`, scene);
    const bodyMaterial = new StandardMaterial(`${name}-paint`, scene); bodyMaterial.diffuseColor = Color3.FromHexString(color); bodyMaterial.specularColor = new Color3(0.65, 0.65, 0.65); bodyMaterial.specularPower = 92;
    const darkMaterial = new StandardMaterial(`${name}-dark`, scene); darkMaterial.diffuseColor = new Color3(0.035, 0.045, 0.055); darkMaterial.specularColor = new Color3(0.14, 0.16, 0.18);
    const glassMaterial = new StandardMaterial(`${name}-glass`, scene); glassMaterial.diffuseColor = new Color3(0.08, 0.18, 0.23); glassMaterial.alpha = 0.86; glassMaterial.specularColor = new Color3(0.9, 0.9, 0.95);
    const lightMaterial = new StandardMaterial(`${name}-headlights`, scene); lightMaterial.diffuseColor = new Color3(0.95, 0.83, 0.5); lightMaterial.emissiveColor = new Color3(0.7, 0.48, 0.14);
    const chassis = MeshBuilder.CreateBox(`${name}-chassis`, { width: 1.85, height: 0.58, depth: 4.25 }, scene); chassis.parent = this.root; chassis.position.y = 0.72; chassis.material = bodyMaterial;
    this.cabin = MeshBuilder.CreateBox(`${name}-cabin`, { width: 1.55, height: 0.63, depth: 2.05 }, scene); this.cabin.parent = this.root; this.cabin.position = new Vector3(0, 1.22, -0.18); this.cabin.material = glassMaterial;
    const bumperFront = MeshBuilder.CreateBox(`${name}-bumper-front`, { width: 1.89, height: 0.18, depth: 0.2 }, scene); bumperFront.parent = this.root; bumperFront.position = new Vector3(0, 0.55, 2.14); bumperFront.material = darkMaterial;
    const bumperRear = MeshBuilder.CreateBox(`${name}-bumper-rear`, { width: 1.89, height: 0.18, depth: 0.2 }, scene); bumperRear.parent = this.root; bumperRear.position = new Vector3(0, 0.55, -2.14); bumperRear.material = darkMaterial;
    [-0.62, 0.62].forEach((x, side) => {
      const headlight = MeshBuilder.CreateBox(`${name}-headlight-${side}`, { width: 0.42, height: 0.13, depth: 0.08 }, scene); headlight.parent = this.root; headlight.position = new Vector3(x, 0.83, 2.18); headlight.material = lightMaterial;
      const brakeMaterial = new StandardMaterial(`${name}-brakes-${side}`, scene); brakeMaterial.diffuseColor = new Color3(0.55, 0.03, 0.02); brakeMaterial.emissiveColor = new Color3(0.16, 0, 0); this.brakeMaterials.push(brakeMaterial);
      const brake = MeshBuilder.CreateBox(`${name}-brake-${side}`, { width: 0.42, height: 0.13, depth: 0.08 }, scene); brake.parent = this.root; brake.position = new Vector3(x, 0.83, -2.18); brake.material = brakeMaterial;
    });
    const wheelMaterial = new StandardMaterial(`${name}-rubber`, scene); wheelMaterial.diffuseColor = new Color3(0.025, 0.025, 0.024); wheelMaterial.specularColor = Color3.Black();
    [[-0.98, 1.35], [0.98, 1.35], [-0.98, -1.35], [0.98, -1.35]].forEach(([x, z], index) => {
      const wheel = MeshBuilder.CreateCylinder(`${name}-wheel-${index}`, { diameter: 0.7, height: 0.28, tessellation: 18 }, scene); wheel.parent = this.root; wheel.position = new Vector3(x, 0.42, z); wheel.rotation.z = Math.PI / 2; wheel.material = wheelMaterial; this.wheels.push(wheel);
    });
  }

  reset(position: Vector3, heading: number): void {
    this.root.position.copyFrom(position); this.heading = heading; this.root.rotation.y = heading; this.speed = 0; this.nitro = 100; this.drift = 0; this.impactTimer = 0; this.collisionFlash = 0; this.braking = false;
  }

  update(delta: number, controls: VehicleControls = ZERO_CONTROLS, track: TrackData): void {
    this.impactTimer = Math.max(0, this.impactTimer - delta); this.collisionFlash = Math.max(0, this.collisionFlash - delta);
    this.braking = controls.brake > 0.15 && this.speed > 1;
    const forward = new Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const speedRatio = Math.min(Math.abs(this.speed) / this.maxSpeed, 1);
    const isUsingNitro = controls.nitro && controls.throttle > 0.4 && this.nitro > 0 && !this.offRoad;
    const drag = 1.4 + Math.abs(this.speed) * 0.042;
    const acceleration = controls.throttle * this.acceleration + (isUsingNitro ? 15 : 0) - controls.brake * 38 - Math.sign(this.speed || 1) * drag;
    this.speed = Math.max(-10, Math.min(this.maxSpeed + (isUsingNitro ? 11 : 0), this.speed + acceleration * delta));
    if (Math.abs(this.speed) < 0.3 && controls.throttle === 0 && controls.brake === 0) this.speed = 0;
    if (isUsingNitro) this.nitro = Math.max(0, this.nitro - 25 * delta); else this.nitro = Math.min(100, this.nitro + (this.braking ? 10 : 2.8) * delta);
    const steeringPower = (0.72 + (1 - speedRatio) * 0.7) * this.handling;
    const targetDrift = Math.abs(controls.steer) > 0.32 && Math.abs(this.speed) > 17 ? controls.steer * (this.braking ? 0.66 : 0.46) : 0;
    this.drift += (targetDrift - this.drift) * Math.min(1, delta * (this.braking ? 6.2 : 4.5));
    this.heading += controls.steer * steeringPower * Math.max(0.2, speedRatio) * delta * (this.speed >= 0 ? 1 : -1);
    this.root.position.addInPlace(forward.scale(this.speed * delta));
    this.root.position.addInPlace(new Vector3(Math.cos(this.heading), 0, -Math.sin(this.heading)).scale(this.drift * this.speed * delta * 0.23));
    const trackIndex = track.closestIndex(this.root.position);
    const distanceToCenter = track.distanceFromCenter(this.root.position, trackIndex);
    this.offRoad = distanceToCenter > track.width * 0.58;
    if (this.offRoad) this.speed *= Math.max(0.82, 1 - delta * 1.75);
    if (distanceToCenter > track.width * 1.48) {
      const lateral = Math.sign(Vector3.Dot(this.root.position.subtract(track.points[trackIndex]), track.normals[trackIndex])) || 1;
      const safePoint = track.pointAt(trackIndex, lateral * track.width * 0.36);
      this.root.position.x = safePoint.x; this.root.position.z = safePoint.z; this.heading = Math.atan2(track.tangents[trackIndex].x, track.tangents[trackIndex].z); this.speed *= 0.45; this.collisionFlash = 0.4;
    }
    this.root.rotation.y = this.heading + this.drift * 0.2; this.root.position.y = 0.06;
    this.brakeMaterials.forEach((material) => material.emissiveColor = this.braking ? new Color3(0.78, 0.01, 0.01) : new Color3(0.16, 0, 0));
    this.wheels.forEach((wheel, index) => { wheel.rotation.x += this.speed * delta * 2.25; if (index < 2) wheel.rotation.y = controls.steer * 0.38; });
  }

  get speedKph(): number { return Math.round(Math.max(0, this.speed) * 3.6); }
  get drifting(): boolean { return Math.abs(this.drift) > 0.18 && Math.abs(this.speed) > 16; }
  setCockpitView(enabled: boolean): void { this.cabin.isVisible = !enabled; }
  impact(): void { if (this.impactTimer > 0) return; this.impactTimer = 0.38; this.speed *= 0.52; this.nitro = Math.max(0, this.nitro - 14); this.collisionFlash = 0.38; }
}
