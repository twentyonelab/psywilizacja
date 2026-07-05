import { motion } from "framer-motion";
import { WATAHY } from "../game/content";
import { WatahaId } from "../game/types";
import Emblem from "./Emblems";

interface Props {
  watahaId: WatahaId;
  path: string;
  onReset: () => void;
}

export default function VictoryModal({ watahaId, path, onReset }: Props) {
  const w = WATAHY[watahaId];
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="victory"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        style={{ borderColor: w.colorHex }}
      >
        <div className="victory-crown">🏆</div>
        <div className="victory-title">Zwycięstwo!</div>
        <div className="victory-emblem" style={{ borderColor: w.colorHex }}>
          <Emblem id={w.id} color={w.colorHex} size={64} />
        </div>
        <div className="victory-name" style={{ color: w.colorHex }}>{w.name}</div>
        <div className="victory-path">
          zdobywa <b>dominację</b> nad krainą
          <br />
          <b>{path}</b>
        </div>
        <button className="btn primary victory-btn" onClick={onReset}>Nowa gra ▸</button>
      </motion.div>
    </motion.div>
  );
}
