import { useEffect } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { GameMap } from "../game/mapgen";
import { key } from "../game/hex";
import { TerrainType, WatahaId } from "../game/types";
import { WATAHY, WOLF_INFO } from "../game/content";

interface Props {
  map: GameMap;
  selected: string | null;
  currentId: WatahaId;
  moveable: Set<string>;
  sniffable: Set<string>;
  attackable: Set<string>;
  onHexClick: (k: string) => void;
}

const SIZE = 1;

// paleta w duchu Dorfromantik — cieplejsza, malowana
const TCOLOR: Record<TerrainType, string> = {
  commons: "#d9c48f",
  pola: "#a9c85f",
  bor: "#5c8a4e",
  ruiny: "#b3a892",
  gory: "#95a3ac",
  unknown: "#5f6656",
};
// relief — różne wysokości kafli
const THEIGHT: Record<TerrainType, string | number> = {
  commons: 0.55,
  pola: 0.45,
  bor: 0.6,
  ruiny: 0.52,
  gory: 0.95,
  unknown: 0.28,
};

function wpos(q: number, r: number): [number, number] {
  return [SIZE * Math.sqrt(3) * (q + r / 2), SIZE * 1.5 * r];
}

const ROOFS = ["#c0503f", "#4f6d99", "#c9a23d"];

