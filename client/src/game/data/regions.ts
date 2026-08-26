export type RegionTerrain = "foothill" | "steppe" | "desert" | "valley" | "historic";

export interface RegionConfig {
  id: string;
  title: string;
  subtitle: string;
  terrain: RegionTerrain;
  lapCount: number;
  startIndex: number;
  primaryColor: string;
}

export const REGIONS: RegionConfig[] = [
  { id: "tashkent", title: "TOSHKENT", subtitle: "Halqa yo‘li", terrain: "foothill", lapCount: 3, startIndex: 90, primaryColor: "#F5A524" },
  { id: "sirdaryo", title: "SIRDARYO", subtitle: "Mirzacho‘l sprinti", terrain: "steppe", lapCount: 3, startIndex: 83, primaryColor: "#E9BC3D" },
  { id: "jizzax", title: "JIZZAX", subtitle: "Forish burilishlari", terrain: "foothill", lapCount: 3, startIndex: 0, primaryColor: "#D88B44" },
  { id: "samarqand", title: "SAMARQAND", subtitle: "Zarafshon yo‘li", terrain: "historic", lapCount: 3, startIndex: 0, primaryColor: "#43A2AC" },
  { id: "buxoro", title: "BUXORO", subtitle: "Qum yo‘li", terrain: "desert", lapCount: 3, startIndex: 0, primaryColor: "#C98643" },
  { id: "navoiy", title: "NAVOIY", subtitle: "Keng ufq", terrain: "desert", lapCount: 3, startIndex: 0, primaryColor: "#B3A66D" },
  { id: "qashqadaryo", title: "QASHQADARYO", subtitle: "Tog‘ etagi", terrain: "foothill", lapCount: 3, startIndex: 0, primaryColor: "#497151" },
  { id: "surxondaryo", title: "SURXONDARYO", subtitle: "Issiq vodiya", terrain: "valley", lapCount: 3, startIndex: 0, primaryColor: "#B85236" },
  { id: "andijon", title: "ANDIJON", subtitle: "Farg‘ona ritmi", terrain: "valley", lapCount: 3, startIndex: 0, primaryColor: "#4A936B" },
  { id: "namangan", title: "NAMANGAN", subtitle: "Bog‘lar orasida", terrain: "valley", lapCount: 3, startIndex: 0, primaryColor: "#75974E" },
  { id: "fargona", title: "FARG‘ONA", subtitle: "Vodiya halqasi", terrain: "valley", lapCount: 3, startIndex: 0, primaryColor: "#607BA7" },
  { id: "xorazm", title: "XORAZM", subtitle: "Qadimiy ufq", terrain: "historic", lapCount: 3, startIndex: 0, primaryColor: "#B9835B" },
];

export function getRegion(id: string): RegionConfig {
  return REGIONS.find((region) => region.id === id) ?? REGIONS[0];
}
