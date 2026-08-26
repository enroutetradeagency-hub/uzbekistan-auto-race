export interface RegionConfig {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
  terrain: "foothill" | "steppe" | "desert" | "valley" | "historic";
}

export const REGIONS: RegionConfig[] = [
  { id: "tashkent", title: "TOSHKENT", subtitle: "Halqa yo‘li", unlocked: true, terrain: "foothill" },
  { id: "sirdaryo", title: "SIRDARYO", subtitle: "Tekislik sprinti", unlocked: false, terrain: "steppe" },
  { id: "jizzax", title: "JIZZAX", subtitle: "Forish burilishlari", unlocked: false, terrain: "foothill" },
  { id: "samarqand", title: "SAMARQAND", subtitle: "Zarafshon yo‘li", unlocked: false, terrain: "historic" },
  { id: "buxoro", title: "BUXORO", subtitle: "Qum yo‘li", unlocked: false, terrain: "desert" },
  { id: "navoiy", title: "NAVOIY", subtitle: "Keng ufq", unlocked: false, terrain: "desert" },
  { id: "qashqadaryo", title: "QASHQADARYO", subtitle: "Tog‘ etagi", unlocked: false, terrain: "foothill" },
  { id: "surxondaryo", title: "SURXONDARYO", subtitle: "Issiq vodiya", unlocked: false, terrain: "valley" },
  { id: "andijon", title: "ANDIJON", subtitle: "Farg‘ona ritmi", unlocked: false, terrain: "valley" },
  { id: "namangan", title: "NAMANGAN", subtitle: "Bog‘lar orasida", unlocked: false, terrain: "valley" },
  { id: "fargona", title: "FARG‘ONA", subtitle: "Vodiya halqasi", unlocked: false, terrain: "valley" },
  { id: "xorazm", title: "XORAZM", subtitle: "Qadimiy ufq", unlocked: false, terrain: "historic" },
];
