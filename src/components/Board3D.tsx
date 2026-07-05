import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { hexRange, key } from "../game/hex";
import { TerrainType } from "../game/types";

const SIZE = 1;
const HEIGHT = 0.5;

const COLOR: Record<TerrainType, string> = {
  commons: "#d8cdae",
  pola: "#bcd07e",
  bor: "#6e9466",
  ruiny: "#a89f90",
  gory: "#9fb0be",
  unknown: "#8a8a82",
};

// pointy-top axial → pozycja świata (podłoga = XZ, wysokość = Y)
function pos(q: number, r: number): [number, number, number] {
  const x = SIZE * Math.sqrt(3) * (q + r / 2);
  const z = SIZE * 1.5 * r;
  return [x, 0, z];
}

// deterministyczny „ładny" patch terenu
function terrainFor(q: number, r: number, dist: number): TerrainType {
  if (q === 0 && r === 0) return "commons";
  if (dist >= 2 && (q + r) % 2 === 0) return "gory";
  const pick = ((q * 2 + r * 3) % 4 + 4) % 4;
  return (["pola", "bor", "ruiny", "pola"] as TerrainType[])[pick];
}

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, HEIGHT / 2, z]} scale={s}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.3, 6]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <coneGeometry args={[0.22, 0.55, 8]} />
        <meshStandardMaterial color="#3f7a3a" />
      </mesh>
    </group>
  );
}

function House({ x, z, roof }: { x: number; z: number; roof: string }) {
  return (
    <group position={[x, HEIGHT / 2, z]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.32, 0.24, 0.32]} />
        <meshStandardMaterial color="#efe6d3" />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.3, 0.22, 4]} />
        <meshStandardMaterial color={roof} />
      </mesh>
    </group>
  );
}

function Peak({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, HEIGHT / 2, z]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.5, 0.75, 6]} />
        <meshStandardMaterial color="#8f9ea8" />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <coneGeometry args={[0.22, 0.28, 6]} />
        <meshStandardMaterial color="#eef3f5" />
      </mesh>
    </group>
  );
}

function MemoryMound({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, HEIGHT / 2 + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.4, 0.06, 8, 28]} />
      <meshStandardMaterial color="#a8965f" />
    </mesh>
  );
}

const ROOFS = ["#c0503f", "#4f6d99", "#c9a23d"];

function Decor({ terrain, x, z }: { terrain: TerrainType; x: number; z: number }) {
  switch (terrain) {
    case "bor":
      return (
        <>
          <Tree x={x - 0.28} z={z + 0.1} s={1} />
          <Tree x={x + 0.25} z={z - 0.2} s={0.8} />
          <Tree x={x + 0.05} z={z + 0.35} s={0.7} />
        </>
      );
    case "ruiny":
      return (
        <>
          <House x={x - 0.18} z={z + 0.12} roof={ROOFS[0]} />
          <House x={x + 0.22} z={z - 0.15} roof={ROOFS[1]} />
        </>
      );
    case "gory":
      return <Peak x={x} z={z} />;
    case "commons":
      return <MemoryMound x={x} z={z} />;
    case "pola":
      return <Tree x={x + 0.3} z={z + 0.25} s={0.55} />;
    default:
      return null;
  }
}

function HexPatch() {
  const cells = hexRange(2);
  return (
    <group>
      {cells.map((c) => {
        const [x, , z] = pos(c.q, c.r);
        const dist = (Math.abs(c.q) + Math.abs(c.q + c.r) + Math.abs(c.r)) / 2;
        const terrain = terrainFor(c.q, c.r, dist);
        return (
          <group key={key(c)}>
            <mesh position={[x, 0, z]} castShadow receiveShadow>
              {/* walec 6-ścienny: domyślnie wierzchołek na osi Z (pointy-top) — pasuje do rozstawienia,
                  promień = SIZE → flat-to-flat = √3·SIZE = odległość sąsiadów → idealne stykanie */}
              <cylinderGeometry args={[SIZE * 0.995, SIZE * 0.995, HEIGHT, 6]} />
              <meshStandardMaterial color={COLOR[terrain]} />
            </mesh>
            <Decor terrain={terrain} x={x} z={z} />
          </group>
        );
      })}
    </group>
  );
}

export default function Board3D() {
  // R3F czasem mierzy kontener zanim layout poda wysokość — wymuszamy re-pomiar po montażu
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event("resize"));
    const ids = [40, 150, 400, 800].map((ms) => setTimeout(kick, ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <Canvas
      frameloop="demand"
      shadows
      gl={{ alpha: false }}
      camera={{ position: [0, 8, 8.5], fov: 42 }}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <color attach="background" args={["#d8c7ad"]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[6, 11, 5]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HEIGHT / 2 - 0.01, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#cdbb9c" />
      </mesh>
      <HexPatch />
      <OrbitControls
        enablePan={false}
        minPolarAngle={0.4}
        maxPolarAngle={1.3}
        minDistance={5}
        maxDistance={16}
      />
    </Canvas>
  );
}
