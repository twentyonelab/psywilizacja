import { create } from "zustand";
import { createMap, GameMap } from "../game/mapgen";
import { hexDistance, key, neighbors } from "../game/hex";
import { START_BRANCH, TOYS, TROPY_COST, WATAHA_ORDER, WATAHY, WOLF_INFO } from "../game/content";
import { BranchId, StatId, TerrainType, WatahaId, Wolf } from "../game/types";

export const BASE_AP = 3;
export const DOMINATION_TARGET = 10; // liczba zajętych (wywęszonych) heksów do zwycięstwa
const DIE = [0, 0, 1, 1, 2, 2];
const rollDie = () => DIE[Math.floor(Math.random() * DIE.length)];
const REVEAL_TERRAINS: TerrainType[] = ["pola", "bor", "ruiny", "gory"];

export interface Resources {
  jedzenie: number;
  schronienie: number;
  narzedzia: number;
  tropy: number;
}
export interface PlayerState {
  resources: Resources;
  stats: Record<StatId, number>;
  senses: Record<BranchId, number>;
  claimed: number; // zajęte (wywęszone) heksy — miara dominacji
}
export interface Roll {
  id: number;
  value: number;
  reason: string;
  tone?: "good" | "bad" | "info";
  text?: string;
}
export type Controller = "human" | "ai";

export const PATH_NAME: Record<BranchId, string> = {
  wech: "Tropiciel",
  sluch: "Koordynator",
  wiez: "Lider Sojuszu",
  instynkt: "Ocalały",
  wzrok: "Władca Ziem",
};

interface Store {
  map: GameMap;
  players: Record<WatahaId, PlayerState>;
  controller: Record<WatahaId, Controller>;
  order: WatahaId[];
  current: number;
  ap: number;
  selected: string | null;
  lastRoll: Roll | null;
  log: string[];
  turnNo: number;
  winner: WatahaId | null;
  winPath: string | null;

  clickHex: (k: string) => void;
  attackWolf: (wolfId: string) => void;
  trainStat: (toyId: string) => void;
  unlockSense: (branch: BranchId) => void;
  aiStep: () => void;
  endTurn: () => void;
  reset: () => void;
}

function apMax(p: PlayerState): number {
  return BASE_AP + (p.senses.wzrok >= 1 ? 1 : 0);
}
function freshPlayers(): Record<WatahaId, PlayerState> {
  const p = {} as Record<WatahaId, PlayerState>;
  for (const id of WATAHA_ORDER) {
    const senses: Record<BranchId, number> = { wech: 0, sluch: 0, wiez: 0, instynkt: 0, wzrok: 0 };
    senses[START_BRANCH[id]] = 1;
    p[id] = {
      resources: { jedzenie: 2, schronienie: 1, narzedzia: 0, tropy: 0 },
      stats: { sila: 1, zrecznosc: 1, spryt: 1, wech: 1, szybkosc: 1 },
      senses,
      claimed: 0,
    };
  }
  return p;
}
const freshControllers = (): Record<WatahaId, Controller> => ({
  boru: "human",
  pol: "ai",
  ruin: "ai",
  polnocy: "ai",
});

let rollSeq = 1;
let wolfSeq = 100;
const trim = (arr: string[]) => arr.slice(0, 50);

