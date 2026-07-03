import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Roll } from "../state/store";

export default function FeedbackToast({ lastRoll }: { lastRoll: Roll | null }) {
  const [shown, setShown] = useState<Roll | null>(null);

  useEffect(() => {
    if (!lastRoll) return;
    setShown(lastRoll);
    const t = setTimeout(() => setShown(null), 2300);
    return () => clearTimeout(t);
  }, [lastRoll?.id]);

  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {shown && (
          <motion.div
            key={shown.id}
            className={"toast tone-" + (shown.tone ?? "info")}
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="toast-die">🎲 {shown.value}</span>
            <span className="toast-text">{shown.text ?? shown.reason}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
