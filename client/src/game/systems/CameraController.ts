import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import type { Scene } from "@babylonjs/core/scene";
import type { Vehicle } from "../actors/Vehicle";

export type CameraMode = "CHASE" | "COCKPIT";

export class CameraController {
  readonly camera: UniversalCamera;
  private readonly target = new Vector3();
  private mode: CameraMode = "CHASE";

  constructor(scene: Scene) {
    this.camera = new UniversalCamera("race-camera", new Vector3(0, 5.8, -9), scene);
    this.camera.minZ = 0.1;
    this.camera.fov = 0.9;
    this.camera.inputs.clear();
    scene.activeCamera = this.camera;
  }

  toggle(): CameraMode {
    this.mode = this.mode === "CHASE" ? "COCKPIT" : "CHASE";
    return this.mode;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  get currentMode(): CameraMode {
    return this.mode;
  }

  update(delta: number, vehicle: Vehicle, nitroActive: boolean): void {
    const forward = new Vector3(Math.sin(vehicle.heading), 0, Math.cos(vehicle.heading));
    const right = new Vector3(forward.z, 0, -forward.x);
    const cockpit = this.mode === "COCKPIT";
    vehicle.setCockpitView(cockpit);
    const desiredPosition = cockpit
      ? vehicle.root.position.add(forward.scale(0.58)).add(new Vector3(0, 1.34, 0))
      : vehicle.root.position.subtract(forward.scale(8.9)).add(right.scale(vehicle.drift * 2.2)).add(new Vector3(0, 4.2, 0));
    const desiredTarget = cockpit
      ? vehicle.root.position.add(forward.scale(28)).add(new Vector3(0, 1.18, 0))
      : vehicle.root.position.add(forward.scale(10.5)).add(new Vector3(0, 1.05, 0));
    const positionEase = cockpit ? 10 : 5.4;
    const targetEase = cockpit ? 12 : 5.8;
    this.camera.position = Vector3.Lerp(this.camera.position, desiredPosition, Math.min(1, delta * positionEase));
    this.target.copyFrom(Vector3.Lerp(this.target, desiredTarget, Math.min(1, delta * targetEase)));
    this.camera.setTarget(this.target);
    const targetFov = cockpit ? (nitroActive ? 1.02 : 0.94) : (nitroActive ? 1.01 : 0.9);
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 4.4);
  }
}
