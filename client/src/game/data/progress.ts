export interface GarageProgress {
  selectedCarId: string;
  paint: string;
  engineLevel: number;
  handlingLevel: number;
  nitroLevel: number;
}

export interface GameProgress {
  highestUnlockedRegion: number;
  selectedRegionId: string;
  garage: GarageProgress;
}

const STORAGE_KEY = "uzbekistan-auto-race-v2-progress";

export const DEFAULT_PROGRESS: GameProgress = {
  highestUnlockedRegion: 0,
  selectedRegionId: "tashkent",
  garage: { selectedCarId: "cobalt", paint: "#F0F0EB", engineLevel: 0, handlingLevel: 0, nitroLevel: 0 },
};

export function loadProgress(): GameProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(DEFAULT_PROGRESS);
    const parsed = JSON.parse(stored) as Partial<GameProgress>;
    return {
      highestUnlockedRegion: Math.max(0, parsed.highestUnlockedRegion ?? 0),
      selectedRegionId: parsed.selectedRegionId ?? "tashkent",
      garage: { ...DEFAULT_PROGRESS.garage, ...(parsed.garage ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}

export function saveProgress(progress: GameProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
