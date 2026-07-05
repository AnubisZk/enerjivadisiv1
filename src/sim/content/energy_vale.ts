// Windwright Vale — a self-contained side-pocket on the eastern rim of
// Eastbrook Vale (levels 4-7), east of the Boar Meadow and south of the
// Fallen Chapel. Master Windwright Elara Sunmere is raising the vale's first
// sky-mill, laying out a sun-mirror array, and tapping a breathing steamvent —
// and everything that can go wrong on a build site has: kobolds from the
// Copper Dig strip her coil windings, mis-grounded current has woken into
// sparkwisps, and an unbalanced load is gathering itself into something worse.
//
// The quest chain follows a real renewable-energy workflow in fantasy dress:
// survey the site, secure the materials, assemble the blades, ground the
// current (safety before power), align the mirrors, then diagnose and put down
// the overload. Authored for the REpower Erasmus+ KA220-VET project (grant
// 2025-1-DK01-KA220-VET-000349624) as an educational content layer.
//
// Everything is merged into the flat engine tables by sim/data.ts, exactly the
// way content/temple.ts is. Nothing here touches the Gravecaller storyline.

import type {
  CampDef,
  GroundObjectDef,
  ItemDef,
  MobTemplate,
  NpcDef,
  PlayerClass,
  QuestDef,
  ZonePropsDef,
} from '../types';

// Archetype class-locks (match content/items.ts so REWARD_ARCHETYPE hand-offs
// land on an item the whole group can equip).
const WAR: PlayerClass[] = ['warrior', 'paladin', 'shaman'];
const MAG: PlayerClass[] = ['mage', 'priest', 'warlock', 'druid'];
const ROG: PlayerClass[] = ['rogue', 'hunter'];

// Elara's worksite camp on the eastern rim of Eastbrook Vale.
export const WINDWRIGHT_CAMP_POS = { x: 145, z: 58 };

// ---------------------------------------------------------------------------
// Mobs
// ---------------------------------------------------------------------------

export const ENERGY_VALE_MOBS: Record<string, MobTemplate> = {
  coil_scavenger: {
    id: 'coil_scavenger',
    name: 'Coil Scavenger',
    minLevel: 4,
    maxLevel: 5,
    family: 'kobold',
    hpBase: 40,
    hpPerLevel: 14,
    dmgBase: 5,
    dmgPerLevel: 1.8,
    attackSpeed: 2.0,
    armorPerLevel: 10,
    moveSpeed: 7.5,
    aggroRadius: 10,
    loot: [
      { copper: 40, chance: 1 },
      { itemId: 'copper_winding', chance: 0.65, questId: 'q_ev_windings' },
      { itemId: 'stripped_gearwheel', chance: 0.3 },
    ],
    scale: 0.95,
    color: 0xb8763a,
  },
  galespun_sprite: {
    id: 'galespun_sprite',
    name: 'Galespun Sprite',
    minLevel: 5,
    maxLevel: 6,
    family: 'elemental',
    hpBase: 44,
    hpPerLevel: 15,
    dmgBase: 6,
    dmgPerLevel: 1.9,
    attackSpeed: 1.8,
    armorPerLevel: 8,
    moveSpeed: 8.5,
    aggroRadius: 11,
    loot: [
      { copper: 45, chance: 1 },
      { itemId: 'whirl_of_chaff', chance: 0.3 },
    ],
    scale: 0.9,
    color: 0x9fd8c8,
  },
  sparkwisp: {
    id: 'sparkwisp',
    name: 'Sparkwisp',
    minLevel: 5,
    maxLevel: 6,
    family: 'elemental',
    hpBase: 46,
    hpPerLevel: 16,
    dmgBase: 6,
    dmgPerLevel: 2.0,
    attackSpeed: 1.9,
    armorPerLevel: 8,
    moveSpeed: 8,
    aggroRadius: 11,
    loot: [
      { copper: 50, chance: 1 },
      { itemId: 'charged_mote', chance: 0.35 },
    ],
    scale: 0.95,
    color: 0xf2d55c,
  },
  the_overcharge: {
    id: 'the_overcharge',
    name: 'The Overcharge',
    minLevel: 7,
    maxLevel: 7,
    family: 'elemental',
    boss: true,
    hpBase: 190,
    hpPerLevel: 32,
    dmgBase: 9,
    dmgPerLevel: 2.4,
    attackSpeed: 2.3,
    armorPerLevel: 22,
    moveSpeed: 7,
    aggroRadius: 14,
    aoePulse: { min: 8, max: 13, radius: 10, every: 10, name: 'Arc Flash' },
    enrage: { belowHpPct: 0.25, dmgMult: 1.3, hasteMult: 1.25 },
    loot: [
      { copper: 1200, chance: 1 },
      { itemId: 'fused_slag_core', chance: 1 },
      { itemId: 'stormtappers_charm', chance: 0.4 },
    ],
    scale: 1.45,
    color: 0xffe08a,
  },
};

