import * as THREE from "three";
import { std, gold, mk, glowPlane, canvasTex, foldGeometry, limb } from "./util3d.js";

// Tượng Phật Thích Ca ngồi thiền trên đài sen, hào quang tròn chạm hoa văn — theo ảnh tham chiếu.
// Hệ toạ độ: mặt quay về +z, cao khoảng 5.6 đơn vị (cả hào quang). Đặt scale ở nơi dùng.

function haloTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    const c = w / 2;
    const bg = g.createRadialGradient(c, c, 40, c, c, c);
    bg.addColorStop(0, "#f1c24a");
    bg.addColorStop(0.7, "#e0a52a");
    bg.addColorStop(1, "#c98a1c");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.translate(c, c);
    const stroke = (col, lw) => {
      g.strokeStyle = col;
      g.lineWidth = lw;
    };
    // vòng gờ ngoài
    for (const [r, col, lw] of [[498, "#8a5a12", 8], [478, "#f8dc7c", 5], [455, "#8a5a12", 4], [250, "#8a5a12", 4], [236, "#f8dc7c", 3], [90, "#8a5a12", 3]]) {
      stroke(col, lw);
      g.beginPath();
      g.arc(0, 0, r, 0, 6.3);
      g.stroke();
    }
    // lớp cánh sen lớn
    const petals = (n, r0, r1, wd, col, fill) => {
      for (let i = 0; i < n; i++) {
        g.save();
        g.rotate((i / n) * Math.PI * 2);
        g.beginPath();
        g.moveTo(0, -r0);
        g.bezierCurveTo(wd, -r0 - (r1 - r0) * 0.3, wd * 0.7, -r1 + 30, 0, -r1);
        g.bezierCurveTo(-wd * 0.7, -r1 + 30, -wd, -r0 - (r1 - r0) * 0.3, 0, -r0);
        if (fill) {
          g.fillStyle = fill;
          g.fill();
        }
        stroke(col, 3.5);
        g.stroke();
        g.restore();
      }
    };
    petals(16, 262, 448, 78, "#7a4c0e", "rgba(250,214,110,0.55)");
    petals(16, 290, 420, 44, "#9a6a18", "rgba(255,236,160,0.35)");
    petals(12, 98, 232, 52, "#7a4c0e", "rgba(250,214,110,0.5)");
    // hoa văn chấm tròn và xoắn
    g.fillStyle = "#8a5a12";
    for (let i = 0; i < 48; i++) {
      g.save();
      g.rotate((i / 48) * Math.PI * 2);
      g.beginPath();
      g.arc(0, -467, 6, 0, 6.3);
      g.fill();
      g.restore();
    }
    stroke("#8a5a12", 2.5);
    for (let i = 0; i < 24; i++) {
      g.save();
      g.rotate((i / 24) * Math.PI * 2);
      g.beginPath();
      g.arc(0, -352, 24, 0, Math.PI * 1.6);
      g.stroke();
      g.restore();
    }
  });
}

function baseBandTex() {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = "#b8821c";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#5a3608";
    g.lineWidth = 3;
    for (let x = 0; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x + 8, 52);
      g.bezierCurveTo(x + 20, 4, x + 44, 4, x + 56, 52);
      g.moveTo(x + 32, 10);
      g.lineTo(x + 32, 50);
      g.moveTo(x + 14, 34);
      g.quadraticCurveTo(x + 32, 22, x + 50, 34);
      g.stroke();
      g.fillStyle = "#f2cc6a";
      g.beginPath();
      g.arc(x + 32, 32, 5, 0, 6.3);
      g.fill();
    }
    g.fillStyle = "#e8bf62";
    g.fillRect(0, 0, w, 5);
    g.fillRect(0, h - 5, w, 5);
  }, [3, 1]);
}

