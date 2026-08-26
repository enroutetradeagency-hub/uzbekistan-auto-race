export type CarBodyStyle = "sedan" | "hatch" | "van" | "suv" | "premium";

export interface CarSpec {
  id: string;
  name: string;
  bodyStyle: CarBodyStyle;
  acceleration: number;
  maxSpeed: number;
  handling: number;
  defaultColor: string;
  description: string;
}

export const PAINTS = ["#F0F0EB", "#182D4D", "#B63A32", "#3F6841", "#D5A12A", "#555D68", "#F0F0F0"] as const;

export const CARS: CarSpec[] = [
  { id: "cobalt", name: "COBALT", bodyStyle: "sedan", acceleration: 19, maxSpeed: 58, handling: 1.05, defaultColor: "#F0F0EB", description: "Muvozanatli shahar sedani" },
  { id: "gentra", name: "GENTRA", bodyStyle: "sedan", acceleration: 18, maxSpeed: 56, handling: 1.1, defaultColor: "#555D68", description: "Aniq burilish uchun sedan" },
  { id: "nexia-2", name: "NEXIA 2", bodyStyle: "sedan", acceleration: 16, maxSpeed: 51, handling: 1.08, defaultColor: "#D6D7D8", description: "Yengil klassik sedan" },
  { id: "nexia-3", name: "NEXIA 3", bodyStyle: "sedan", acceleration: 17, maxSpeed: 53, handling: 1.12, defaultColor: "#B63A32", description: "Sport ruhidagi Nexia" },
  { id: "lacetti", name: "LACETTI", bodyStyle: "sedan", acceleration: 17, maxSpeed: 54, handling: 1.14, defaultColor: "#B8B8AE", description: "Silliq boshqariladigan sedan" },
  { id: "spark", name: "SPARK", bodyStyle: "hatch", acceleration: 15, maxSpeed: 46, handling: 1.3, defaultColor: "#D5A12A", description: "Yengil hatchback, tez buriladi" },
  { id: "damas", name: "DAMAS", bodyStyle: "van", acceleration: 12, maxSpeed: 39, handling: 0.86, defaultColor: "#F0F0F0", description: "Amaliy mikrovan" },
  { id: "malibu", name: "MALIBU", bodyStyle: "premium", acceleration: 23, maxSpeed: 64, handling: 0.98, defaultColor: "#182D4D", description: "Yuqori tezlikdagi premium sedan" },
  { id: "onix", name: "ONIX", bodyStyle: "sedan", acceleration: 19, maxSpeed: 57, handling: 1.16, defaultColor: "#3F6841", description: "Sport boshqaruvli sedan" },
  { id: "tracker", name: "TRACKER", bodyStyle: "suv", acceleration: 18, maxSpeed: 55, handling: 1.0, defaultColor: "#3F6841", description: "Yo‘l chetida barqaror SUV" },
];

export function getCar(id: string): CarSpec {
  return CARS.find((car) => car.id === id) ?? CARS[0];
}
