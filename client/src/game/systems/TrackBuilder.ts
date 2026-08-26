import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
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

function createPbrAsphalt(scene: Scene, name: string, repeats: number, tint = new Color3(0.36, 0.36, 0.34)): PBRMaterial {
  const material = new PBRMaterial(name, scene);
  const dryTexture = new Texture(ASSETS.asphaltDryAAA, scene);
  const wetTexture = new Texture(ASSETS.asphaltWetAAA, scene);
  [dryTexture, wetTexture].forEach((texture) => { texture.uScale = repeats; texture.vScale = 2.7; texture.anisotropicFilteringLevel = 8; });
  material.albedoTexture = dryTexture;
  material.albedoColor = tint;
  material.metallic = 0.04;
  material.roughness = 0.58;
  material.directIntensity = 1.08;
  material.environmentIntensity = 0.74;
  material.emissiveColor = tint.scale(0.13);
  material.metadata = { dryTexture, wetTexture };
  const metadata = (scene.metadata ??= {}) as { roadMaterials?: PBRMaterial[] };
  (metadata.roadMaterials ??= []).push(material);
  return material;
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
  const roadMaterial = createPbrAsphalt(scene, "road-material", 18, new Color3(0.33, 0.33, 0.31));
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
  markerMaterial.diffuseColor = new Color3(0.92, 0.88, 0.72);
  markerMaterial.emissiveColor = new Color3(0.025, 0.022, 0.014);
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

function buildSirdaryoLoopPoints(): Vector3[] {
  const points: Vector3[] = [];
  const count = 120;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const radiusX = 92 + Math.sin(theta * 2) * 8;
    const radiusZ = 48 + Math.cos(theta * 3) * 3;
    const x = Math.cos(theta) * radiusX;
    const z = Math.sin(theta) * radiusZ + Math.sin(theta * 2) * 10;
    points.push(new Vector3(x, 0.06, z));
  }
  return points;
}

export function buildSirdaryoTrack(scene: Scene): TrackData {
  const track = new TrackData(buildSirdaryoLoopPoints(), 10.8);
  const roadMaterial = createPbrAsphalt(scene, "sirdaryo-road-material", 25, new Color3(0.29, 0.3, 0.28));
  const shoulderMaterial = new StandardMaterial("sirdaryo-shoulder-material", scene);
  shoulderMaterial.diffuseColor = new Color3(0.36, 0.285, 0.14);
  shoulderMaterial.specularColor = Color3.Black();
  const markerMaterial = new StandardMaterial("sirdaryo-marker-material", scene);
  markerMaterial.diffuseColor = new Color3(0.68, 0.64, 0.49);
  markerMaterial.emissiveColor = new Color3(0.018, 0.014, 0.006);
  const railMaterial = new StandardMaterial("sirdaryo-rail-material", scene);
  railMaterial.diffuseColor = new Color3(0.46, 0.5, 0.48);

  for (let index = 0; index < track.points.length; index += 1) {
    const current = track.points[index];
    const next = track.points[(index + 1) % track.points.length];
    const midpoint = current.add(next).scale(0.5);
    const length = Vector3.Distance(current, next) + 0.55;
    const tangent = next.subtract(current).normalize();
    const shoulder = MeshBuilder.CreateBox(`sirdaryo-shoulder-${index}`, { width: track.width + 2.2, height: 0.05, depth: length + 0.2 }, scene);
    shoulder.position = new Vector3(midpoint.x, 0.03, midpoint.z);
    shoulder.rotation.y = Math.atan2(tangent.x, tangent.z);
    shoulder.material = shoulderMaterial;
    const road = MeshBuilder.CreateBox(`sirdaryo-road-${index}`, { width: track.width, height: 0.1, depth: length }, scene);
    road.position = new Vector3(midpoint.x, 0.1, midpoint.z);
    road.rotation.y = Math.atan2(tangent.x, tangent.z);
    road.material = roadMaterial;
  }
  for (let index = 0; index < track.points.length; index += 5) {
    const point = track.points[index];
    const tangent = track.tangents[index];
    const marker = MeshBuilder.CreateBox(`sirdaryo-marker-${index}`, { width: 0.24, height: 0.03, depth: 2.65 }, scene);
    marker.position = point.add(new Vector3(0, 0.16, 0));
    marker.rotation.y = Math.atan2(tangent.x, tangent.z);
    marker.material = markerMaterial;
  }
  for (let index = 6; index < track.points.length; index += 12) {
    const point = track.pointAt(index, -track.width / 2 - 1.75);
    const tangent = track.tangents[index];
    const rail = MeshBuilder.CreateBox(`sirdaryo-rail-${index}`, { width: 0.18, height: 0.52, depth: 11 }, scene);
    rail.position = point.add(new Vector3(0, 0.5, 0));
    rail.rotation.y = Math.atan2(tangent.x, tangent.z);
    rail.material = railMaterial;
  }
  return track;
}

