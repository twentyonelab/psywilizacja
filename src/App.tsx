import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Board from "./components/Board";
import { useGame, apMax } from "./state/store";
import { STATS, TERRAIN_LABEL, TOYS, SENSE_TREE, WATAHY, WOLF_INFO } from "./game/content";
import { key, neighbors } from "./game/hex";
import Emblem from "./components/Emblems";
import DiceRoller from "./components/DiceRoller";
import SensesTree from "./components/SensesTree";
import VictoryModal from "./components/VictoryModal";
import FeedbackToast from "./components/FeedbackToast";
import Board3D from "./components/Board3D";
import { IconFood, IconShelter, IconTools, IconTropy } from "./components/ResourceIcons";

export default function App() {
  const { map, players, controller, order, current, ap, selected, lastRoll, log, turnNo, winner, winPath, clickHex, trainStat, unlockSense, endTurn, reset } = useGame();
  const curId = order[current];
  const cur = WATAHY[curId];
  const player = players[curId];
  const res = player.resources;
  const maxAp = apMax(player);
  const isAI = controller[curId] === "ai";

  const [showTree, setShowTree] = useState(false);
  const [showToys, setShowToys] = useState(false);
  const [threeD, setThreeD] = useState(false);

  const unit = map.units.find((u) => u.watahaId === curId)!;
  const { moveable, sniffable, attackable } = useMemo(() => {
    const mv = new Set<string>();
    const sn = new Set<string>();
    const at = new Set<string>();
    for (const n of neighbors(unit)) {
      const k = key(n);
      const wolf = map.wolves.find((w) => key(w) === k);
      if (wolf) { at.add(k); continue; }
      const t = map.tiles[k];
      if (!t) continue;
      if (t.revealed) mv.add(k);
      else sn.add(k);
    }
    return { moveable: mv, sniffable: sn, attackable: at };
  }, [unit.q, unit.r, map.tiles, map.wolves]);

  // Sterownik AI: krok po kroku, aż wyczerpie akcje, potem koniec tury.
  // Bezpiecznik: jeśli krok nie zużyje akcji (utknięcie), i tak kończymy turę.
  useEffect(() => {
    if (!isAI || winner) return;
    const id = setTimeout(() => {
      const st = useGame.getState();
      const id2 = st.order[st.current];
      if (st.controller[id2] !== "ai" || st.winner) return;
      if (st.ap <= 0) { st.endTurn(); return; }
      const before = st.ap;
      try { st.aiStep(); } catch (e) { console.error("AI błąd:", e); }
      if (useGame.getState().ap >= before) st.endTurn(); // brak postępu → nie blokuj gry
    }, 550);
    return () => clearTimeout(id);
  }, [isAI, curId, ap, winner]);

  const sel = selected ? map.tiles[selected] : null;
  const dangerLabel = ["bezpiecznie", "niski", "średni", "wysoki"];

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo"><span className="paw">🐾</span>Psywilizacja</div>
        <div className="tag">Po Ciszy: Watahy Nowego Świata</div>
        <div className="spacer" />
        <button className="btn view-toggle" onClick={() => setThreeD((v) => !v)}>
          {threeD ? "🗺️ Widok 2D" : "🧊 Podgląd 3D"}
        </button>
        <div className="pill">prototyp 0.6 · 2D/3D grywalne</div>
      </header>

      <div className="board-wrap">
        <FeedbackToast lastRoll={lastRoll} />
        {threeD ? (
          <div className="board3d">
            <div className="board3d-note">🧊 3D — przeciągnij, by obrócić · kółko = zoom · klikaj heksy jak w 2D</div>
            <Board3D
              map={map}
              selected={selected}
              currentId={curId}
              moveable={moveable}
              sniffable={sniffable}
              attackable={attackable}
              onHexClick={isAI || winner ? () => {} : clickHex}
            />
          </div>
        ) : (
          <Board
            map={map}
            selected={selected}
            currentId={curId}
            moveable={moveable}
            sniffable={sniffable}
            attackable={attackable}
            onHexClick={isAI || winner ? () => {} : clickHex}
          />
        )}
      </div>

      <aside className="sidepanel">
        {/* TURA */}
        <div className="card" style={{ borderColor: cur.colorHex, borderWidth: 2 }}>
          <div className="card-title" style={{ color: cur.colorHex }}>
            Runda {turnNo} · {isAI ? "tura AI" : "twoja tura"}
          </div>
          <div className="wataha-row" style={{ margin: "2px 0 8px" }}>
            <span className="emblem-badge" style={{ borderColor: cur.colorHex }}>
              <Emblem id={cur.id} color={cur.colorHex} size={26} />
            </span>
            <div>
              <div className="wataha-name">{cur.name} {isAI && <span className="ai-badge">AI</span>}</div>
              <div className="wataha-sub">zmysł: {cur.sense}</div>
            </div>
          </div>
          <div className="ap-dots">
            {Array.from({ length: maxAp }).map((_, i) => (
              <span key={i} className={"ap-dot" + (i < ap ? " on" : "")} />
            ))}
            <span className="ap-text">{ap}/{maxAp} akcji</span>
          </div>
          <div className="btn-row">
            <button className="btn primary" onClick={endTurn} disabled={isAI}>Zakończ turę ▸</button>
            <button className="btn ghost" onClick={reset}>Reset</button>
          </div>
          {isAI
            ? <div className="hint ai-think">🤖 {cur.name} planuje ruchy…</div>
            : <div className="hint">Sąsiednie pole: <b>zielone</b>=ruch, <b>👃</b>=węsz, <b style={{ color: "#e8654e" }}>czerwone</b>=atak na wilka.</div>}
          <div className="goal">🏆 Cel: odblokuj <b>legendarny (IV) zmysł</b> — jedną z 5 ścieżek zwycięstwa.</div>
        </div>

        {/* AKCJE ROZWOJU */}
        <div className="card" style={{ opacity: isAI ? 0.5 : 1, pointerEvents: isAI ? "none" : "auto" }}>
          <div className="card-title">Rozwój</div>
          <div className="btn-row">
            <button className="btn" onClick={() => setShowToys((v) => !v)}>🦴 Trenuj</button>
            <button className="btn" onClick={() => setShowTree(true)}>🧠 Zmysły</button>
          </div>
          {showToys && (
            <div className="toys">
              {TOYS.map((t) => (
                <button key={t.id} className="toy-btn" disabled={ap <= 0} onClick={() => trainStat(t.id)}>
                  <span className="toy-ic">{t.icon}</span>
                  <span className="toy-lb">{t.label}</span>
                  <span className="toy-stat">{STATS.find((s) => s.id === t.stat)!.icon}</span>
                </button>
              ))}
              <div className="hint">Trening kosztuje 1 akcję; kostka określa przyrost (0–2).</div>
            </div>
          )}
        </div>

        {/* STATYSTYKI */}
        <div className="card">
          <div className="card-title">Statystyki psów</div>
          <div className="stat-grid">
            {STATS.map((s) => (
              <div className="stat" key={s.id}>
                <span className="stat-ic">{s.icon}</span>
                <span className="stat-lb">{s.label}</span>
                <span className="stat-val">{player.stats[s.id]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZMYSŁY — skrót */}
        <div className="card">
          <div className="card-title">Zmysły (szczeble)</div>
          <div className="sense-mini">
            {SENSE_TREE.map((b) => (
              <div className="sense-mini-row" key={b.id}>
                <span className="sm-ic">{b.icon}</span>
                <span className="sm-lb">{b.label}</span>
                <span className="sm-lv">{["–", "I", "II", "III", "IV"][player.senses[b.id]]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZASOBY */}
        <div className="card">
          <div className="card-title">Zasoby</div>
          <div className="res-grid">
            <div className="res"><IconFood /><b>{res.jedzenie}</b><span className="res-lb">jedzenie</span></div>
            <div className="res"><IconShelter /><b>{res.schronienie}</b><span className="res-lb">schronienie</span></div>
            <div className="res"><IconTools /><b>{res.narzedzia}</b><span className="res-lb">narzędzia</span></div>
            <div className="res tropy"><IconTropy /><b>{res.tropy}</b><span className="res-lb">Tropy</span></div>
          </div>
        </div>

        {/* KOSTKA */}
        <div className="card">
          <div className="card-title">Kostka rozstrzygnięć</div>
          <div className="dice-wrap">
            <DiceRoller lastRoll={lastRoll} />
            <div className="dice-note">
              ścianki 0·0·1·1·2·2<br />
              {lastRoll ? `${lastRoll.reason} → ${lastRoll.value}` : "jeszcze nie rzucano"}
            </div>
          </div>
        </div>

        {/* WILKI */}
        <div className="card">
          <div className="card-title">Wilki na mapie ({map.wolves.length})</div>
          <div className="wolf-legend">
            {(["czarny", "bialy", "szary"] as const).map((t) => (
              <div className="wolf-row" key={t}>
                <span className="wolf-sw" style={{ background: WOLF_INFO[t].color }} />
                <span className="wolf-lb">{WOLF_INFO[t].label}</span>
                <span className="wolf-pw">{WOLF_INFO[t].hostile ? `siła ${WOLF_INFO[t].power}` : "neutralny"}</span>
              </div>
            ))}
          </div>
        </div>

        {sel && (
          <div className="card">
            <div className="card-title">Wybrane pole</div>
            <div style={{ fontSize: 13 }}>
              <div><b>{TERRAIN_LABEL[sel.terrain]}</b></div>
              <div className="wataha-sub">heks ({sel.q}, {sel.r}) · zagrożenie: {dangerLabel[sel.danger]}</div>
            </div>
          </div>
        )}

        {/* LOG */}
        <div className="card">
          <div className="card-title">Kronika</div>
          <div className="log">
            {log.map((l, i) => (
              <div key={i} className={"log-line" + (l.startsWith("—") ? " turn" : "")}>{l}</div>
            ))}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showTree && !winner && (
          <SensesTree watahaId={curId} player={player} ap={ap} onUnlock={(b) => unlockSense(b)} onClose={() => setShowTree(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winner && <VictoryModal watahaId={winner} path={winPath ?? ""} onReset={reset} />}
      </AnimatePresence>
    </div>
  );
}