export const useGame = create<Store>((set, get) => ({
  map: createMap(),
  players: freshPlayers(),
  controller: freshControllers(),
  order: [...WATAHA_ORDER],
  current: 0,
  ap: BASE_AP,
  selected: null,
  lastRoll: null,
  log: ["Świat budzi się po Ciszy. Na obrzeżach czają się wilki. Tura Watahy Boru."],
  turnNo: 1,
  winner: null,
  winPath: null,

  clickHex: (k) => {
    const s = get();
    if (s.winner) return;
    const curId = s.order[s.current];
    const unit = s.map.units.find((u) => u.watahaId === curId);
    if (!unit) return;
    const tile = s.map.tiles[k];
    if (!tile) return;
    const isNeighbor = neighbors(unit).some((n) => key(n) === k);
    set({ selected: k });
    if (!isNeighbor) return;

    // wróg na sąsiednim polu → walka
    const wolf = s.map.wolves.find((w) => key(w) === k);
    if (wolf) return get().attackWolf(wolf.id);

    if (tile.revealed) {
      if (s.ap <= 0) return set({ log: trim(["Brak punktów akcji — zakończ turę.", ...s.log]) });
      const units = s.map.units.map((u) => (u.watahaId === curId ? { ...u, q: tile.q, r: tile.r } : u));
      return set({
        map: { ...s.map, units },
        ap: s.ap - 1,
        log: trim([`${WATAHY[curId].name}: ruch na ${labelTerrain(tile.terrain)} (${tile.q},${tile.r}).`, ...s.log]),
      });
    }

    if (s.ap <= 0) return set({ log: trim(["Brak punktów akcji — zakończ turę.", ...s.log]) });
    const value = rollDie();
    const terrain = REVEAL_TERRAINS[Math.floor(Math.random() * REVEAL_TERRAINS.length)];
    const tropyGain = value + tile.danger;
    const foodGain = value >= 1 ? 1 : 0;
    const tiles = { ...s.map.tiles, [k]: { ...tile, revealed: true, terrain } };
    const players = { ...s.players };
    const cur = players[curId];
    const claimed = cur.claimed + 1; // wywęszony heks = zajęty teren
    players[curId] = {
      ...cur,
      claimed,
      resources: { ...cur.resources, tropy: cur.resources.tropy + tropyGain, jedzenie: cur.resources.jedzenie + foodGain },
    };
    const won = claimed >= DOMINATION_TARGET;
    set({
      map: { ...s.map, tiles },
      players,
      ap: s.ap - 1,
      winner: won ? curId : null,
      winPath: won ? `${claimed} zajętych heksów` : null,
      lastRoll: { id: rollSeq++, value, reason: "węsz", tone: "info", text: `${labelTerrain(terrain)} · +${tropyGain} Tropów` },
      log: trim([
        won
          ? `🏆 ${WATAHY[curId].name} zajmuje ${claimed} heksów — DOMINACJA! Zwycięstwo!`
          : `${WATAHY[curId].name}: węszy → ${labelTerrain(terrain)}. Kostka ${value} → +${tropyGain} Tropów${foodGain ? ", +1 jedzenie" : ""}. (teren ${claimed}/${DOMINATION_TARGET})`,
        ...s.log,
      ]),
    });
  },

  attackWolf: (wolfId) => {
    const s = get();
    if (s.winner) return;
    const curId = s.order[s.current];
    const unit = s.map.units.find((u) => u.watahaId === curId)!;
    const wolf = s.map.wolves.find((w) => w.id === wolfId);
    if (!wolf) return;
    if (!neighbors(unit).some((n) => key(n) === key(wolf))) return;
    const p = s.players[curId];
    const info = WOLF_INFO[wolf.type];

    // szaro-stalowe: nie walczą — sojusz tylko z Paktem (Więź III)
    if (!info.hostile) {
      if (p.senses.wiez >= 3) {
        if (s.ap <= 0) return;
        const players = { ...s.players };
        players[curId] = { ...p, resources: { ...p.resources, tropy: p.resources.tropy + info.reward + 2 } };
        return set({
          players,
          ap: s.ap - 1,
          map: { ...s.map, wolves: s.map.wolves.filter((w) => w.id !== wolfId) },
          log: trim([`${WATAHY[curId].name}: PAKT z szaro-stalowym wilkiem! Sojusznik dołącza (+${info.reward + 2} Tropów).`, ...s.log]),
        });
      }
      return set({ log: trim([`Szaro-stalowy wilk nie jest wrogi — potrzebujesz Paktu (Więź III), by zawrzeć sojusz.`, ...s.log]) });
    }

    if (s.ap <= 0) return set({ log: trim(["Brak punktów akcji — zakończ turę.", ...s.log]) });
    const value = rollDie();
    const attack = value + p.stats.sila;
    const win = attack >= info.power;
    const players = { ...s.players };
    let map = s.map;
    let msg: string;
    if (win) {
      map = { ...s.map, wolves: s.map.wolves.filter((w) => w.id !== wolfId) };
      players[curId] = { ...p, resources: { ...p.resources, tropy: p.resources.tropy + info.reward } };
      msg = `${WATAHY[curId].name}: walka z ${info.label} — kostka ${value} + Siła ${p.stats.sila} = ${attack} ≥ ${info.power}. Zwycięstwo! +${info.reward} Tropów.`;
    } else {
      const res = { ...p.resources };
      if (res.jedzenie > 0) res.jedzenie -= 1;
      else if (res.schronienie > 0) res.schronienie -= 1;
      players[curId] = { ...p, resources: res };
      msg = `${WATAHY[curId].name}: walka z ${info.label} — kostka ${value} + Siła ${p.stats.sila} = ${attack} < ${info.power}. Porażka, tracisz zasób.`;
    }
    set({
      map, players, ap: s.ap - 1,
      lastRoll: { id: rollSeq++, value, reason: "walka", tone: win ? "good" : "bad", text: win ? `Zwycięstwo nad ${info.label}!` : `Porażka z ${info.label}` },
      log: trim([msg, ...s.log]),
    });
  },

  trainStat: (toyId) => {
    const s = get();
    if (s.winner) return;
    const curId = s.order[s.current];
    if (s.ap <= 0) return;
    const toy = TOYS.find((t) => t.id === toyId);
    if (!toy) return;
    const value = rollDie();
    const players = { ...s.players };
    const st = { ...players[curId].stats };
    st[toy.stat] += value;
    players[curId] = { ...players[curId], stats: st };
    set({
      players,
      ap: s.ap - 1,
      lastRoll: { id: rollSeq++, value, reason: toy.label, tone: value > 0 ? "good" : "info", text: value > 0 ? `${statLabel(toy.stat)} +${value}` : "bez zmian" },
      log: trim([`${WATAHY[curId].name}: trening (${toy.label}). Kostka ${value} → ${statLabel(toy.stat)} ${value > 0 ? "+" + value : "bez zmian"}.`, ...s.log]),
    });
  },

  unlockSense: (branch) => {
    const s = get();
    if (s.winner) return;
    const curId = s.order[s.current];
    const p = s.players[curId];
    const lvl = p.senses[branch];
    if (lvl >= 4) return;
    const target = lvl + 1;
    const cost = TROPY_COST[target];
    if (p.resources.tropy < cost) return set({ log: trim([`Za mało Tropów (potrzeba ${cost}).`, ...s.log]) });
    if (s.ap <= 0) return;
    const players = { ...s.players };
    const senses = { ...p.senses, [branch]: target };
    players[curId] = { ...p, senses, resources: { ...p.resources, tropy: p.resources.tropy - cost } };
    const bonusNow = branch === "wzrok" && target === 1 ? 1 : 0;
    set({
      players,
      ap: s.ap - 1 + bonusNow,
      log: trim([`${WATAHY[curId].name}: odblokowano zmysł (${branchLabel(branch)} ${roman(target)}) za ${cost} Tropów.`, ...s.log]),
    });
  },

  aiStep: () => {
    const s = get();
    if (s.winner) return;
    const curId = s.order[s.current];
    if (s.controller[curId] !== "ai" || s.ap <= 0) return;
    const unit = s.map.units.find((u) => u.watahaId === curId)!;
    const p = s.players[curId];
    const nb = neighbors(unit).map(key);

    // 1) wróg obok i realna szansa wygranej → atak
    const wolf = s.map.wolves.find((w) => nb.includes(key(w)) && WOLF_INFO[w.type].hostile);
    if (wolf && p.stats.sila >= WOLF_INFO[wolf.type].power - 1) return get().attackWolf(wolf.id);

    // 2) sąsiednie nieodkryte (bez wilka na polu) → węsz
    const sniff = nb.find(
      (k) => s.map.tiles[k] && !s.map.tiles[k].revealed && !s.map.wolves.some((w) => key(w) === k)
    );
    if (sniff) return get().clickHex(sniff);

    // 3) czasem odblokuj własny zmysł jeśli stać
    const branch = START_BRANCH[curId];
    const nextCost = TROPY_COST[(p.senses[branch] ?? 0) + 1];
    if (p.senses[branch] < 4 && p.resources.tropy >= nextCost && Math.random() < 0.5) {
      return get().unlockSense(branch);
    }

    // 4) ruch ku najbliższemu nieodkrytemu polu
    const unknowns = Object.values(s.map.tiles).filter((t) => !t.revealed);
    const moveNeighbors = nb.filter((k) => s.map.tiles[k]?.revealed && !s.map.wolves.some((w) => key(w) === k));
    if (unknowns.length && moveNeighbors.length) {
      let best = moveNeighbors[0];
      let bestD = Infinity;
      for (const k of moveNeighbors) {
        const t = s.map.tiles[k];
        const d = Math.min(...unknowns.map((u) => hexDistance(t, u)));
        if (d < bestD) { bestD = d; best = k; }
      }
      return get().clickHex(best);
    }

    // 5) fallback — trening (zawsze zużywa akcję)
    return get().trainStat(TOYS[Math.floor(Math.random() * TOYS.length)].id);
  },

  endTurn: () => {
    const s = get();
    if (s.winner) return;
    const nextIdx = (s.current + 1) % s.order.length;
    const nextId = s.order[nextIdx];
    const newRound = nextIdx === 0;
    const turnNo = newRound ? s.turnNo + 1 : s.turnNo;

    let map = s.map;
    let players = s.players;
    let extraLog: string[] = [];
    if (newRound) {
      const res = wolfPhase(s);
      map = res.map;
      players = res.players;
      extraLog = res.logs;
    }

    set({
      map,
      players,
      current: nextIdx,
      ap: apMax(players[nextId]),
      selected: null,
      turnNo,
      log: trim([`— Tura ${WATAHY[nextId].name} (runda ${turnNo}).`, ...extraLog, ...s.log]),
    });
  },

  reset: () => {
    rollSeq = 1;
    wolfSeq = 100;
    const players = freshPlayers();
    set({
      map: createMap(),
      players,
      controller: freshControllers(),
      order: [...WATAHA_ORDER],
      current: 0,
      ap: apMax(players[WATAHA_ORDER[0]]),
      selected: null,
      lastRoll: null,
      turnNo: 1,
      winner: null,
      winPath: null,
      log: ["Nowa gra. Na obrzeżach czają się wilki. Tura Watahy Boru."],
    });
  },
}));

