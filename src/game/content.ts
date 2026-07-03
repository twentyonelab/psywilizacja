import { BranchId, StatId, TerrainType, Wataha, WatahaId, WolfType } from "./types";

export const WATAHY: Record<WatahaId, Wataha> = {
  boru: {
    id: "boru",
    name: "Wataha Boru",
    origin: "psy myśliwskie, gończe",
    sense: "Węch",
    colorVar: "--w-boru",
    colorHex: "#4f7a44",
    biome: "bor",
    emblem: "🐾",
  },
  pol: {
    id: "pol",
    name: "Wataha Pól",
    origin: "owczarki, psy pasterskie",
    sense: "Więź / stado",
    colorVar: "--w-pol",
    colorHex: "#a08a3c",
    biome: "pola",
    emblem: "🌾",
  },
  ruin: {
    id: "ruin",
    name: "Wataha Ruin",
    origin: "psy miejskie, kundle",
    sense: "Słuch / spryt",
    colorVar: "--w-ruin",
    colorHex: "#7d6f63",
    biome: "ruiny",
    emblem: "🏚️",
  },
  polnocy: {
    id: "polnocy",
    name: "Wataha Północy",
    origin: "husky, malamuty",
    sense: "Instynkt / pogoda",
    colorVar: "--w-polnocy",
    colorHex: "#5a7b93",
    biome: "gory",
    emblem: "❄️",
  },
};

export const WATAHA_ORDER: WatahaId[] = ["boru", "pol", "ruin", "polnocy"];

export const TERRAIN_COLOR: Record<TerrainType, string> = {
  commons: "var(--t-commons)",
  pola: "var(--t-pola)",
  bor: "var(--t-bor)",
  ruiny: "var(--t-ruiny)",
  gory: "var(--t-gory)",
  unknown: "var(--t-unknown)",
};

// te same barwy jako hex — potrzebne tam, gdzie animujemy fill (framer-motion nie interpoluje var())
export const TERRAIN_COLOR_HEX: Record<TerrainType, string> = {
  commons: "#d8cdae",
  pola: "#a7be7e",
  bor: "#6e9466",
  ruiny: "#a89f90",
  gory: "#9fb0be",
  unknown: "#2d3527",
};

export const TERRAIN_LABEL: Record<TerrainType, string> = {
  commons: "Commons (start)",
  pola: "Pola",
  bor: "Bór",
  ruiny: "Ruiny",
  gory: "Góry",
  unknown: "Nieodkryte",
};

// ---- STATYSTYKI ----
export const STATS: { id: StatId; label: string; icon: string }[] = [
  { id: "sila", label: "Siła", icon: "💪" },
  { id: "zrecznosc", label: "Zręczność", icon: "🤸" },
  { id: "spryt", label: "Spryt", icon: "🧠" },
  { id: "wech", label: "Węch", icon: "👃" },
  { id: "szybkosc", label: "Szybkość", icon: "💨" },
];

// ---- ZABAWKI (trening statystyk) ----
export const TOYS: { id: string; label: string; stat: StatId; icon: string }[] = [
  { id: "lina", label: "Przeciąganie liny", stat: "sila", icon: "🪢" },
  { id: "szarpak", label: "Szarpak", stat: "zrecznosc", icon: "🧦" },
  { id: "lamiglowka", label: "Kość-łamigłówka", stat: "spryt", icon: "🦴" },
  { id: "piszczak", label: "Piszczek tropiący", stat: "wech", icon: "🎾" },
  { id: "aport", label: "Aport", stat: "szybkosc", icon: "🥏" },
];

// ---- DRZEWO ZMYSŁÓW ----
export interface SenseTier {
  name: string;
  desc: string;
}
export interface SenseBranch {
  id: BranchId;
  label: string;
  icon: string;
  scales: string; // co wzmacnia zdolności tej gałęzi
  tiers: [SenseTier, SenseTier, SenseTier, SenseTier];
}

export const SENSE_TREE: SenseBranch[] = [
  {
    id: "wech", label: "Węch", icon: "👃", scales: "statystyka Węch",
    tiers: [
      { name: "Trop", desc: "odkryj sąsiedni zakryty heks bez wchodzenia" },
      { name: "Nos Łowczy", desc: "wyczuj zasoby i wilki w promieniu" },
      { name: "Pamięć Zapachu", desc: "czytaj echa Ciszy — ukryte łupy" },
      { name: "Nos Pradawny", desc: "odkryj mapę na dużą odległość · ścieżka: Tropiciel" },
    ],
  },
  {
    id: "sluch", label: "Słuch", icon: "👂", scales: "statystyka Spryt",
    tiers: [
      { name: "Czujne Ucho", desc: "podejrzyj talię Wydarzeń Świata" },
      { name: "Słuch Ziemi", desc: "wykryj pułapki i zagrożenia" },
      { name: "Ciche Łapy", desc: "ruch bez alarmowania wilków" },
      { name: "Wycie Dalekosiężne", desc: "koordynacja na całą mapę · ścieżka: tempo" },
    ],
  },
  {
    id: "wiez", label: "Więź", icon: "🫧", scales: "liczba psów",
    tiers: [
      { name: "Wyczucie Strachu", desc: "czytaj intencje watah i wilków" },
      { name: "Zew Stada", desc: "tańsza kooperacja i obrona" },
      { name: "Pakt Szaro-Stalowych", desc: "sojusz z szaro-stalowymi wilkami" },
      { name: "Dusza Watahy", desc: "wielki bonus współpracy · ścieżka: sojusz" },
    ],
  },
  {
    id: "instynkt", label: "Instynkt", icon: "🌡️", scales: "statystyka Siła",
    tiers: [
      { name: "Wyczucie Burzy", desc: "przewiduj wydarzenia pogodowe" },
      { name: "Gruba Skóra", desc: "odporność na żywioły" },
      { name: "Drugie Życie", desc: "regeneracja, powrót po walce" },
      { name: "Pan Żywiołów", desc: "żywioły na twoją korzyść · ścieżka: przetrwanie" },
    ],
  },
  {
    id: "wzrok", label: "Wzrok", icon: "👁️", scales: "statystyka Szybkość",
    tiers: [
      { name: "Wzrok Zmierzchu", desc: "+1 punkt akcji na turę" },
      { name: "Oko Łowcy", desc: "bonus w polowaniu i walce" },
      { name: "Sokoli Wzrok", desc: "namierzaj cele z dystansu" },
      { name: "Władca Przestrzeni", desc: "tania ekspansja · ścieżka: dominacja" },
    ],
  },
];

// koszt w Tropach wejścia na dany szczebel (index = docelowy szczebel 1..4)
export const TROPY_COST = [0, 1, 2, 4, 7];

// gałąź, w której dana wataha startuje z odblokowanym szczeblem I
export const START_BRANCH: Record<WatahaId, BranchId> = {
  boru: "wech",
  pol: "wiez",
  ruin: "sluch",
  polnocy: "instynkt",
};

// ---- WILKI ----
export const WOLF_INFO: Record<
  WolfType,
  { label: string; power: number; color: string; hostile: boolean; reward: number }
> = {
  czarny: { label: "Czarny wilk", power: 3, color: "#242424", hostile: true, reward: 3 },
  bialy: { label: "Biały wilk", power: 2, color: "#d9dde1", hostile: true, reward: 2 },
  szary: { label: "Szaro-stalowy wilk", power: 1, color: "#7c8794", hostile: false, reward: 1 },
};
