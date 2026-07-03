import { WATAHA_ORDER, WATAHY } from "./content";
import { Axial, axialToPixel, hexDistance, hexRange, key, ring } from "./hex";
import { HexTile, Unit, Wolf } from "./types";

export const MAP_RADIUS = 4;
const CENTER: Axial = { q: 0, r: 0 };

export interface GameMap {
  tiles: Record<string, HexTile>;
  units: Unit[];
  wolves: Wolf[];
}

function dangerFor(a: Axial): number {
  const d = hexDistance(CENTER, a);
  if (d <= 1) return 0;
  if (d === 2) return 1;
  if (d === 3) return 2;
  return 3;
}

// wybór 4 symetrycznych pól startowych na pierścieniu 3
function startHexes(): Axial[] {
  const candidates = ring(3);
  const targets = [-90, 0, 90, 180]; // góra, prawo, dół, lewo (kąt ekranowy)
  const used = new Set<string>();
  const picks: Axial[] = [];
  for (const t of targets) {
    const trad = (t * Math.PI) / 180;
    let best: Axial | null = null;
    let bestScore = Infinity;
    for (const c of candidates) {
      if (used.has(key(c))) continue;
      const { x, y } = axialToPixel(c);
      let ang = Math.atan2(y, x);
      let diff = Math.abs(ang - trad);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < bestScore) {
        bestScore = diff;
        best = c;
      }
    }
    if (best) {
      used.add(key(best));
      picks.push(best);
    }
  }
  return picks;
}

export function createMap(): GameMap {
  const tiles: Record<string, HexTile> = {};
  for (const a of hexRange(MAP_RADIUS)) {
    const d = hexDistance(CENTER, a);
    const isCommons = d <= 1;
    tiles[key(a)] = {
      q: a.q,
      r: a.r,
      terrain: isCommons ? "commons" : "unknown",
      revealed: isCommons,
      danger: dangerFor(a),
    };
  }

  const units: Unit[] = [];
  const starts = startHexes();
  starts.forEach((hex, i) => {
    const w = WATAHY[WATAHA_ORDER[i]];
    const t = tiles[key(hex)];
    if (t) {
      t.terrain = w.biome;
      t.revealed = true;
    }
    units.push({ watahaId: w.id, q: hex.q, r: hex.r });
  });

  const wolves = spawnInitialWolves(starts);

  return { tiles, units, wolves };
}

// Wilki startują na najgroźniejszym pierścieniu (dystans 4), z dala od watah.
function spawnInitialWolves(starts: Axial[]): Wolf[] {
  const outer = ring(4);
  const occupied = new Set(starts.map(key));
  const far = outer
    .filter((h) => !occupied.has(key(h)))
    .sort((a, b) => {
      const da = Math.min(...starts.map((s) => hexDistance(s, a)));
      const db = Math.min(...starts.map((s) => hexDistance(s, b)));
      return db - da; // najdalej od watah najpierw
    });
  const picks = spread(far, 4);
  const types: Wolf["type"][] = ["czarny", "czarny", "bialy", "szary"];
  return picks.map((h, i) => ({ id: `w${i}`, type: types[i] ?? "czarny", q: h.q, r: h.r }));
}

// wybierz n pól rozrzuconych po pierścieniu (co ~1/4 obwodu)
function spread(list: Axial[], n: number): Axial[] {
  if (list.length <= n) return list;
  const step = Math.floor(list.length / n);
  const out: Axial[] = [];
  for (let i = 0; i < n; i++) out.push(list[(i * step) % list.length]);
  return out;
}