// ---------------------------------------------------------------------------
// NPCs — Elara runs the worksite; Mira tends the cultural energy pavilion.
// ---------------------------------------------------------------------------

export const ENERGY_VALE_NPCS: Record<string, NpcDef> = {
  master_windwright_elara: {
    id: 'master_windwright_elara',
    name: 'Elara Sunmere',
    title: 'Master Windwright',
    pos: { x: 145, z: 58 },
    facing: 2.2,
    color: 0x2f8f6b,
    questIds: [
      'q_ev_survey',
      'q_ev_windings',
      'q_ev_blades',
      'q_ev_grounding',
      'q_ev_mirrors',
      'q_ev_overcharge',
    ],
    greeting:
      'Mind the cables, $C. The wind, the sun, the steam under this hill — the vale gives its power freely to anyone patient enough to measure first and build second. Most people skip the measuring. Most people also catch fire.',
  },
  mira_veyr: {
    id: 'mira_veyr',
    name: 'Mira Veyr',
    title: 'Pavilion Curator',
    pos: { x: 151, z: 66 },
    facing: -2.4,
    color: 0x2f6f86,
    questIds: [],
    greeting:
      'Welcome to the pavilion, $C. Every roofline here tells the same lesson in a different accent: wind needs room, sun needs angle, water needs patience, and heat needs respect. Walk slowly and the buildings will teach before I do.',
  },
  seren_valea: {
    id: 'seren_valea',
    name: 'Seren Valea',
    title: 'Valley Belle',
    pos: { x: 181, z: 101 },
    facing: -1.15,
    color: 0xd889b8,
    questIds: [],
    greeting:
      "You found the quiet fold of the vale, $C. Elara measures the wind where everyone can see it; I listen where it has to squeeze between stone and leaf. The strange walker behind me is harmless unless you insult its paint.",
  },
};

// ---------------------------------------------------------------------------
// Quests — a site-workflow chain: survey, materials, assembly, safety,
// commissioning, then the fault under load
// ---------------------------------------------------------------------------