function swastikaTex() {
  return canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = "#7a4a08";
    g.lineWidth = 12;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(64, 18);
    g.lineTo(64, 110);
    g.moveTo(18, 64);
    g.lineTo(110, 64);
    g.moveTo(64, 18);
    g.lineTo(98, 18);
    g.moveTo(110, 64);
    g.lineTo(110, 98);
    g.moveTo(64, 110);
    g.lineTo(30, 110);
    g.moveTo(18, 64);
    g.lineTo(18, 30);
    g.stroke();
  });
}

function lotusTier(parent, mat, n, radius, y, size, tilt, phase = 0) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + phase;
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
    g.rotation.y = a;
    const p = mk(new THREE.SphereGeometry(1, 20, 12), mat, [0, size * 0.1, size * 0.5], g);
    p.scale.set(size * 0.33, size * 0.17, size * 0.62);
    p.rotation.x = -tilt;
    p.position.set(0, Math.sin(tilt) * size * 0.45, Math.cos(tilt) * size * 0.45);
    // sống cánh sen
    const rib = mk(new THREE.CylinderGeometry(0.012, 0.012, size * 0.7, 4), mat, [0, 0, 0], g);
    rib.rotation.x = Math.PI / 2 - tilt;
    rib.position.set(0, Math.sin(tilt) * size * 0.5 + size * 0.1, Math.cos(tilt) * size * 0.5);
    parent.add(g);
  }
}