function Decor({ terrain, top }: { terrain: TerrainType; top: number }) {
  const y = top;
  switch (terrain) {
    case "bor":
      return (
        <group position={[0, y, 0]}>
          {[[-0.3, 0.1, 1], [0.28, -0.2, 0.82], [0.05, 0.34, 0.66]].map(([x, z, s], i) => (
            <group key={i} position={[x, 0, z]} scale={s as number}>
              <mesh position={[0, 0.16, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.08, 0.32, 6]} />
                <meshStandardMaterial color="#6b4a2b" />
              </mesh>
              <mesh position={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[0.24, 0.62, 8]} />
                <meshStandardMaterial color="#3f7a3a" />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "ruiny":
      return (
        <group position={[0, y, 0]}>
          {[[-0.2, 0.14, 0], [0.24, -0.16, 1]].map(([x, z, ri], i) => (
            <group key={i} position={[x as number, 0, z as number]}>
              <mesh position={[0, 0.13, 0]} castShadow>
                <boxGeometry args={[0.34, 0.26, 0.34]} />
                <meshStandardMaterial color="#efe6d3" />
              </mesh>
              <mesh position={[0, 0.34, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[0.32, 0.24, 4]} />
                <meshStandardMaterial color={ROOFS[ri as number]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "gory":
      return (
        <group position={[0, y, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <coneGeometry args={[0.55, 0.85, 6]} />
            <meshStandardMaterial color="#8794a0" flatShading />
          </mesh>
          <mesh position={[0, 0.74, 0]} castShadow>
            <coneGeometry args={[0.24, 0.3, 6]} />
            <meshStandardMaterial color="#eef3f5" flatShading />
          </mesh>
        </group>
      );
    case "commons":
      return (
        <mesh position={[0, y + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.07, 10, 30]} />
          <meshStandardMaterial color="#a8965f" />
        </mesh>
      );
    case "pola":
      return (
        <group position={[0, y, 0]}>
          <mesh position={[0.28, 0.18, 0.22]} scale={0.5} castShadow>
            <coneGeometry args={[0.24, 0.6, 8]} />
            <meshStandardMaterial color="#4f8a44" />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

const RING_COLOR: Record<string, string> = {
  attack: "#ef6a54",
  selected: "#ffe08a",
  move: "#8ce38c",
  sniff: "#ffcf8f",
};

function Hex({
  q, r, tKey, terrain, revealed, ring, onClick,
}: {
  q: number; r: number; tKey: string; terrain: TerrainType; revealed: boolean;
  ring?: keyof typeof RING_COLOR; onClick: (k: string) => void;
}) {
  const [x, z] = wpos(q, r);
  const h = THEIGHT[terrain] as number;
  const top = h / 2;

  return (
    <group
      position={[x, 0, z]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(tKey); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[SIZE * 0.995, SIZE * 0.995, h, 6]} />
        <meshStandardMaterial color={TCOLOR[terrain]} flatShading />
      </mesh>
      {revealed && <Decor terrain={terrain} top={top} />}
      {!revealed && (
        <mesh position={[0, top + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.16, 6]} />
          <meshStandardMaterial color="#3c4136" />
        </mesh>
      )}
      {ring && (
        <mesh position={[0, top + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[SIZE * 0.62, 0.07, 8, 32]} />
          <meshStandardMaterial color={RING_COLOR[ring]} emissive={RING_COLOR[ring]} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

function WatahaToken({ q, r, color, current, baseY }: { q: number; r: number; color: string; current: boolean; baseY: number }) {
  const [x, z] = wpos(q, r);
  return (
    <group position={[x, baseY, z]}>
      {current && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.06, 8, 28]} />
          <meshStandardMaterial color="#ffe08a" emissive="#ffca57" emissiveIntensity={0.7} />
        </mesh>
      )}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.12, 20]} />
        <meshStandardMaterial color="#fdfbf5" />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.26, 0.42, 14]} />
        <meshStandardMaterial color={color} emissive={current ? color : "#000"} emissiveIntensity={current ? 0.25 : 0} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <sphereGeometry args={[0.19, 18, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function WolfToken({ q, r, type, baseY }: { q: number; r: number; type: keyof typeof WOLF_INFO; baseY: number }) {
  const [x, z] = wpos(q, r);
  const c = WOLF_INFO[type].color;
  return (
    <group position={[x, baseY, z]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <coneGeometry args={[0.28, 0.56, 6]} />
        <meshStandardMaterial color={c} flatShading />
      </mesh>
      {/* uszy */}
      <mesh position={[-0.12, 0.5, 0.05]} castShadow>
        <coneGeometry args={[0.07, 0.16, 4]} />
        <meshStandardMaterial color={c} flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, 0.05]} castShadow>
        <coneGeometry args={[0.07, 0.16, 4]} />
        <meshStandardMaterial color={c} flatShading />
      </mesh>
      {/* oczy */}
      <mesh position={[-0.09, 0.34, 0.22]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#f2c53d" emissive="#f2c53d" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.09, 0.34, 0.22]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#f2c53d" emissive="#f2c53d" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Scene({ map, selected, currentId, moveable, sniffable, attackable, onHexClick }: Props) {
  const tiles = Object.values(map.tiles);
  const ringFor = (k: string): keyof typeof RING_COLOR | undefined => {
    if (attackable.has(k)) return "attack";
    if (selected === k) return "selected";
    if (moveable.has(k)) return "move";
    if (sniffable.has(k)) return "sniff";
    return undefined;
  };
  const topFor = (q: number, r: number): number => {
    const t = map.tiles[`${q},${r}`];
    return (((t ? THEIGHT[t.terrain] : 0.4) as number) / 2) + 0.06;
  };
  return (
    <>
      {tiles.map((t) => (
        <Hex
          key={key(t)} q={t.q} r={t.r} tKey={key(t)}
          terrain={t.terrain} revealed={t.revealed}
          ring={ringFor(key(t))} onClick={onHexClick}
        />
      ))}
      {map.wolves.map((w) => (
        <WolfToken key={w.id} q={w.q} r={w.r} type={w.type} baseY={topFor(w.q, w.r)} />
      ))}
      {map.units.map((u) => (
        <WatahaToken key={u.watahaId} q={u.q} r={u.r} color={WATAHY[u.watahaId].colorHex} current={u.watahaId === currentId} baseY={topFor(u.q, u.r)} />
      ))}
    </>
  );
}

export default function Board3D(props: Props) {
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event("resize"));
    const ids = [40, 150, 400, 800].map((ms) => setTimeout(kick, ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      gl={{ alpha: false, antialias: true }}
      camera={{ position: [0, 15, 16], fov: 40 }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onPointerMissed={() => { /* klik w tło — nic */ }}
    >
      <color attach="background" args={["#cdd7db"]} />
      <fog attach="fog" args={["#cdd7db", 26, 46]} />
      <hemisphereLight args={["#eaf2ff", "#6b6244", 0.7]} />
      <directionalLight
        position={[9, 16, 7]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0004}
      />
      <Scene {...props} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.35} scale={40} blur={2.2} far={12} />
      <OrbitControls
        enablePan
        minPolarAngle={0.25}
        maxPolarAngle={1.35}
        minDistance={7}
        maxDistance={40}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}
