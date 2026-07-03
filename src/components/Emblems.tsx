import { WatahaId } from "../game/types";

interface EmblemProps {
  size?: number;
  color: string; // resolved CSS color (not var())
}

// Odznaka jednej łapy — wspólny motyw bazowy dla wszystkich watah
function PawBase({ color }: { color: string }) {
  return (
    <g fill={color}>
      <ellipse cx="0" cy="4" rx="7.2" ry="6" />
      <ellipse cx="-7.5" cy="-4.5" rx="3" ry="3.6" transform="rotate(-18 -7.5 -4.5)" />
      <ellipse cx="-2.6" cy="-8.6" rx="3.1" ry="3.8" transform="rotate(-6 -2.6 -8.6)" />
      <ellipse cx="2.9" cy="-8.6" rx="3.1" ry="3.8" transform="rotate(6 2.9 -8.6)" />
      <ellipse cx="7.6" cy="-4.3" rx="3" ry="3.6" transform="rotate(18 7.6 -4.3)" />
    </g>
  );
}

function BoruEmblem({ color }: { color: string }) {
  // trop: łapa + linie "śladu zapachowego"
  return (
    <g>
      <PawBase color={color} />
      <g stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
        <path d="M -13 12 Q -16 6 -13 -1" fill="none" />
        <path d="M 13 12 Q 16 6 13 -1" fill="none" />
      </g>
    </g>
  );
}

function PolEmblem({ color }: { color: string }) {
  // więź/stado: trzy łapy mniejsze w kręgu jedności
  return (
    <g>
      <circle r="15.5" fill="none" stroke={color} strokeWidth="1.4" opacity="0.4" />
      <g transform="scale(0.62) translate(0,-2)">
        <PawBase color={color} />
      </g>
      <g transform="rotate(120) translate(0,-15) scale(0.4)">
        <PawBase color={color} />
      </g>
      <g transform="rotate(240) translate(0,-15) scale(0.4)">
        <PawBase color={color} />
      </g>
    </g>
  );
}

function RuinEmblem({ color }: { color: string }) {
  // słuch/spryt: łapa + wyostrzone "uszy" nasłuchu
  return (
    <g>
      <PawBase color={color} />
      <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M -9 -9 L -15 -17" />
        <path d="M -9 -9 L -14 -10.5" />
        <path d="M 9 -9 L 15 -17" />
        <path d="M 9 -9 L 14 -10.5" />
      </g>
    </g>
  );
}

function PolnocyEmblem({ color }: { color: string }) {
  // instynkt/pogoda: łapa + kryształ mrozu
  return (
    <g>
      <PawBase color={color} />
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65">
        <line x1="0" y1="-20" x2="0" y2="-11" />
        <line x1="-4" y1="-18" x2="4" y2="-14" />
        <line x1="4" y1="-18" x2="-4" y2="-14" />
      </g>
    </g>
  );
}

const EMBLEM_MAP: Record<WatahaId, (p: { color: string }) => JSX.Element> = {
  boru: BoruEmblem,
  pol: PolEmblem,
  ruin: RuinEmblem,
  polnocy: PolnocyEmblem,
};

export default function Emblem({ id, size = 32, color }: EmblemProps & { id: WatahaId }) {
  const Cmp = EMBLEM_MAP[id];
  return (
    <svg width={size} height={size} viewBox="-20 -22 40 40">
      <Cmp color={color} />
    </svg>
  );
}

export function EmblemGroup({ id, color, scale = 1 }: { id: WatahaId; color: string; scale?: number }) {
  const Cmp = EMBLEM_MAP[id];
  return (
    <g transform={`scale(${scale})`}>
      <Cmp color={color} />
    </g>
  );
}
