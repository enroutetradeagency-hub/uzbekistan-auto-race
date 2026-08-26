import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Scene } from "@babylonjs/core/scene";
import type { Vehicle } from "../actors/Vehicle";

export class CameraController {
  readonly camera: UniversalCamera;
  private readonly target = new Vector3();
  constructor(scene: Scene) { this.camera = new UniversalCamera("chase-camera", new Vector3(0, 5.8, -9), scene); this.camera.minZ = 0.1; this.camera.fov = 0.9; this.camera.inputs.clear(); scene.activeCamera = this.camera; }
  update(delta: number, vehicle: Vehicle, nitroActive: boolean): void {
    const forward = new Vector3(Math.sin(vehicle.heading), 0, Math.cos(vehicle.heading)); const right = new Vector3(forward.z, 0, -forward.x);
    const desiredPosition = vehicle.root.position.subtract(forward.scale(8.9)).add(right.scale(vehicle.drift * 2.2)).add(new Vector3(0, 4.2, 0));
    const desiredTarget = vehicle.root.position.add(forward.scale(10.5)).add(new Vector3(0, 1.05, 0));
    this.camera.position = Vector3.Lerp(this.camera.position, desiredPosition, Math.min(1, delta * 5.4)); this.target.copyFrom(Vector3.Lerp(this.target, desiredTarget, Math.min(1, delta * 5.8)));
    this.camera.setTarget(this.target); const targetFov = nitroActive ? 1.01 : 0.9; this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 4.4);
  }
}