export const ENERGY_VALE_QUESTS: Record<string, QuestDef> = {
  q_ev_survey: {
    id: 'q_ev_survey',
    name: 'Measure Twice, Build Once',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "Before a single beam goes up, $N, I need to know what this site actually gives — not what it looks like it gives. I've planted three survey posts: a wind gauge on the mill hill to the northwest, a sun gauge among the mirror frames east of camp, and a steam gauge at the vent on the far rise. Read all three and bring me the numbers. A builder who guesses at her resource is a builder digging her own footings twice.",
    completionText:
      'A steady norwester on the hill, six clean hours of sun on the flat, and the vent runs hot enough to scald a kettle from ten paces. Three sources, three readings, no guesswork. NOW we can build.',
    objectives: [
      { type: 'interact', targetObjectItemId: 'survey_post_wind', count: 1, label: 'Wind Survey Post read' },
      { type: 'interact', targetObjectItemId: 'survey_post_sun', count: 1, label: 'Sun Survey Post read' },
      { type: 'interact', targetObjectItemId: 'survey_post_steam', count: 1, label: 'Steam Survey Post read' },
    ],
    xpReward: 450,
    copperReward: 150,
    itemRewards: {},
    minLevel: 4,
  },
  q_ev_windings: {
    id: 'q_ev_windings',
    name: 'The Missing Windings',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "A mill without its copper windings is a very expensive pinwheel, $N. Kobolds from the old Copper Dig have found my supply crates — they can smell drawn copper through an oak plank. They're camped along the south slope, wearing my coil wire as jewelry. Thin them out and bring back five windings. Every build stands or falls on its supply line.",
    completionText:
      "Bent, chewed, one of them braided into a necklace — but copper is copper, and it'll wind true again. Materials secured. Remember this, $N: half of any build is simply keeping hold of your parts.",
    objectives: [
      { type: 'kill', targetMobId: 'coil_scavenger', count: 8, label: 'Coil Scavenger driven off' },
      { type: 'collect', itemId: 'copper_winding', count: 5, label: 'Copper Winding' },
    ],
    xpReward: 500,
    copperReward: 180,
    itemRewards: {},
    requiresQuest: 'q_ev_survey',
  },
  q_ev_blades: {
    id: 'q_ev_blades',
    name: 'Blades for the Sky-Mill',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "The mill blades came up from Eastbrook in crates, and the carter dropped them wherever the mud let him — scattered halfway up the mill hill. Fetch me four blade segments. And watch yourself up there: the hill breeds galespun sprites, little knots of angry wind. Fitting, I suppose. The same gust that turns a blade will happily throw you off a ladder.",
    completionText:
      "Four segments, edges true, sockets clean. Balance is everything with a rotor, $N — one warped blade and the whole assembly shakes itself to splinters. These will run smooth.",
    objectives: [
      { type: 'collect', itemId: 'blade_segment', count: 4, label: 'Mill Blade Segment' },
    ],
    xpReward: 550,
    copperReward: 200,
    itemRewards: {},
    requiresQuest: 'q_ev_windings',
  },
  q_ev_grounding: {
    id: 'q_ev_grounding',
    name: 'Ground the Current',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "Now the hard lesson, $N: power you cannot ground is power that hunts you. My first mirror test ran current through lines nobody earthed, and the stray charge woke into sparkwisps — live current with a temper, drifting around the array. Put down eight of them before anyone touches another cable. Safety is not the step after the work. It IS the work.",
    completionText:
      "Quiet lines at last. Say it back to me so I know it stuck: ground first, then touch. The wisps were my mistake, and a builder owns her mistakes — that's how the next site doesn't repeat them.",
    objectives: [
      { type: 'kill', targetMobId: 'sparkwisp', count: 8, label: 'Sparkwisp grounded' },
    ],
    xpReward: 620,
    copperReward: 240,
    itemRewards: {
      warrior: 'stormtapper_gauntlets',
      mage: 'stormtapper_mitts',
      rogue: 'stormtapper_grips',
    },
    requiresQuest: 'q_ev_blades',
  },
  q_ev_mirrors: {
    id: 'q_ev_mirrors',
    name: 'Chasing the Sun',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "The array is safe to touch again, so let's make it earn its keep. Four sun-mirrors stand east of camp, and every one of them has drifted off true — a mirror that misses the sun by a hand's width wastes half the light it catches. Walk the row and set each one to its mark. Angle is everything: the sun pays generously, but only if you face it properly.",
    completionText:
      "Look at that focus point glow — all four throwing their light to the same spot. That's commissioning, $N: not when it's built, but when it's TUNED. Tomorrow the array boils water by mid-morning.",
    objectives: [
      { type: 'interact', targetObjectItemId: 'sun_mirror', count: 4, label: 'Sun-Mirror aligned' },
    ],
    xpReward: 680,
    copperReward: 280,
    itemRewards: {},
    requiresQuest: 'q_ev_grounding',
  },
  q_ev_overcharge: {
    id: 'q_ev_overcharge',
    name: 'The Overcharge',
    giverNpcId: 'master_windwright_elara',
    turnInNpcId: 'master_windwright_elara',
    text: "Three sources feeding one site, $N, and I balanced the load for two. The surplus had to go somewhere — and it went into the steamvent, where it's been gathering itself into a thing of fused slag and arc-light. The Overcharge, the diggers call it, and they won't go near the rise. It has to be put down before it walks into my camp, and when it falls, bring me its core: I want to read exactly how the load ran away from me. Take a friend. Faults under full load are not soloed politely.",
    completionText:
      "There it is, written in the slag: the surge path, plain as a ledger. I'll split the feed three ways and it won't happen twice. You've seen the whole of it now, $N — survey, supply, assembly, safety, tuning, and the fault at the end that teaches you more than all the rest together. You'd make a fair windwright.",
    objectives: [
      { type: 'kill', targetMobId: 'the_overcharge', count: 1, label: 'The Overcharge dispersed' },
      { type: 'collect', itemId: 'fused_slag_core', count: 1, label: 'Fused Slag Core' },
    ],
    xpReward: 1300,
    copperReward: 3000,
    itemRewards: {
      warrior: 'skymill_spanner',
      mage: 'sunmirror_scepter',
      rogue: 'coilwound_shiv',
    },
    requiresQuest: 'q_ev_mirrors',
    minLevel: 6,
    suggestedPlayers: 2,
  },
};

