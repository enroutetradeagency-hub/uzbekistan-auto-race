import type { Vehicle } from "../actors/Vehicle";
import type { AIRacer } from "../actors/AIRacer";
import type { TrackData } from "./TrackBuilder";

export class RaceManager {
  lap = 1;
  readonly totalLaps = 3;
  position = 5;
  private previousIndex = 0;
  private playerProgress = 0;
  reset(track: TrackData): void { this.lap = 1; this.position = 5; this.previousIndex = track.points.length - 3; this.playerProgress = 0; }
  update(player: Vehicle, rivals: AIRacer[], track: TrackData): boolean {
    const index = track.closestIndex(player.root.position);
    if (this.previousIndex > track.points.length * 0.82 && index < track.points.length * 0.16 && player.speed > 8) this.lap += 1;
    this.previousIndex = index; this.playerProgress = (this.lap - 1) * 10000 + index; this.position = 1 + rivals.filter((rival) => rival.progress > this.playerProgress).length;
    return this.lap > this.totalLaps;
  }
}
