import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Roll } from "../state/store";

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
};

function pipsFor(value: number): [number, number][] {
  if (value === 0) return [];
  if (value === 1) return PIP_LAYOUTS[1];
  return PIP_LAYOUTS[2];
}

export default function DiceRoller({ lastRoll }: { lastRoll: Roll | null }) {
  const [display, setDisplay] = useState<number>(lastRoll?.value ?? 0);
  const [rolling, setRolling] = useState(false);
  const seen = useRef<number | undefined>(lastRoll?.id);

  useEffect(() => {
    if (!lastRoll || lastRoll.id === seen.current) return;
    seen.current = lastRoll.id;
    setRolling(true);
    const seq = [0, 1, 2, 1, 2, 0, 1, lastRoll.value];
    let i = 0;
    const iv = setInterval(() => {
      setDisplay(seq[i]);
      i++;
      if (i >= seq.length) {
        clearInterval(iv);
        setRolling(false);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [lastRoll]);

  return (
    <motion.div
      className="die"
      animate={rolling ? { rotate: [0, -12, 12, -8, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect x="4" y="4" width="92" height="92" rx="16" fill="none" />
        {pipsFor(lastRoll ? display : 0).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="9" fill="var(--ink)" />
        ))}
        {!lastRoll && (
          <text x="50" y="58" textAnchor="middle" fontSize="34" fill="var(--soft)">–</text>
        )}
      </svg>
    </motion.div>
  );
}
