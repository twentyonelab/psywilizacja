import { motion } from "framer-motion";
import { SENSE_TREE, TROPY_COST, WATAHY } from "../game/content";
import { BranchId, WatahaId } from "../game/types";
import { PlayerState } from "../state/store";
import { IconTropy } from "./ResourceIcons";

interface Props {
  watahaId: WatahaId;
  player: PlayerState;
  ap: number;
  onUnlock: (b: BranchId) => void;
  onClose: () => void;
}

export default function SensesTree({ watahaId, player, ap, onUnlock, onClose }: Props) {
  const w = WATAHY[watahaId];
  const tropy = player.resources.tropy;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal senses"
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <div className="modal-title">Drzewo zmysłów — {w.name}</div>
            <div className="modal-sub">
              Masz <b><IconTropy size={13} /> {tropy}</b> Tropów · {ap} akcji.
              Odblokowanie kosztuje Tropy + 1 akcję.
            </div>
          </div>
          <button className="btn ghost" onClick={onClose}>✕ Zamknij</button>
        </div>

        <div className="tree-grid">
          {SENSE_TREE.map((branch) => {
            const lvl = player.senses[branch.id];
            return (
              <div className="tree-col" key={branch.id}>
                <div className="tree-col-head">
                  <div className="tree-icon">{branch.icon}</div>
                  <div className="tree-branch">{branch.label}</div>
                  <div className="tree-scale">skaluje: {branch.scales}</div>
                </div>
                {branch.tiers.map((tier, i) => {
                  const tierNum = i + 1;
                  const unlocked = lvl >= tierNum;
                  const isNext = tierNum === lvl + 1;
                  const cost = TROPY_COST[tierNum];
                  const canAfford = tropy >= cost && ap > 0;
                  return (
                    <div
                      key={tierNum}
                      className={"tier" + (unlocked ? " unlocked" : "") + (isNext ? " next" : "")}
                      style={unlocked ? { borderColor: w.colorHex } : undefined}
                    >
                      <div className="tier-top">
                        <span className="tier-num">{["I", "II", "III", "IV"][i]}</span>
                        <span className="tier-name">{tier.name}</span>
                        {unlocked && <span className="tier-check" style={{ color: w.colorHex }}>✓</span>}
                      </div>
                      <div className="tier-desc">{tier.desc}</div>
                      {isNext && (
                        <button
                          className={"tier-btn" + (canAfford ? " ok" : "")}
                          disabled={!canAfford}
                          onClick={() => onUnlock(branch.id)}
                        >
                          Odblokuj · {cost} 👣
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