export function buildBuddha() {
  const g = new THREE.Group();
  // Thân tượng vàng: metalness 0.85, roughness 0.23
  const body = { metalness: 0.85, roughness: 0.23 };
  const au = gold(body);
  const auDeep = gold({ ...body, color: 0xc88a1a, emissive: 0x3a2000 });
  const auLight = gold({ ...body, color: 0xf0c04a, emissive: 0x4a3000 });
  // Đài sen đồng cổ: metalness 0.8, roughness 0.32
  const bronze = { metalness: 0.8, roughness: 0.32 };
  const bz = gold({ ...bronze, color: 0xb98a3a, emissive: 0x2a1a00 });
  const bzDeep = gold({ ...bronze, color: 0x9a6f2a, emissive: 0x241400 });
  const bzLight = gold({ ...bronze, color: 0xd0a24e, emissive: 0x2e1c00 });
  const dark = new THREE.MeshBasicMaterial({ color: 0x5a3208 });

  // ---- Đế + đài sen ----
  const bandMat = std(0xffffff, { map: baseBandTex(), metalness: 0.8, roughness: 0.32, envMapIntensity: 1 });
  mk(new THREE.CylinderGeometry(2.15, 2.25, 0.34, 56, 1), [bandMat, bz, bz], [0, 0.17, 0], g);
  mk(new THREE.CylinderGeometry(2.0, 2.15, 0.1, 56), bzLight, [0, 0.39, 0], g);
  mk(new THREE.TorusGeometry(2.02, 0.05, 10, 64), bzLight, [0, 0.45, 0], g).rotation.x = Math.PI / 2;
  mk(new THREE.CylinderGeometry(1.85, 1.95, 0.16, 56), bz, [0, 0.55, 0], g);
  lotusTier(g, bz, 22, 1.45, 0.6, 1.05, 0.3);
  lotusTier(g, bzLight, 18, 1.28, 0.78, 0.95, 0.55, 0.15);
  lotusTier(g, bz, 14, 1.05, 0.98, 0.8, 0.8, 0.1);
  mk(new THREE.CylinderGeometry(1.35, 1.45, 0.2, 48), bzDeep, [0, 1.12, 0], g);

  // ---- Chân kiết già (vạt y phục trải rộng, có nếp) ----
  const lapGeo = foldGeometry(new THREE.SphereGeometry(1, 64, 32), 18, 0.035, -1, 0.2);
  const lap = mk(lapGeo, auDeep, [0, 1.5, 0.05], g);
  lap.scale.set(1.9, 0.56, 1.25);
  // hai bắp chân gác chéo phía trước (cuộn vải nằm ngang)
  for (const [y, z, len] of [[1.42, 0.95, 2.2], [1.6, 1.15, 1.7]]) {
    const roll = mk(foldGeometry(new THREE.CapsuleGeometry(0.3, len, 10, 24), 8, 0.04), auDeep, [0, y, z], g);
    roll.rotation.z = Math.PI / 2;
    roll.scale.set(1, 1, 0.8);
  }
  // tà áo rủ hai bên đùi
  for (const s of [-1, 1]) {
    const drape = mk(foldGeometry(new THREE.SphereGeometry(1, 28, 16), 12, 0.07), auDeep, [1.15 * s, 1.55, 0.35], g);
    drape.scale.set(0.62, 0.34, 0.9);
    drape.rotation.y = 0.4 * s;
  }

  // ---- Thân: áo cà sa phủ cả hai vai ----
  const torsoPts = [[0.0, 1.55], [0.92, 1.58], [0.86, 2.0], [0.74, 2.45], [0.82, 2.85], [0.78, 3.12], [0.52, 3.3], [0.26, 3.4], [0.0, 3.42]].map(([r, y]) => new THREE.Vector2(r, y));
  const torsoGeo = foldGeometry(new THREE.LatheGeometry(torsoPts, 64), 14, 0.022, 1.6, 2.9);
  const torso = mk(torsoGeo, au, [0, 0, 0], g);
  torso.scale.z = 0.78;
  // ngực mở chữ V + dấu vạn
  const vShape = new THREE.Shape();
  vShape.moveTo(-0.36, 3.15);
  vShape.lineTo(0.36, 3.15);
  vShape.quadraticCurveTo(0.2, 2.5, 0, 2.05);
  vShape.quadraticCurveTo(-0.2, 2.5, -0.36, 3.15);
  const chest = mk(new THREE.ShapeGeometry(vShape, 12), auLight, [0, 0, 0.605], g);
  chest.position.z = 0.6;
  const swas = mk(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: swastikaTex(), transparent: true }), [0, 2.72, 0.612], g);
  swas.renderOrder = 2;
  // viền áo hai bên cổ V (có hoa văn)
  for (const s of [-1, 1]) {
    const edge = mk(new THREE.CapsuleGeometry(0.045, 1.1, 6, 12), auDeep, [0.3 * s, 2.58, 0.58], g);
    edge.rotation.z = -0.3 * s;
    edge.rotation.x = -0.05;
    const trim = mk(new THREE.CapsuleGeometry(0.02, 1.0, 4, 8), auLight, [0.3 * s, 2.58, 0.63], g);
    trim.rotation.z = -0.3 * s;
  }
  // lớp gấp ngang bụng
  const fold1 = mk(new THREE.TorusGeometry(0.76, 0.1, 10, 40, Math.PI), auDeep, [0, 1.98, 0.02], g);
  fold1.rotation.set(-Math.PI / 2 + 0.2, 0, Math.PI);
  fold1.scale.set(1, 0.7, 1);

  // ---- Tay: tay áo rộng, bàn tay thiền định ấn đặt trên đùi ----
  const hands = [];
  for (const s of [-1, 1]) {
    mk(new THREE.SphereGeometry(0.4, 24, 16), auDeep, [0.86 * s, 3.0, 0], g).scale.set(1, 0.9, 0.9);
    limb([0.9 * s, 2.95, 0.02], [1.2 * s, 2.0, 0.3], 0.38, 0.46, auDeep, g);
    limb([1.2 * s, 2.0, 0.3], [0.5 * s, 1.78, 0.98], 0.4, 0.26, auDeep, g);
    mk(new THREE.SphereGeometry(0.43, 20, 14), auDeep, [1.2 * s, 1.98, 0.3], g);
    // cổ tay
    limb([0.5 * s, 1.78, 0.98], [0.28 * s, 1.74, 1.1], 0.24, 0.17, au, g);
    mk(new THREE.SphereGeometry(0.27, 16, 12), auDeep, [0.5 * s, 1.78, 0.98], g);
    hands.push(s);
  }
  // bàn tay xếp chồng, hai ngón cái chạm nhau
  const palm = mk(foldGeometry(new THREE.SphereGeometry(0.3, 24, 16), 8, 0.05), au, [0, 1.73, 1.16], g);
  palm.scale.set(1.55, 0.42, 1.0);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const f = mk(new THREE.CapsuleGeometry(0.052, 0.26, 4, 8), auLight, [(0.16 + k * 0.1) * s * -1 + 0.03 * s, 1.84 + k * 0.012, 1.34 - k * 0.02], g);
      f.rotation.set(Math.PI / 2, 0, 0.25 * s - k * 0.1 * s);
    }
    const th = mk(new THREE.CapsuleGeometry(0.06, 0.3, 4, 8), auLight, [0.1 * s, 1.88, 1.3], g);
    th.rotation.set(Math.PI / 2 - 0.25, 0, -0.5 * s);
  }

  // ---- Cổ + đầu ----
  mk(new THREE.CylinderGeometry(0.27, 0.34, 0.5, 28), au, [0, 3.48, 0.04], g);
  for (const y of [3.38, 3.5]) mk(new THREE.TorusGeometry(0.29, 0.025, 6, 28), auLight, [0, y, 0.05], g).rotation.x = Math.PI / 2;
  const head = new THREE.Group();
  head.position.set(0, 4.05, 0.08);
  g.add(head);
  const skullGeo = new THREE.SphereGeometry(0.62, 48, 36);
  {
    const pos = skullGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < 0) pos.setXYZ(i, pos.getX(i) * (1 + y * 0.6), y, pos.getZ(i) * (1 + y * 0.18));
    }
    skullGeo.computeVertexNormals();
  }
  const skull = mk(skullGeo, au, [0, 0, 0], head);
  skull.scale.set(0.9, 1.07, 0.98);
  // cằm đầy đặn
  // má
  for (const s of [-1, 1]) mk(new THREE.SphereGeometry(0.15, 18, 14), auLight, [0.24 * s, -0.17, 0.5], head).scale.set(1, 0.8, 0.5);
  // tai dài
  for (const s of [-1, 1]) {
    const ear = mk(new THREE.CapsuleGeometry(0.075, 0.5, 6, 12), au, [0.6 * s, -0.12, 0.02], head);
    ear.rotation.z = 0.06 * s;
    ear.scale.z = 0.7;
    mk(new THREE.SphereGeometry(0.1, 12, 10), au, [0.595 * s, -0.42, 0.02], head).scale.set(0.8, 1.2, 0.6);
  }
  // mắt khép (cung cong xuống), lông mày, mũi, miệng
  for (const s of [-1, 1]) {
    const eye = mk(new THREE.TorusGeometry(0.115, 0.016, 5, 16, Math.PI * 0.8), dark, [0.23 * s, 0.07, 0.58], head);
    eye.rotation.z = Math.PI + Math.PI * 0.1;
    eye.rotation.y = -0.28 * s;
    const lid = mk(new THREE.SphereGeometry(0.1, 14, 10), auLight, [0.23 * s, 0.1, 0.57], head);
    lid.scale.set(1.15, 0.45, 0.35);
    const brow = mk(new THREE.TorusGeometry(0.17, 0.014, 4, 14, Math.PI * 0.42), dark, [0.23 * s, 0.26, 0.55], head);
    brow.rotation.set(0, -0.3 * s, Math.PI / 2 - Math.PI * 0.21 + (s > 0 ? -0.1 : 0.1));
  }
  const nose = mk(new THREE.SphereGeometry(0.075, 16, 12), au, [0, -0.1, 0.6], head);
  nose.scale.set(0.8, 1.3, 0.85);
  const mouth = mk(new THREE.TorusGeometry(0.12, 0.016, 5, 16, Math.PI * 0.7), new THREE.MeshBasicMaterial({ color: 0x9a4a22 }), [0, -0.3, 0.55], head);
  mouth.rotation.z = Math.PI + Math.PI * 0.15;
  const lipU = mk(new THREE.SphereGeometry(0.08, 12, 8), auLight, [0, -0.255, 0.585], head);
  lipU.scale.set(1.5, 0.35, 0.6);
  const urna = mk(new THREE.SphereGeometry(0.035, 10, 8), auLight, [0, 0.18, 0.62], head);
  urna.material = new THREE.MeshStandardMaterial({ color: 0xf5d070, metalness: 1, roughness: 0.2, emissive: 0x5a3a00 });

  // tóc xoăn ốc (instanced) phủ đầu và nhục kế
  const curlMat = new THREE.MeshStandardMaterial({ color: 0x2b1f1a, roughness: 0.48, metalness: 0.25, envMapIntensity: 0.8 });
  const curlGeo = new THREE.SphereGeometry(1, 8, 6);
  const dummy = new THREE.Object3D();
  const curls = [];
  const N1 = 520;
  for (let i = 0; i < N1; i++) {
    const y = 1 - ((i + 0.5) / N1) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    const nx = Math.cos(a) * r, nz = Math.sin(a) * r;
    // nz > 0: phía trước (mặt). Đường chân tóc cong trên trán.
    const lim = nz > 0 ? 0.52 - 0.22 * Math.abs(nx) + nz * 0.05 : -0.2;
    if (y < lim) continue;
    curls.push([nx * 0.645 * 0.9, y * 0.645 * 1.07, nz * 0.645 * 0.98, 0.074]);
  }
  const N2 = 220;
  for (let i = 0; i < N2; i++) {
    const y = 1 - ((i + 0.5) / N2) * 2;
    if (y < 0.1) continue;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996;
    curls.push([Math.cos(a) * r * 0.4, 0.62 + y * 0.3, Math.sin(a) * r * 0.4 - 0.02, 0.064]);
  }
  const hair = new THREE.InstancedMesh(curlGeo, curlMat, curls.length);
  curls.forEach(([x, yy, z, s], i) => {
    dummy.position.set(x, yy, z);
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    hair.setMatrixAt(i, dummy.matrix);
  });
  head.add(hair);
  // nhục kế đỏ + ngọn lửa trí tuệ
  mk(new THREE.SphereGeometry(0.05, 10, 8), std(0xd02a1c, { emissive: 0x801010, metalness: 0.4, roughness: 0.3 }), [0, 0.99, -0.02], head);
  mk(new THREE.ConeGeometry(0.06, 0.2, 10), au, [0, 1.1, -0.02], head);

  // ---- Hào quang tròn chạm hoa văn ----
  const halo = new THREE.Group();
  halo.position.set(0, 4.1, -0.7);
  const tex = haloTex();
  const hm = std(0xffffff, { map: tex, bumpMap: tex, bumpScale: 2.5, metalness: 0.65, roughness: 0.25, emissive: 0x4a3000, envMapIntensity: 1.1, side: THREE.DoubleSide });
  halo.add(new THREE.Mesh(new THREE.CircleGeometry(1.85, 96), hm));
  mk(new THREE.TorusGeometry(1.85, 0.06, 12, 96), auLight, [0, 0, 0.012], halo);
  mk(new THREE.TorusGeometry(1.85, 0.06, 12, 96), auLight, [0, 0, -0.012], halo);
  g.add(halo);
  // cọc đỡ hào quang phía sau lưng
  mk(new THREE.CylinderGeometry(0.1, 0.12, 2.4, 12), auDeep, [0, 2.9, -0.66], g);

  const glow = glowPlane(8.4, 8.4, "255,214,120", 0.7);
  glow.position.set(0, 4.1, -0.9);
  g.add(glow);

  return { group: g, glow };
}