export const ENERGY_VALE_QUEST_ORDER = [
  'q_ev_survey',
  'q_ev_windings',
  'q_ev_blades',
  'q_ev_grounding',
  'q_ev_mirrors',
  'q_ev_overcharge',
];

// ---------------------------------------------------------------------------
// World layout — the eastern rim: camp at (145,58), mill hill NW, mirror
// array E, kobold slope S, the steamvent rise NE
// ---------------------------------------------------------------------------

export const ENERGY_VALE_CAMPS: CampDef[] = [
  { mobId: 'coil_scavenger', center: { x: 130, z: 40 }, radius: 14, count: 6 },
  { mobId: 'coil_scavenger', center: { x: 152, z: 34 }, radius: 12, count: 5 },
  { mobId: 'galespun_sprite', center: { x: 128, z: 76 }, radius: 12, count: 5 },
  { mobId: 'sparkwisp', center: { x: 160, z: 62 }, radius: 13, count: 7 },
  { mobId: 'the_overcharge', center: { x: 164, z: 92 }, radius: 3, count: 1 },
];

export const ENERGY_VALE_OBJECTS: GroundObjectDef[] = [
  {
    itemId: 'survey_post_wind',
    name: 'Wind Survey Post',
    positions: [{ x: 126, z: 80 }],
  },
  {
    itemId: 'survey_post_sun',
    name: 'Sun Survey Post',
    positions: [{ x: 158, z: 60 }],
  },
  {
    itemId: 'survey_post_steam',
    name: 'Steam Survey Post',
    positions: [{ x: 162, z: 86 }],
  },
  {
    itemId: 'blade_segment',
    name: 'Mill Blade Crate',
    positions: [
      { x: 124, z: 70 },
      { x: 130, z: 82 },
      { x: 134, z: 74 },
      { x: 122, z: 78 },
      { x: 136, z: 84 },
      { x: 128, z: 68 },
    ],
  },
  {
    itemId: 'sun_mirror',
    name: 'Sun-Mirror',
    positions: [
      { x: 154, z: 56 },
      { x: 158, z: 64 },
      { x: 162, z: 58 },
      { x: 156, z: 68 },
    ],
  },
];

// Static props: Elara's workshop and camp, crates of parts, a fence line
// around the mirror array, and the capped test-bore on the steamvent rise.
export const ENERGY_VALE_PROPS: ZonePropsDef = {
  buildings: [{ kind: 'house', x: 143, z: 54, w: 6, d: 5, rot: 0.4 }],
  wells: [],
  stalls: [],
  mines: [{ x: 165, z: 88, rot: -2.2 }],
  docks: [],
  tents: [{ x: 148, z: 60, rot: -0.8, scale: 1.0 }],
  crates: [
    [146, 55],
    [147, 57],
    [144, 59],
    [179, 102],
    [183, 98],
  ],
  campfires: [
    [146, 61],
    [180, 99],
  ],
  mudHuts: [],
  ruinRings: [{ x: 182, z: 100, ringR: 4.6, columns: 5 }],
  fences: [
    { x1: 152, z1: 53, x2: 165, z2: 53 },
    { x1: 165, z1: 53, x2: 165, z2: 71 },
    { x1: 152, z1: 71, x2: 165, z2: 71 },
  ],
  graveyards: [],
  scenicProps: [{ kind: 'leggedSkyTank', x: 185, z: 99, rot: -0.65, scale: 3.1 }],
};

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

