import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { Scene } from "@babylonjs/core/scene";
import { ASSETS } from "../assets";

export class TrackData {
  readonly points: Vector3[];
  readonly tangents: Vector3[];
  readonly normals: Vector3[];
  readonly width: number;

  constructor(points: Vector3[], width: number) {
    this.points = points;
    this.width = width;
    this.tangents = points.map((point, index) => {
      const next = points[(index + 1) % points.length];
      return next.subtract(point).normalize();
    });
    this.normals = this.tangents.map((tangent) => new Vector3(tangent.z, 0, -tangent.x).normalize());
  }

  closestIndex(position: Vector3): number {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    this.points.forEach((point, index) => {
      const dx = point.x - position.x;
      const dz = point.z - position.z;
      const distance = dx * dx + dz * dz;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  distanceFromCenter(position: Vector3, index: number): number {
    return Vector3.Distance(position, this.points[index]);
  }

  pointAt(index: number, offset = 0): Vector3 {
    const normalizedIndex = ((index % this.points.length) + this.points.length) % this.points.length;
    return this.points[normalizedIndex].add(this.normals[normalizedIndex].scale(offset));
  }
}

function buildLoopPoints(): Vector3[] {
  const points: Vector3[] = [];
  const count = 96;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const radiusX = 62 + Math.sin(theta * 3) * 5;
    const radiusZ = 41 + Math.cos(theta * 2) * 3;
    points.push(new Vector3(Math.cos(theta) * radiusX, 0.06, Math.sin(theta) * radiusZ));
  }
  return points;
}

export function buildTashkentTrack(scene: Scene): TrackData {
  const track = new TrackData(buildLoopPoints(), 9.6);
  const left = track.points.map((point, index) => point.add(track.normals[index].scale(track.width / 2)));
  const right = track.points.map((point, index) => point.subtract(track.normals[index].scale(track.width / 2)));

  const road = MeshBuilder.CreateRibbon(
    "tashkent-asphalt",
    { pathArray: [left, right], closeArray: false, closePath: true, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  );
  const roadMaterial = new StandardMaterial("road-material", scene);
  const roadTexture = new Texture(ASSETS.asphalt, scene);
  roadTexture.uScale = 18;
  roadTexture.vScale = 2.2;
  roadMaterial.diffuseTexture = roadTexture;
  roadMaterial.diffuseColor = new Color3(0.18, 0.18, 0.165);
  roadMaterial.specularColor = new Color3(0.03, 0.03, 0.03);
  road.material = roadMaterial;

  const shoulderMaterial = new StandardMaterial("shoulder-material", scene);
  shoulderMaterial.diffuseColor = new Color3(0.64, 0.48, 0.32);
  shoulderMaterial.specularColor = Color3.Black();
  const inner = track.points.map((point, index) => point.add(track.normals[index].scale(track.width / 2 + 0.75)));
  const outer = track.points.map((point, index) => point.subtract(track.normals[index].scale(track.width / 2 + 0.75)));
  const shoulder = MeshBuilder.CreateRibbon(
    "road-shoulder",
    { pathArray: [inner, outer], closeArray: false, closePath: true, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  );
  shoulder.material = shoulderMaterial;

  for (let index = 0; index < track.points.length; index += 1) {
    const current = track.points[index];
    const next = track.points[(index + 1) % track.points.length];
    const midpoint = current.add(next).scale(0.5);
    const segmentLength = Vector3.Distance(current, next) + 0.55;
    const tangent = next.subtract(current).normalize();
    const shoulderSegment = MeshBuilder.CreateBox(`shoulder-segment-${index}`, { width: track.width + 1.5, height: 0.045, depth: segmentLength + 0.18 }, scene);
    shoulderSegment.position = new Vector3(midpoint.x, 0.035, midpoint.z);
    shoulderSegment.rotation.y = Math.atan2(tangent.x, tangent.z);
    shoulderSegment.material = shoulderMaterial;
    const roadSegment = MeshBuilder.CreateBox(`road-segment-${index}`, { width: track.width, height: 0.09, depth: segmentLength }, scene);
    roadSegment.position = new Vector3(midpoint.x, 0.1, midpoint.z);
    roadSegment.rotation.y = Math.atan2(tangent.x, tangent.z);
    roadSegment.material = roadMaterial;
  }

  const markerMaterial = new StandardMaterial("marker-material", scene);
  markerMaterial.diffuseColor = new Color3(0.95, 0.73, 0.23);
  markerMaterial.emissiveColor = new Color3(0.16, 0.09, 0.01);
  markerMaterial.specularColor = Color3.Black();
  for (let index = 0; index < track.points.length; index += 4) {
    const point = track.points[index];
    const tangent = track.tangents[index];
    const marker = MeshBuilder.CreateBox(`lane-marker-${index}`, { width: 0.25, height: 0.025, depth: 2.3 }, scene);
    marker.position = point.add(new Vector3(0, 0.04, 0));
    marker.rotation.y = Math.atan2(tangent.x, tangent.z);
    marker.material = markerMaterial;
  }

  const guardrailMaterial = new StandardMaterial("guardrail-material", scene);
  guardrailMaterial.diffuseColor = new Color3(0.52, 0.56, 0.54);
  guardrailMaterial.specularColor = new Color3(0.45, 0.45, 0.45);
  for (let index = 4; index < track.points.length; index += 8) {
    const point = track.pointAt(index, -track.width / 2 - 1.4);
    const tangent = track.tangents[index];
    const rail = MeshBuilder.CreateBox(`guardrail-${index}`, { width: 0.16, height: 0.56, depth: 8.5 }, scene);
    rail.position = point.add(new Vector3(0, 0.52, 0));
    rail.rotation.y = Math.atan2(tangent.x, tangent.z);
    rail.material = guardrailMaterial;
  }
  return track;
}
