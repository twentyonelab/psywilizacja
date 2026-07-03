// Pointy-top axial hex math

export const HEX_SIZE = 36; // center -> corner

export interface Axial {
  q: number;
  r: number;
}

export const key = (a: Axial) => `${a.q},${a.r}`;

export const DIRS: Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function neighbors(a: Axial): Axial[] {
  return DIRS.map((d) => ({ q: a.q + d.q, r: a.r + d.r }));
}

export function axialToPixel(a: Axial, size = HEX_SIZE) {
  const x = size * Math.sqrt(3) * (a.q + a.r / 2);
  const y = size * 1.5 * a.r;
  return { x, y };
}

export function hexCorners(cx: number, cy: number, size = HEX_SIZE): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30); // pointy-top
    pts.push(`${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function hexDistance(a: Axial, b: Axial): number {
  return (
    (Math.abs(a.q - b.q) +
      Math.abs(a.q + a.r - b.q - b.r) +
      Math.abs(a.r - b.r)) /
    2
  );
}

export function hexRange(radius: number): Axial[] {
  const out: Axial[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      out.push({ q, r });
    }
  }
  return out;
}

export function ring(radius: number): Axial[] {
  return hexRange(radius).filter((a) => hexDistance({ q: 0, r: 0 }, a) === radius);
}
