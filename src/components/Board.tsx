import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WATAHY, WOLF_INFO } from "../game/content";
import { GameMap } from "../game/mapgen";
import { axialToPixel, HEX_SIZE, key } from "../game/hex";
import { WatahaId } from "../game/types";
import HexCell from "./HexCell";
import { EmblemGroup } from "./Emblems";

interface Props {
  map: GameMap;
  selected: string | null;
  currentId: WatahaId;
  moveable: Set<string>;
  sniffable: Set<string>;
  attackable: Set<string>;
  onHexClick: (k: string) => void;
}

function WolfToken({ type }: { type: keyof typeof WOLF_INFO }) {
  const c = WOLF_INFO[type].color;
  const r = HEX_SIZE * 0.4;
  const stroke = type === "bialy" ? "#6b7178" : "#f3f1ea";
  return (
    <g>
      {/* uszy */}
      <polygon points={`${-r * 0.7},${-r * 0.5} ${-r * 0.25},${-r * 0.95} ${-r * 0.05},${-r * 0.3}`} fill={c} />
      <polygon points={`${r * 0.7},${-r * 0.5} ${r * 0.25},${-r * 0.95} ${r * 0.05},${-r * 0.3}`} fill={c} />
      <circle r={r} fill={c} stroke={stroke} strokeWidth={2.4} />
      {/* oczy */}
      <circle cx={-r * 0.32} cy={-r * 0.1} r={r * 0.12} fill="#e8c34a" />
      <circle cx={r * 0.32} cy={-r * 0.1} r={r * 0.12} fill="#e8c34a" />
      {/* kły */}
      <polygon points={`${-r * 0.22},${r * 0.25} ${-r * 0.05},${r * 0.25} ${-r * 0.13},${r * 0.6}`} fill="#fff" />
      <polygon points={`${r * 0.22},${r * 0.25} ${r * 0.05},${r * 0.25} ${r * 0.13},${r * 0.6}`} fill="#fff" />
    </g>
  );
}

export default function Board({ map, selected, currentId, moveable, sniffable, attackable, onHexClick }: Props) {
  const tiles = Object.values(map.tiles);

  const view = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of tiles) {
      const { x, y } = axialToPixel(t);
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    const pad = HEX_SIZE * 1.6;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }, [tiles]);

  return (
    <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role="img" aria-label="Plansza heksowa">
      {tiles.map((t) => {
        const { x, y } = axialToPixel(t);
        const k = key(t);
        return (
          <HexCell
            key={k}
            tile={t}
            x={x}
            y={y}
            k={k}
            isSel={selected === k}
            canMove={moveable.has(k)}
            canSniff={sniffable.has(k)}
            canAttack={attackable.has(k)}
            onClick={onHexClick}
          />
        );
      })}

      {/* wilki */}
      <AnimatePresence>
        {map.wolves.map((w) => {
          const { x, y } = axialToPixel(w);
          return (
            <motion.g
              key={w.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1, x, y }}
              exit={{ scale: 0, opacity: 0, rotate: 40 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              style={{ pointerEvents: "none" }}
            >
              <WolfToken type={w.type} />
            </motion.g>
          );
        })}
      </AnimatePresence>

      {/* watahy */}
      {map.units.map((u) => {
        const { x, y } = axialToPixel(u);
        const w = WATAHY[u.watahaId];
        const isCurrent = u.watahaId === currentId;
        return (
          <motion.g
            key={u.watahaId}
            initial={{ scale: 0 }}
            animate={{ scale: 1, x, y }}
            transition={{ type: "spring", stiffness: 210, damping: 19 }}
            style={{ pointerEvents: "none" }}
          >
            {isCurrent && (
              <motion.circle
                r={HEX_SIZE * 0.68}
                fill="none"
                stroke="var(--accent-bright)"
                strokeWidth={3}
                animate={{ scale: [1, 1.12, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}
            <circle r={HEX_SIZE * 0.54} fill="#fdfbf5" stroke={w.colorHex} strokeWidth={3.5} />
            <EmblemGroup id={u.watahaId} color={w.colorHex} scale={0.95} />
          </motion.g>
        );
      })}
    </svg>
  );
}
