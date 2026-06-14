export interface StarPoint {
  /** position relative to the constellation's center, in px on the world canvas */
  dx: number;
  dy: number;
  /** relative size, 1 = base star */
  size: number;
}

export interface ConstellationData {
  id: string;
  name: string;
  meaning: string;
  /** 2-3 short, poetic lines */
  lore: string[];
  /** total completed tasks required to unlock this constellation */
  unlockAt: number;
  /** center position on the world canvas, in px */
  center: { x: number; y: number };
  /** stars belonging to this constellation, relative to center */
  stars: StarPoint[];
  /** pairs of star indices that connect once enough tasks are done */
  connections: [number, number][];
  /** tasks required before connections begin appearing within this constellation */
  connectAt: number;
}

export interface RegionData {
  id: string;
  name: string;
  description: string;
  /** total completed tasks required to fully clear this region's fog */
  unlockAt: number;
  /** center of the fog cloud, in px on the world canvas */
  center: { x: number; y: number };
  radius: number;
}

/** Overall world canvas size, in px - the "sky" users pan and zoom around */
export const WORLD_SIZE = { width: 2400, height: 1500 };

export const CONSTELLATIONS: ConstellationData[] = [
  {
    id: "dreamer",
    name: "The Dreamer",
    meaning: "Creativity",
    lore: [
      "Long ago, unfinished ideas drifted here, waiting for someone brave enough to build them.",
      "Each star is a thought that refused to fade.",
    ],
    unlockAt: 25,
    connectAt: 10,
    center: { x: 520, y: 360 },
    stars: [
      { dx: 0, dy: 0, size: 1.4 },
      { dx: 70, dy: -50, size: 1 },
      { dx: 150, dy: 10, size: 1.1 },
      { dx: 110, dy: 100, size: 0.9 },
      { dx: -60, dy: 80, size: 1 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [0, 4],
      [2, 3],
    ],
  },
  {
    id: "builder",
    name: "The Builder",
    meaning: "Execution",
    lore: [
      "Every structure in this sky began as a single completed task.",
      "Steady hands shaped these stars, one at a time.",
    ],
    unlockAt: 50,
    connectAt: 20,
    center: { x: 1080, y: 220 },
    stars: [
      { dx: 0, dy: 0, size: 1.3 },
      { dx: 90, dy: 30, size: 1.1 },
      { dx: 170, dy: -20, size: 1 },
      { dx: 60, dy: 110, size: 0.9 },
      { dx: -80, dy: 60, size: 1 },
      { dx: 220, dy: 70, size: 0.95 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [1, 3],
      [0, 4],
      [2, 5],
    ],
  },
  {
    id: "scholar",
    name: "The Scholar",
    meaning: "Learning",
    lore: [
      "Every question ever asked left a little light behind.",
      "Together, they form a quiet kind of wisdom.",
    ],
    unlockAt: 75,
    connectAt: 30,
    center: { x: 1700, y: 380 },
    stars: [
      { dx: 0, dy: 0, size: 1.2 },
      { dx: -90, dy: -40, size: 1 },
      { dx: 80, dy: -70, size: 0.95 },
      { dx: 40, dy: 90, size: 1.05 },
      { dx: -50, dy: 100, size: 0.9 },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 4],
    ],
  },
  {
    id: "explorer",
    name: "The Explorer",
    meaning: "Curiosity",
    lore: [
      "The fog was never meant to disappear. It exists to invite curiosity.",
      "These stars only shine for those who keep wondering what's next.",
    ],
    unlockAt: 100,
    connectAt: 40,
    center: { x: 360, y: 900 },
    stars: [
      { dx: 0, dy: 0, size: 1.3 },
      { dx: 100, dy: 40, size: 1 },
      { dx: 180, dy: -30, size: 0.9 },
      { dx: -70, dy: 70, size: 1.05 },
      { dx: 40, dy: 150, size: 0.95 },
      { dx: -140, dy: 30, size: 0.85 },
    ],
    connections: [
      [0, 1],
      [1, 2],
      [0, 3],
      [3, 4],
      [0, 5],
    ],
  },
  {
    id: "guardian",
    name: "The Guardian",
    meaning: "Consistency",
    lore: [
      "These stars never flicker. They simply wait, patient and unwavering.",
      "Each return visit makes them shine a little steadier.",
    ],
    unlockAt: 125,
    connectAt: 50,
    center: { x: 1020, y: 980 },
    stars: [
      { dx: 0, dy: 0, size: 1.35 },
      { dx: 110, dy: -10, size: 1 },
      { dx: -100, dy: 40, size: 1 },
      { dx: 60, dy: 110, size: 0.9 },
      { dx: -50, dy: 130, size: 0.95 },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 4],
    ],
  },
  {
    id: "navigator",
    name: "The Navigator",
    meaning: "Planning",
    lore: [
      "Long routes through the dark are easier with a little light to follow.",
      "These stars were placed by every plan that was kept.",
    ],
    unlockAt: 150,
    connectAt: 60,
    center: { x: 1780, y: 940 },
    stars: [
      { dx: 0, dy: 0, size: 1.25 },
      { dx: -120, dy: -30, size: 1 },
      { dx: 110, dy: 20, size: 1.05 },
      { dx: 50, dy: 120, size: 0.9 },
      { dx: -60, dy: 100, size: 0.95 },
      { dx: 190, dy: 90, size: 0.85 },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [2, 5],
      [0, 4],
      [4, 3],
    ],
  },
  {
    id: "alchemist",
    name: "The Alchemist",
    meaning: "Transformation",
    lore: [
      "What once felt heavy became light the moment it was finished.",
      "This is where effort quietly turns into ease.",
    ],
    unlockAt: 175,
    connectAt: 70,
    center: { x: 2120, y: 480 },
    stars: [
      { dx: 0, dy: 0, size: 1.3 },
      { dx: 90, dy: -60, size: 1 },
      { dx: -100, dy: -20, size: 0.95 },
      { dx: 70, dy: 90, size: 1.05 },
      { dx: -60, dy: 90, size: 0.9 },
    ],
    connections: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
];

/**
 * Large emotional regions, revealed as fog clears with sustained progress.
 * "Every 50 tasks: unlock a major emotional region."
 */
export const REGIONS: RegionData[] = [
  {
    id: "first-light",
    name: "First Light",
    description: "The small, familiar patch of sky where every journey begins.",
    unlockAt: 0,
    center: { x: 700, y: 600 },
    radius: 650,
  },
  {
    id: "calm-current",
    name: "The Calm Current",
    description: "A wide, slow drift of stars settling into place.",
    unlockAt: 50,
    center: { x: 1500, y: 650 },
    radius: 700,
  },
  {
    id: "quiet-reaches",
    name: "The Quiet Reaches",
    description: "Distant light, steady and unhurried.",
    unlockAt: 100,
    center: { x: 400, y: 1150 },
    radius: 650,
  },
  {
    id: "deep-horizon",
    name: "The Deep Horizon",
    description: "Where the known sky gives way to something larger.",
    unlockAt: 150,
    center: { x: 1900, y: 1150 },
    radius: 700,
  },
  {
    id: "edge-of-wonder",
    name: "The Edge of Wonder",
    description: "The farthest light anyone has reached - so far.",
    unlockAt: 250,
    center: { x: 2150, y: 600 },
    radius: 600,
  },
];

/** Milestones that trigger a cinematic Discovery Reveal */
export const MILESTONES = [25, 50, 100, 250, 500] as const;

export const MILESTONE_COPY: Record<number, { title: string; body: string }> = {
  25: {
    title: "A new constellation emerges",
    body: "Scattered stars have found each other, drawing the first shape in your sky.",
  },
  50: {
    title: "The cosmic clouds part",
    body: "A wide stretch of fog drifts away, revealing a calmer current beyond.",
  },
  100: {
    title: "An ancient region awakens",
    body: "Something old and quiet stirs in the distance, lit for the first time.",
  },
  250: {
    title: "A new celestial district appears",
    body: "The sky stretches further than before. There's more out there than you knew.",
  },
  500: {
    title: "The edge of the known universe expands",
    body: "Even the horizon has moved. Your sky is no longer the same shape it was.",
  },
};

/** NANI's occasional, gentle observations while exploring the world */
export const NANI_WORLD_LINES = [
  "The stars around The Builder seem brighter today.",
  "I sense new paths forming beyond the mist.",
  "Some of these stars have been waiting a long time. They don't mind.",
  "The fog moves slowly. So do we. That's alright.",
  "There's a quiet kind of progress happening here.",
];
