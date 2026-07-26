import { FahyEvolution } from "./PixelFahy";

export interface AnchorTransform {
  top: string;
  left: string;
  scale: number;
  rotation?: number;
}

export interface EvolutionSpec {
  id: FahyEvolution;
  level: number;
  name: string;
  zhName: string;
  baseScale: number; // Stature / Size multiplier (1.0 = base size)
  heightCm: number; // Virtual height representation in cm for UI stats
  massFactor: string; // e.g. "Compact Sprout", "Giant Ancient Spirit"
  anchors: {
    head: AnchorTransform;
    face: AnchorTransform;
    body: AnchorTransform;
    hand: AnchorTransform;
    companion: AnchorTransform;
  };
}

export const EVOLUTION_SPECS: Record<FahyEvolution, EvolutionSpec> = {
  sprout: {
    id: "sprout",
    level: 1,
    name: "The Sprout",
    zhName: "嫩芽精靈",
    baseScale: 0.72,
    heightCm: 25,
    massFactor: "Compact Baby Form",
    anchors: {
      head: { top: "-6%", left: "50%", scale: 0.78, rotation: 0 },
      face: { top: "28%", left: "50%", scale: 0.75, rotation: 0 },
      body: { top: "56%", left: "50%", scale: 0.8, rotation: 0 },
      hand: { top: "48%", left: "84%", scale: 0.8, rotation: 5 },
      companion: { top: "38%", left: "12%", scale: 0.85, rotation: -10 },
    },
  },
  potting_helper: {
    id: "potting_helper",
    level: 11,
    name: "The Potting Helper",
    zhName: "盆栽小助手",
    baseScale: 0.82,
    heightCm: 45,
    massFactor: "Young Sapling Form",
    anchors: {
      head: { top: "-8%", left: "50%", scale: 0.85, rotation: 0 },
      face: { top: "26%", left: "50%", scale: 0.82, rotation: 0 },
      body: { top: "54%", left: "50%", scale: 0.88, rotation: 0 },
      hand: { top: "45%", left: "83%", scale: 0.88, rotation: 5 },
      companion: { top: "36%", left: "14%", scale: 0.9, rotation: -8 },
    },
  },
  composter: {
    id: "composter",
    level: 21,
    name: "The Composter",
    zhName: "堆肥大將",
    baseScale: 0.92,
    heightCm: 70,
    massFactor: "Sturdy Soil Form",
    anchors: {
      head: { top: "-9%", left: "50%", scale: 0.92, rotation: 0 },
      face: { top: "25%", left: "50%", scale: 0.9, rotation: 0 },
      body: { top: "52%", left: "50%", scale: 0.95, rotation: 0 },
      hand: { top: "44%", left: "82%", scale: 0.95, rotation: 0 },
      companion: { top: "34%", left: "15%", scale: 0.95, rotation: -5 },
    },
  },
  community_gardener: {
    id: "community_gardener",
    level: 31,
    name: "The Community Gardener",
    zhName: "社區園丁",
    baseScale: 1.0,
    heightCm: 95,
    massFactor: "Full Standard Form",
    anchors: {
      head: { top: "-10%", left: "50%", scale: 1.0, rotation: 0 },
      face: { top: "24%", left: "50%", scale: 1.0, rotation: 0 },
      body: { top: "50%", left: "50%", scale: 1.0, rotation: 0 },
      hand: { top: "42%", left: "81%", scale: 1.0, rotation: 0 },
      companion: { top: "32%", left: "16%", scale: 1.0, rotation: 0 },
    },
  },
  urban_gardener: {
    id: "urban_gardener",
    level: 41,
    name: "The Urban Gardener",
    zhName: "都市花匠",
    baseScale: 1.08,
    heightCm: 120,
    massFactor: "Broad Blooming Form",
    anchors: {
      head: { top: "-11%", left: "50%", scale: 1.08, rotation: 0 },
      face: { top: "23%", left: "50%", scale: 1.05, rotation: 0 },
      body: { top: "49%", left: "50%", scale: 1.08, rotation: 0 },
      hand: { top: "40%", left: "80%", scale: 1.08, rotation: -2 },
      companion: { top: "30%", left: "17%", scale: 1.08, rotation: 2 },
    },
  },
  soil_tester: {
    id: "soil_tester",
    level: 51,
    name: "The Soil Tester",
    zhName: "泥土勘探家",
    baseScale: 1.15,
    heightCm: 145,
    massFactor: "Earthen Wise Form",
    anchors: {
      head: { top: "-12%", left: "50%", scale: 1.15, rotation: 0 },
      face: { top: "22%", left: "50%", scale: 1.12, rotation: 0 },
      body: { top: "48%", left: "50%", scale: 1.15, rotation: 0 },
      hand: { top: "39%", left: "79%", scale: 1.15, rotation: -4 },
      companion: { top: "28%", left: "18%", scale: 1.15, rotation: 4 },
    },
  },
  seed_librarian: {
    id: "seed_librarian",
    level: 61,
    name: "The Seed Librarian",
    zhName: "種子圖書管理員",
    baseScale: 1.22,
    heightCm: 170,
    massFactor: "Venerable Scholar Form",
    anchors: {
      head: { top: "-13%", left: "50%", scale: 1.22, rotation: 0 },
      face: { top: "21%", left: "50%", scale: 1.2, rotation: 0 },
      body: { top: "47%", left: "50%", scale: 1.22, rotation: 0 },
      hand: { top: "38%", left: "78%", scale: 1.22, rotation: -5 },
      companion: { top: "26%", left: "19%", scale: 1.22, rotation: 5 },
    },
  },
  pollinator_pal: {
    id: "pollinator_pal",
    level: 71,
    name: "The Pollinator Pal",
    zhName: "傳粉守護者",
    baseScale: 1.3,
    heightCm: 200,
    massFactor: "Winged Floral Form",
    anchors: {
      head: { top: "-14%", left: "50%", scale: 1.3, rotation: 0 },
      face: { top: "20%", left: "50%", scale: 1.28, rotation: 0 },
      body: { top: "46%", left: "50%", scale: 1.3, rotation: 0 },
      hand: { top: "36%", left: "77%", scale: 1.3, rotation: -6 },
      companion: { top: "24%", left: "20%", scale: 1.28, rotation: 6 },
    },
  },
  harvest_porter: {
    id: "harvest_porter",
    level: 81,
    name: "Harvest Porter",
    zhName: "豐收搬運領袖",
    baseScale: 1.38,
    heightCm: 235,
    massFactor: "Bountiful Giant Form",
    anchors: {
      head: { top: "-15%", left: "50%", scale: 1.38, rotation: 0 },
      face: { top: "19%", left: "50%", scale: 1.35, rotation: 0 },
      body: { top: "45%", left: "50%", scale: 1.38, rotation: 0 },
      hand: { top: "35%", left: "76%", scale: 1.38, rotation: -8 },
      companion: { top: "22%", left: "21%", scale: 1.35, rotation: 8 },
    },
  },
  ecosystem_guardian: {
    id: "ecosystem_guardian",
    level: 91,
    name: "Ecosystem Guardian",
    zhName: "生態終極守護神",
    baseScale: 1.48,
    heightCm: 280,
    massFactor: "Celestial Ancient Deity Form",
    anchors: {
      head: { top: "-16%", left: "50%", scale: 1.48, rotation: 0 },
      face: { top: "18%", left: "50%", scale: 1.45, rotation: 0 },
      body: { top: "44%", left: "50%", scale: 1.48, rotation: 0 },
      hand: { top: "33%", left: "75%", scale: 1.48, rotation: -10 },
      companion: { top: "20%", left: "22%", scale: 1.42, rotation: 10 },
    },
  },
};