export const ENERGY_VALE_ITEMS: Record<string, ItemDef> = {
  // --- quest items ---
  copper_winding: {
    id: 'copper_winding',
    name: 'Copper Winding',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_windings',
  },
  blade_segment: {
    id: 'blade_segment',
    name: 'Mill Blade Segment',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_blades',
  },
  survey_post_wind: {
    id: 'survey_post_wind',
    name: 'Wind Survey Post',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_survey',
  },
  survey_post_sun: {
    id: 'survey_post_sun',
    name: 'Sun Survey Post',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_survey',
  },
  survey_post_steam: {
    id: 'survey_post_steam',
    name: 'Steam Survey Post',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_survey',
  },
  sun_mirror: {
    id: 'sun_mirror',
    name: 'Sun-Mirror',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_mirrors',
  },
  fused_slag_core: {
    id: 'fused_slag_core',
    name: 'Fused Slag Core',
    kind: 'quest',
    sellValue: 0,
    questId: 'q_ev_overcharge',
  },

  // --- quest greens (uncommon, gloves) ---
  stormtapper_gauntlets: {
    id: 'stormtapper_gauntlets',
    name: 'Stormtapper Gauntlets',
    kind: 'armor',
    armorType: 'mail',
    slot: 'gloves',
    quality: 'uncommon',
    stats: { armor: 40, str: 2, sta: 1 },
    sellValue: 200,
    requiredClass: WAR,
  },
  stormtapper_mitts: {
    id: 'stormtapper_mitts',
    name: 'Stormtapper Mitts',
    kind: 'armor',
    armorType: 'cloth',
    slot: 'gloves',
    quality: 'uncommon',
    stats: { armor: 15, int: 2, spi: 1 },
    sellValue: 200,
    requiredClass: MAG,
  },
  stormtapper_grips: {
    id: 'stormtapper_grips',
    name: 'Stormtapper Grips',
    kind: 'armor',
    armorType: 'leather',
    slot: 'gloves',
    quality: 'uncommon',
    stats: { armor: 25, agi: 2, sta: 1 },
    sellValue: 200,
    requiredClass: ROG,
  },

  // --- finale blues (rare, weapons) ---
  skymill_spanner: {
    id: 'skymill_spanner',
    name: 'Skymill Spanner',
    kind: 'weapon',
    slot: 'mainhand',
    quality: 'rare',
    weapon: { min: 8, max: 14, speed: 2.5 },
    stats: { str: 3, sta: 2 },
    sellValue: 700,
    requiredClass: WAR,
  },
  sunmirror_scepter: {
    id: 'sunmirror_scepter',
    name: 'Sunmirror Scepter',
    kind: 'weapon',
    slot: 'mainhand',
    quality: 'rare',
    weapon: { min: 9, max: 15, speed: 2.9 },
    stats: { int: 4, spi: 1 },
    sellValue: 700,
    requiredClass: MAG,
  },
  coilwound_shiv: {
    id: 'coilwound_shiv',
    name: 'Coilwound Shiv',
    kind: 'weapon',
    slot: 'mainhand',
    quality: 'rare',
    weapon: { min: 5, max: 9, speed: 1.7, dagger: true },
    stats: { agi: 4, sta: 1 },
    sellValue: 700,
    requiredClass: ROG,
  },

  // --- boss drop (rare, neck-less game: waist trinket-style armor) ---
  stormtappers_charm: {
    id: 'stormtappers_charm',
    name: "Stormtapper's Charm",
    kind: 'armor',
    armorType: 'cloth',
    slot: 'waist',
    quality: 'rare',
    stats: { armor: 18, sta: 2, spi: 2 },
    sellValue: 600,
  },

  // --- junk (gray) ---
  stripped_gearwheel: {
    id: 'stripped_gearwheel',
    name: 'Stripped Gearwheel',
    kind: 'junk',
    quality: 'poor',
    sellValue: 14,
  },
  charged_mote: {
    id: 'charged_mote',
    name: 'Charged Mote',
    kind: 'junk',
    quality: 'poor',
    sellValue: 18,
  },
  whirl_of_chaff: {
    id: 'whirl_of_chaff',
    name: 'Whirl of Chaff',
    kind: 'junk',
    quality: 'poor',
    sellValue: 12,
  },
};
