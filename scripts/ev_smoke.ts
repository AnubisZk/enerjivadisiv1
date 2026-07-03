// Windwright Vale end-to-end smoke: boots the offline sim, levels a warrior,
// walks the six-quest chain by driving the same command surface the client
// uses (acceptQuest / interact / pickUpObject / kill via dealDamage /
// turnInQuest), and asserts every step credits and turns in.
import { QUESTS } from '../src/sim/data';
import { Sim } from '../src/sim/sim';
import { dist2d } from '../src/sim/types';

const sim = new Sim({ seed: 12345, playerClass: 'warrior', autoEquip: true });
const p = sim.player;
sim.setPlayerLevel(7);

function tp(x: number, z: number) {
  const pos = (sim as any).ctx?.groundPos?.(x, z) ?? { x, y: 0, z };
  p.pos.x = pos.x;
  p.pos.y = pos.y;
  p.pos.z = pos.z;
}
function tick(n = 1) {
  for (let i = 0; i < n; i++) sim.tick();
}
function meta() {
  return (sim as any).meta(sim.playerId);
}
function questState(qid: string) {
  return meta()?.questLog?.get(qid)?.state ?? 'none';
}
function findEntity(pred: (e: any) => boolean) {
  for (const e of sim.entities.values()) if (pred(e)) return e;
  return null;
}
function killAll(templateId: string, needed: number) {
  let killed = 0;
  let guard = 0;
  while (killed < needed && guard++ < 500) {
    const mob = findEntity((e) => e.kind === 'mob' && e.templateId === templateId && !e.dead);
    if (!mob) {
      tick(20);
      continue;
    }
    tp(mob.pos.x + 1, mob.pos.z + 1);
    (sim as any).dealDamage
      ? (sim as any).dealDamage(p, mob, 100000, 'physical')
      : (sim as any).ctx.dealDamage(p, mob, 100000, 'physical');
    tick(2);
    if (mob.dead) {
      killed++;
      // loot the corpse for quest drops
      sim.lootCorpse ? sim.lootCorpse(mob.id) : (sim as any).lootCorpse(mob.id);
      tick(1);
    }
  }
  return killed;
}
function pickupObjects(itemId: string, needed: number) {
  let got = 0;
  let guard = 0;
  const used = new Set<number>();
  while (got < needed && guard++ < 200) {
    const obj = findEntity(
      (e) => e.kind === 'object' && e.objectItemId === itemId && !used.has(e.id) && !e.dead,
    );
    if (!obj) {
      tick(20);
      continue;
    }
    tp(obj.pos.x + 0.5, obj.pos.z + 0.5);
    sim.pickUpObject(obj.id);
    used.add(obj.id);
    tick(1);
    got++;
  }
  return got;
}
function interactObjects(itemId: string, times: number) {
  let done = 0;
  let guard = 0;
  const used = new Set<number>();
  while (done < times && guard++ < 200) {
    const obj = findEntity(
      (e) => e.kind === 'object' && e.objectItemId === itemId && !used.has(e.id),
    );
    if (!obj) {
      tick(10);
      continue;
    }
    tp(obj.pos.x + 0.5, obj.pos.z + 0.5);
    sim.pickUpObject(obj.id); // ground interactables route through pickUpObject -> interact credit
    used.add(obj.id);
    tick(1);
    done++;
  }
  return done;
}

const ELARA = { x: 145, z: 58 };
function atElara() {
  tp(ELARA.x + 1, ELARA.z + 1);
  tick(1);
}
function accept(qid: string) {
  atElara();
  sim.acceptQuest(qid);
  tick(1);
  console.log(`accept ${qid}: ${questState(qid)}`);
}
function turnIn(qid: string) {
  atElara();
  sim.turnInQuest(qid);
  tick(1);
  console.log(`turnIn ${qid}: ${questState(qid)} (lvl=${p.level})`);
}

console.log('=== Windwright Vale smoke ===');
console.log(
  'quests registered:',
  Object.keys(QUESTS).filter((q) => q.startsWith('q_ev_')),
);
const elara = findEntity((e) => e.kind === 'npc' && e.templateId === 'master_windwright_elara');
console.log('Elara spawned:', !!elara, elara ? `at (${elara.pos.x}, ${elara.pos.z})` : '');

// Q1: survey (interact x3)
accept('q_ev_survey');
interactObjects('survey_post_wind', 1);
interactObjects('survey_post_sun', 1);
interactObjects('survey_post_steam', 1);
console.log('q_ev_survey state:', questState('q_ev_survey'));
turnIn('q_ev_survey');

// Q2: kill 8 scavengers + collect 5 windings (loot drops)
accept('q_ev_windings');
let guard = 0;
while (questState('q_ev_windings') !== 'ready' && guard++ < 60) {
  killAll('coil_scavenger', 2);
}
console.log('q_ev_windings state:', questState('q_ev_windings'));
turnIn('q_ev_windings');

// Q3: collect 4 blade segments from crates
accept('q_ev_blades');
pickupObjects('blade_segment', 4);
console.log('q_ev_blades state:', questState('q_ev_blades'));
turnIn('q_ev_blades');

// Q4: kill 8 sparkwisps
accept('q_ev_grounding');
killAll('sparkwisp', 8);
console.log('q_ev_grounding state:', questState('q_ev_grounding'));
turnIn('q_ev_grounding');

// Q5: align 4 mirrors
accept('q_ev_mirrors');
interactObjects('sun_mirror', 4);
console.log('q_ev_mirrors state:', questState('q_ev_mirrors'));
turnIn('q_ev_mirrors');

// Q6: boss + core
accept('q_ev_overcharge');
guard = 0;
while (questState('q_ev_overcharge') !== 'ready' && guard++ < 30) {
  killAll('the_overcharge', 1);
  tick(50);
}
console.log('q_ev_overcharge state:', questState('q_ev_overcharge'));
turnIn('q_ev_overcharge');

const allDone = [
  'q_ev_survey',
  'q_ev_windings',
  'q_ev_blades',
  'q_ev_grounding',
  'q_ev_mirrors',
  'q_ev_overcharge',
].every((q) => meta()?.questsDone?.has(q));
console.log(allDone ? 'SMOKE PASS: full chain complete' : 'SMOKE FAIL');
process.exit(allDone ? 0 : 1);