function buildJizzaxLoopPoints(): Vector3[] {
  const points: Vector3[] = [];
  const count = 132;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const radiusX = 70 + Math.sin(theta * 4) * 12;
    const radiusZ = 54 + Math.cos(theta * 3) * 9;
    const x = Math.cos(theta) * radiusX + Math.sin(theta * 2) * 17;
    const z = Math.sin(theta) * radiusZ;
    points.push(new Vector3(x, 0.06, z));
  }
  return points;
}

export function buildJizzaxTrack(scene: Scene): TrackData {
  const track = new TrackData(buildJizzaxLoopPoints(), 9.2);
  const roadMaterial = createPbrAsphalt(scene, "jizzax-road-material", 23, new Color3(0.31, 0.32, 0.3));
  const shoulderMaterial = new StandardMaterial("jizzax-shoulder-material", scene);
  shoulderMaterial.diffuseColor = new Color3(0.33, 0.24, 0.14);
  const markerMaterial = new StandardMaterial("jizzax-marker-material", scene);
  markerMaterial.diffuseColor = new Color3(0.78, 0.7, 0.48);
  const railMaterial = new StandardMaterial("jizzax-rail-material", scene);
  railMaterial.diffuseColor = new Color3(0.48, 0.51, 0.48);
  for (let index = 0; index < track.points.length; index += 1) {
    const current = track.points[index]; const next = track.points[(index + 1) % track.points.length]; const midpoint = current.add(next).scale(0.5); const length = Vector3.Distance(current, next) + 0.6; const tangent = next.subtract(current).normalize();
    const shoulder = MeshBuilder.CreateBox(`jizzax-shoulder-${index}`, { width: track.width + 1.7, height: 0.05, depth: length + 0.18 }, scene); shoulder.position = new Vector3(midpoint.x, 0.03, midpoint.z); shoulder.rotation.y = Math.atan2(tangent.x, tangent.z); shoulder.material = shoulderMaterial;
    const road = MeshBuilder.CreateBox(`jizzax-road-${index}`, { width: track.width, height: 0.1, depth: length }, scene); road.position = new Vector3(midpoint.x, 0.1, midpoint.z); road.rotation.y = Math.atan2(tangent.x, tangent.z); road.material = roadMaterial;
  }
  for (let index = 0; index < track.points.length; index += 4) {
    const marker = MeshBuilder.CreateBox(`jizzax-marker-${index}`, { width: 0.24, height: 0.03, depth: 2.05 }, scene); marker.position = track.points[index].add(new Vector3(0, 0.16, 0)); marker.rotation.y = Math.atan2(track.tangents[index].x, track.tangents[index].z); marker.material = markerMaterial;
  }
  for (let index = 3; index < track.points.length; index += 7) {
    const point = track.pointAt(index, index % 2 ? track.width / 2 + 1.2 : -track.width / 2 - 1.2); const rail = MeshBuilder.CreateBox(`jizzax-rail-${index}`, { width: 0.15, height: 0.58, depth: 7.5 }, scene); rail.position = point.add(new Vector3(0, 0.54, 0)); rail.rotation.y = Math.atan2(track.tangents[index].x, track.tangents[index].z); rail.material = railMaterial;
  }
  return track;
}

