import * as THREE from "three";
import { std, gold, mk } from "./util3d.js";
import { lotusTier } from "./buddha.js";

const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 32);
const cushion = (r, h) => lathe([[0, 0], [r * 0.9, 0], [r, h * 0.45], [r * 0.92, h * 0.9], [r * 0.5, h], [0, h * 0.92]]);

function make(level) {
  const g = new THREE.Group();
  const y0 = 0.16; // mặt thảm
  let h = 0;
  if (level === 1) {
    mk(cushion(0.8, 0.12), std(0x8d8a84, { roughness: 0.95 }), [0, y0, 0], g);
    h = 0.12;
  } else if (level === 2 || level === 3) {
    const c = level === 2 ? 0x7a4a2e : 0xd9a21b;
    mk(cushion(0.85, 0.24), std(c, { roughness: 0.9 }), [0, y0, 0], g);
    if (level === 3) mk(new THREE.TorusGeometry(0.86, 0.025, 8, 40), gold(), [0, y0 + 0.1, 0], g).rotation.x = Math.PI / 2;
    mk(new THREE.SphereGeometry(0.07, 10, 8), std(0x3a2010), [0, y0 + 0.24, 0], g);
    h = 0.24;
  } else {
    const gd = level === 5;
    const petal = gd ? gold({ metalness: 0.85, roughness: 0.3 }) : std(0xf4b6c8, { roughness: 0.55 });
    const petalL = gd ? gold({ color: 0xf0c04a, metalness: 0.85, roughness: 0.3 }) : std(0xfbd3df, { roughness: 0.55 });
    const s = gd ? 1.15 : 1;
    const lot = new THREE.Group();
    lot.position.y = y0;
    lot.scale.setScalar(s * 0.5);
    mk(new THREE.CylinderGeometry(1.2, 1.3, 0.14, 32), gd ? petal : std(0x6b8f5a), [0, 0.07, 0], lot);
    lotusTier(lot, petal, 14, 1.0, 0.12, 0.85, 0.35);
    lotusTier(lot, petalL, 10, 0.78, 0.26, 0.7, 0.65, 0.2);
    mk(new THREE.CylinderGeometry(0.6, 0.7, 0.16, 28), gd ? petal : std(0xf0a8c0), [0, 0.5, 0], lot);
    g.add(lot);
    h = 0.5 * s * 0.9;
  }
  return { group: g, h };
}

// Mỗi cấp dựng một lần; các lần ngồi sau chỉ nhân bản (dùng chung hình và vật liệu, không rò bộ nhớ).
const cache = new Map();
export function buildSeat(level) {
  if (!cache.has(level)) cache.set(level, make(level));
  const t = cache.get(level);
  return { group: t.group.clone(), h: t.h };
}
