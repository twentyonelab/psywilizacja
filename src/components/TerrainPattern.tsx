import { TerrainType } from "../game/types";

// Dekoracje rysowane wewnątrz heksu (współrzędne względem środka 0,0), przycięte do rozmiaru heksu.
export function TerrainDecor({ terrain, size }: { terrain: TerrainType; size: number }) {
  const s = size;
  switch (terrain) {
    case "commons":
      // Kopiec Pamięci — koncentryczne kręgi zapachu
      return (
        <g opacity="0.5" stroke="#8a7a55" fill="none" strokeWidth="1">
          <circle r={s * 0.22} />
          <circle r={s * 0.42} strokeDasharray="2 3" />
          <circle r={s * 0.6} strokeDasharray="1 4" opacity="0.6" />
        </g>
      );
    case "pola":
      // kępki trawy
      return (
        <g stroke="#5d7a3c" strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
          {[[-14, 10], [6, 14], [-4, -6], [15, -4], [-18, -8]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <path d="M0,0 Q-2,-7 -4,-10" />
              <path d="M0,0 Q0,-8 0,-11" />
              <path d="M0,0 Q2,-7 4,-10" />
            </g>
          ))}
        </g>
      );
    case "bor":
      // sylwetki drzew
      return (
        <g fill="#2f4a2a" opacity="0.6">
          {[[-13, 6, 1], [8, 10, 0.85], [0, -8, 1.1], [16, -4, 0.8], [-16, -10, 0.75]].map(
            ([x, y, sc], i) => (
              <g key={i} transform={`translate(${x},${y}) scale(${sc})`}>
                <polygon points="0,-13 -7,3 7,3" />
                <polygon points="0,-8 -5.5,4 5.5,4" />
                <rect x="-1.3" y="4" width="2.6" height="4" fill="#3d2c1d" />
              </g>
            )
          )}
        </g>
      );
    case "ruiny":
      // gruz i pozostałości murów
      return (
        <g opacity="0.6">
          <rect x={-16} y={-2} width="10" height="16" fill="#7d7266" transform="rotate(-6 -11 6)" />
          <rect x={4} y={-14} width="8" height="12" fill="#8c8172" transform="rotate(4 8 -8)" />
          <polygon points="-6,10 4,10 1,16 -3,16" fill="#5f574c" />
          <line x1={-18} y1={14} x2={18} y2={11} stroke="#5f574c" strokeWidth="1.4" opacity="0.5" />
        </g>
      );
    case "gory":
      // szczyty ze śniegiem
      return (
        <g opacity="0.7">
          <polygon points="-18,12 -4,-10 8,12" fill="#7b8b96" />
          <polygon points="2,12 14,-6 22,12" fill="#8f9ea8" />
          <polygon points="-8,-3 -4,-10 0,-3" fill="#eef3f5" />
          <polygon points="8,0 14,-6 18,0" fill="#eef3f5" />
        </g>
      );
    default:
      return null;
  }
}
