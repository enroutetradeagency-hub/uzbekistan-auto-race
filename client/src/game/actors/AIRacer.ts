import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { Vehicle } from "./Vehicle";
import type { TrackData } from "../systems/TrackBuilder";

export class AIRacer {
  readonly vehicle: Vehicle;
  private distance = 0;
  private pace: number;
  private laneOffset: number;
  private lap = 0;
  constructor(scene: Scene, name: string, color: string, pace: number, laneOffset: number) {
    this.vehicle = new Vehicle(scene, name, color, { maxSpeed: pace + 5, acceleration: 20 }); this.pace = pace; this.laneOffset = laneOffset;
  }
  reset(track: TrackData, startIndex: number): void {
    const normalizedIndex = ((startIndex % track.points.length) + track.points.length) % track.points.length;
    this.distance = normalizedIndex; this.lap = 0; const point = track.pointAt(normalizedIndex, this.laneOffset); const tangent = track.tangents[normalizedIndex]; this.vehicle.reset(point, Math.atan2(tangent.x, tangent.z));
  }
  update(delta: number, track: TrackData, raceActive: boolean): void {
    if (!raceActive) return;
    const previous = Math.floor(this.distance) % track.points.length; this.distance += (this.pace / 4.65) * delta; const next = Math.floor(this.distance) % track.points.length;
    if (next < previous) this.lap += 1;
    const wobble = Math.sin(this.distance * 0.19) * 0.38; const position = track.pointAt(next, this.laneOffset + wobble); const tangent = track.tangents[next];
    this.vehicle.root.position.copyFrom(position); this.vehicle.heading = Math.atan2(tangent.x, tangent.z); this.vehicle.root.rotation.y = this.vehicle.heading; this.vehicle.speed = this.pace; this.vehicle.root.position.y = 0.06;
  }
  get progress(): number { return this.lap * 10000 + this.distance; }
  get position(): Vector3 { return this.vehicle.root.position; }
}
