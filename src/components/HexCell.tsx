import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TERRAIN_COLOR_HEX } from "../game/content";
import { hexCorners, HEX_SIZE } from "../game/hex";
import { HexTile } from "../game/types";
import { TerrainDecor } from "./TerrainPattern";

interface Props {
  tile: HexTile;
  x: number;
  y: number;
  k: string;
  isSel: boolean;
  canMove: boolean;
  canSniff: boolean;
  canAttack: boolean;
  onClick: (k: string) => void;
}

export default function HexCell({ tile, x, y, k, isSel, canMove, canSniff, canAttack, onClick }: Props) {
  const wasRevealed = useRef(tile.revealed);
  const [justRevealed, setJustRevealed] = useState(false);

  useEffect(() => {
    if (!wasRevealed.current && tile.revealed) {
      setJustRevealed(true);
      const t = setTimeout(() => setJustRevealed(false), 900);
      return () => clearTimeout(t);
    }
    wasRevealed.current = tile.revealed;
  }, [tile.revealed]);

  let ring: React.CSSProperties | undefined;
  if (canAttack) ring = { stroke: "#e8654e", strokeWidth: 3.5 };
  else if (isSel) ring = { stroke: "var(--accent-bright)", strokeWidth: 3 };
  else if (canMove) ring = { stroke: "#eafbe0", strokeWidth: 3 };
  else if (canSniff) ring = { stroke: "#ffd9a8", strokeWidth: 3, strokeDasharray: "5 4" };

  const corners = hexCorners(x, y);

  return (
    <g className="hex" data-key={k} data-terrain={tile.terrain} onClick={() => onClick(k)}>
      <motion.polygon
        points={corners}
        animate={{ fill: TERRAIN_COLOR_HEX[tile.terrain] }}
        initial={false}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {tile.terrain !== "unknown" && (
        <motion.g
          initial={justRevealed ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: justRevealed ? 0.15 : 0 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <g transform={`translate(${x},${y})`}>
            <TerrainDecor terrain={tile.terrain} size={HEX_SIZE} />
          </g>
        </motion.g>
      )}

      {(canMove || canSniff) && (
        <polygon points={hexCorners(x, y, HEX_SIZE * 0.82)} fill="rgba(255,255,255,.10)" />
      )}

      <polygon points={corners} className="hex-outline" style={ring} />

      {tile.terrain === "unknown" && (
        <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fill="rgba(255,255,255,.35)">?</text>
      )}
      {canSniff && (
        <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fill="#ffd9a8">👃</text>
      )}

      {justRevealed && (
        <motion.circle
          cx={x}
          cy={y}
          r={HEX_SIZE * 0.3}
          fill="none"
          stroke="#ffe9c4"
          strokeWidth={2}
          initial={{ r: HEX_SIZE * 0.2, opacity: 0.9 }}
          animate={{ r: HEX_SIZE * 1.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
}