// ---- FAZA WILKÓW ----
function wolfPhase(s: Store): { map: GameMap; players: Record<WatahaId, PlayerState>; logs: string[] } {
  const logs: string[] = [];
  const players = { ...s.players };
  let wolves = s.map.wolves.map((w) => ({ ...w }));
  const units = s.map.units;
  const removed = new Set<string>();

  for (const wolf of wolves) {
    const info = WOLF_INFO[wolf.type];
    if (!info.hostile) continue; // szaro-stalowe czekają
    // najbliższa wataha
    let target = units[0];
    let bd = Infinity;
    for (const u of units) {
      const d = hexDistance(wolf, u);
      if (d < bd) { bd = d; target = u; }
    }
    if (bd <= 1) {
      // atak na watahę
      const pid = target.watahaId;
      const p = players[pid];
      const value = rollDie();
      const defense = value + p.stats.sila;
      if (defense >= info.power) {
        removed.add(wolf.id);
        logs.push(`Faza wilków: ${WATAHY[pid].name} odpiera ${info.label} (obrona ${defense} ≥ ${info.power}).`);
      } else {
        const res = { ...p.resources };
        if (res.jedzenie > 0) res.jedzenie -= 1;
        else if (res.schronienie > 0) res.schronienie -= 1;
        players[pid] = { ...p, resources: res };
        logs.push(`Faza wilków: ${info.label} atakuje ${WATAHY[pid].name} (obrona ${defense} < ${info.power}) — utrata zasobu.`);
      }
    } else {
      // ruch o 1 ku najbliższej watasze
      let best = { q: wolf.q, r: wolf.r };
      let bestD = bd;
      for (const n of neighbors(wolf)) {
        if (!s.map.tiles[key(n)]) continue; // trzymaj się planszy
        const d = hexDistance(n, target);
        if (d < bestD) { bestD = d; best = n; }
      }
      wolf.q = best.q;
      wolf.r = best.r;
    }
  }
  wolves = wolves.filter((w) => !removed.has(w.id));
  if (logs.length) logs.unshift("— Faza wilków");
  return { map: { ...s.map, wolves }, players, logs };
}

function labelTerrain(t: TerrainType): string {
  const m: Record<TerrainType, string> = { commons: "Commons", pola: "Pola", bor: "Bór", ruiny: "Ruiny", gory: "Góry", unknown: "nieznane" };
  return m[t];
}
function statLabel(s: StatId): string {
  const m: Record<StatId, string> = { sila: "Siła", zrecznosc: "Zręczność", spryt: "Spryt", wech: "Węch", szybkosc: "Szybkość" };
  return m[s];
}
function branchLabel(b: BranchId): string {
  const m: Record<BranchId, string> = { wech: "Węch", sluch: "Słuch", wiez: "Więź", instynkt: "Instynkt", wzrok: "Wzrok" };
  return m[b];
}
function roman(n: number): string {
  return ["", "I", "II", "III", "IV"][n] ?? String(n);
}

export { apMax };

// hook debugowy do podglądu/testów w konsoli przeglądarki
if (typeof window !== "undefined") (window as any).useGame = useGame;
