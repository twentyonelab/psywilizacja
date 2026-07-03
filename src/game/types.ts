export type TerrainType =
  | "commons"
  | "pola"
  | "bor"
  | "ruiny"
  | "gory"
  | "unknown";

export type WatahaId = "boru" | "pol" | "ruin" | "polnocy";

export type StatId = "sila" | "zrecznosc" | "spryt" | "wech" | "szybkosc";

export type BranchId = "wech" | "sluch" | "wiez" | "instynkt" | "wzrok";

export interface HexTile {
  q: number;
  r: number;
  terrain: TerrainType;
  revealed: boolean;
  danger: number; // 0..3 — rośnie z odległością od środka (gradient świata)
}

export interface Wataha {
  id: WatahaId;
  name: string;
  origin: string;
  sense: string;
  colorVar: string; // CSS var name
  colorHex: string; // ta sama barwa jako hex, do użytku w SVG (fill nie wspiera var() w niektórych kontekstach animacji)
  biome: TerrainType; // biom ojczysty
  emblem: string; // fallback tekstowy (nieużywany w renderze planszy — patrz Emblem.tsx)
}

export interface Unit {
  watahaId: WatahaId;
  q: number;
  r: number;
}

export type WolfType = "czarny" | "bialy" | "szary";

export interface Wolf {
  id: string;
  type: WolfType;
  q: number;
  r: number;
}