const REGIONAL_SHAPES: Record<string, { x: number; z: number; waveX: number; waveZ: number; width: number; hue: Color3 }> = {
  samarqand: { x: 78, z: 49, waveX: 8, waveZ: 5, width: 9.4, hue: new Color3(0.16, 0.15, 0.13) },
  buxoro: { x: 102, z: 44, waveX: 4, waveZ: 3, width: 10.6, hue: new Color3(0.15, 0.13, 0.1) },
  navoiy: { x: 110, z: 52, waveX: 11, waveZ: 4, width: 10.4, hue: new Color3(0.13, 0.14, 0.13) },
  qashqadaryo: { x: 72, z: 58, waveX: 13, waveZ: 9, width: 9.2, hue: new Color3(0.14, 0.15, 0.13) },
  surxondaryo: { x: 75, z: 61, waveX: 9, waveZ: 12, width: 9.5, hue: new Color3(0.15, 0.14, 0.11) },
  andijon: { x: 70, z: 48, waveX: 6, waveZ: 6, width: 9.1, hue: new Color3(0.14, 0.15, 0.14) },
  namangan: { x: 74, z: 52, waveX: 7, waveZ: 8, width: 9.25, hue: new Color3(0.13, 0.15, 0.13) },
  fargona: { x: 86, z: 55, waveX: 10, waveZ: 7, width: 9.6, hue: new Color3(0.14, 0.15, 0.14) },
  xorazm: { x: 89, z: 46, waveX: 5, waveZ: 4, width: 10.1, hue: new Color3(0.16, 0.14, 0.11) },
};

export function buildRegionalTrack(scene: Scene, regionId: string): TrackData {
  const shape = REGIONAL_SHAPES[regionId] ?? REGIONAL_SHAPES.samarqand;
  const points: Vector3[] = [];
  const count = 116;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const x = Math.cos(theta) * (shape.x + Math.sin(theta * 3) * shape.waveX) + Math.sin(theta * 2) * shape.waveX;
    const z = Math.sin(theta) * (shape.z + Math.cos(theta * 2) * shape.waveZ) + Math.cos(theta * 3) * shape.waveZ;
    points.push(new Vector3(x, 0.06, z));
  }
  const track = new TrackData(points, shape.width);
  const roadMaterial = createPbrAsphalt(scene, `${regionId}-road-material`, 22, shape.hue.scale(2.18));
  const shoulderMaterial = new StandardMaterial(`${regionId}-shoulder-material`, scene); shoulderMaterial.diffuseColor = regionId === "buxoro" || regionId === "xorazm" ? new Color3(.39,.29,.13) : new Color3(.3,.25,.15);
  const markerMaterial = new StandardMaterial(`${regionId}-marker-material`, scene); markerMaterial.diffuseColor = new Color3(.72,.67,.49);
  for (let index = 0; index < track.points.length; index += 1) {
    const current = track.points[index]; const next = track.points[(index + 1) % track.points.length]; const midpoint = current.add(next).scale(.5); const length = Vector3.Distance(current, next) + .55; const tangent = next.subtract(current).normalize();
    const shoulder = MeshBuilder.CreateBox(`${regionId}-shoulder-${index}`, { width: track.width + 1.5, height: .05, depth: length + .16 }, scene); shoulder.position = new Vector3(midpoint.x, .03, midpoint.z); shoulder.rotation.y = Math.atan2(tangent.x, tangent.z); shoulder.material = shoulderMaterial;
    const road = MeshBuilder.CreateBox(`${regionId}-road-${index}`, { width: track.width, height: .1, depth: length }, scene); road.position = new Vector3(midpoint.x, .1, midpoint.z); road.rotation.y = Math.atan2(tangent.x, tangent.z); road.material = roadMaterial;
  }
  for (let index = 0; index < track.points.length; index += 4) { const marker = MeshBuilder.CreateBox(`${regionId}-marker-${index}`, { width:.23, height:.03, depth:2.1 }, scene); marker.position = track.points[index].add(new Vector3(0,.16,0)); marker.rotation.y = Math.atan2(track.tangents[index].x, track.tangents[index].z); marker.material = markerMaterial; }
  return track;
}
