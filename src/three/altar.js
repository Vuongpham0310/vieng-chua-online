import * as THREE from "three";
import { std, canvasTex, mk, glowSprite, glowPlane, markCast } from "./util3d.js";
import { buildBuddha } from "./buddha.js";
import { HALL } from "../shared.js";

const WOOD = 0x603424;
const BZ = -42.5; // tâm tượng Phật
const DAIS_Y = 2.0;

function bannerTex(lines) {
  return canvasTex(256, 1200, (g, w, h) => {
    g.fillStyle = "#291a17";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b88342";
    g.lineWidth = 9;
    g.strokeRect(9, 9, w - 18, h - 18);
    g.lineWidth = 2.5;
    g.strokeRect(24, 24, w - 48, h - 48);
    g.fillStyle = "#b88342";
    for (const [x, y] of [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]]) {
      g.beginPath();
      g.arc(x, y, 9, 0, 6.3);
      g.fill();
    }
    g.font = "bold 84px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const step = (h - 330) / lines.length;
    lines.forEach((l, i) => g.fillText(l, w / 2, 120 + step * (i + 0.5), w - 70));
    g.save();
    g.translate(w / 2, h - 110);
    for (let i = -2; i <= 2; i++) {
      g.save();
      g.rotate(i * 0.42);
      g.beginPath();
      g.ellipse(0, -34, 16, 40, 0, 0, 6.3);
      g.fill();
      g.restore();
    }
    g.restore();
  });
}

function bonsai(scene, x, z, s) {
  const g = new THREE.Group();
  const stand = std(0x4a1a0f);
  mk(new THREE.BoxGeometry(0.9, 0.12, 0.9), stand, [0, 0.9, 0], g);
  for (const dx of [-0.36, 0.36]) for (const dz of [-0.36, 0.36]) mk(new THREE.BoxGeometry(0.1, 0.9, 0.1), stand, [dx, 0.45, dz], g);
  mk(new THREE.CylinderGeometry(0.46, 0.34, 0.38, 16), std(0x3a444c, { roughness: 0.4 }), [0, 1.2, 0], g);
  const trunk = mk(new THREE.CylinderGeometry(0.06, 0.13, 0.9, 8), std(0x5a3a20), [0, 1.8, 0], g);
  trunk.rotation.z = 0.2;
  const leaf = std(0x3f7d3a);
  [[0, 2.35, 0, 0.5], [-0.5, 2.1, 0.1, 0.38], [0.5, 2.15, -0.1, 0.4], [0.1, 2.0, 0.4, 0.3]].forEach(([dx, dy, dz, r]) =>
    mk(new THREE.SphereGeometry(r, 14, 10), leaf, [dx, dy, dz], g).scale.set(1.2, 0.7, 1.1)
  );
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  scene.add(g);
}

function vase(parent, x, z) {
  mk(new THREE.CylinderGeometry(0.25, 0.17, 0.8, 14), std(0x55707e, { roughness: 0.3 }), [x, 0.4, z], parent);
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9;
    const f = mk(new THREE.SphereGeometry(0.17, 10, 8), std(0xfbfbf2), [x + Math.cos(a) * 0.24, 1.0 + (i % 3) * 0.16, z + Math.sin(a) * 0.12], parent);
    f.scale.set(1, 0.7, 1);
  }
  mk(new THREE.SphereGeometry(0.06, 6, 6), std(0xf2c230), [x, 1.15, z], parent);
}

export function buildAltar(scene) {
  const wood = std(WOOD, { roughness: 0.45 });
  const gd = std(0xb88342, { metalness: 0.55, roughness: 0.42, envMapIntensity: 0.8 });

  // Bệ nhiều tầng
  mk(new THREE.BoxGeometry(50, 1.0, 26), std(0x39251d), [0, 0.5, -39], scene);
  mk(new THREE.BoxGeometry(46, 1.0, 23), wood, [0, 1.5, -40.5], scene);
  mk(new THREE.BoxGeometry(46.2, 0.14, 23.2), gd, [0, 2.0, -40.5], scene);
  mk(new THREE.BoxGeometry(50.2, 0.12, 26.2), gd, [0, 1.02, -39], scene);

  // Tượng Phật (cao gấp ~5 lần bản cũ) + hộ pháp
  const { group: buddha, glow } = buildBuddha();
  buddha.scale.setScalar(4);
  buddha.position.set(0, DAIS_Y, BZ);
  markCast(buddha);
  scene.add(buddha);
  const wallGlow = glowPlane(40, 36, "255,205,110", 0.5);
  wallGlow.position.set(0, 20, HALL.zBack + 0.4);
  scene.add(wallGlow);

  // Ánh sáng bàn thờ
  const altarLight = new THREE.PointLight(0xffb85a, 700, 90, 2);
  altarLight.position.set(0, 14, -30);
  scene.add(altarLight);
  const spot = new THREE.SpotLight(0xffe2a8, 2400, 90, 0.5, 1, 2);
  spot.position.set(0, 30, -24);
  spot.target.position.set(0, 14, BZ);
  scene.add(spot, spot.target);

  // Bàn thờ trước tượng
  mk(new THREE.BoxGeometry(22, 2.0, 3.2), wood, [0, 3.0, -31], scene);
  mk(new THREE.BoxGeometry(22.6, 0.22, 3.6), gd, [0, 4.05, -31], scene);
  const frontTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#39251d";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b88342";
    g.lineWidth = 2;
    for (let x = 0; x < w; x += 32) {
      g.beginPath();
      g.arc(x + 16, 32, 11, 0, 6.3);
      g.moveTo(x + 5, 32);
      g.quadraticCurveTo(x + 16, 8, x + 27, 32);
      g.stroke();
    }
  }, [4, 1]);
  mk(new THREE.PlaneGeometry(21.6, 1.7), new THREE.MeshBasicMaterial({ map: frontTex }), [0, 3.0, -29.38], scene);

  // Đồ cúng trên bàn thờ (nhóm phóng to)
  const off = new THREE.Group();
  off.position.set(0, 4.16, -31);
  off.scale.setScalar(2.3);
  scene.add(off);
  const bronze = std(0x4a3a24, { metalness: 0.7, roughness: 0.35, envMapIntensity: 1 });
  mk(new THREE.CylinderGeometry(0.46, 0.34, 0.45, 20), bronze, [0, 0.24, 0], off);
  mk(new THREE.TorusGeometry(0.42, 0.045, 8, 20), bronze, [0, 0.46, 0], off).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) mk(new THREE.TorusGeometry(0.1, 0.03, 6, 12), bronze, [0.5 * s, 0.36, 0], off);
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9;
    const st = mk(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 5), std(0x8a2a1a), [Math.cos(a) * 0.16, 0.85, Math.sin(a) * 0.12], off);
    mk(new THREE.SphereGeometry(0.02, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff5a2a }), [st.position.x, 1.24, st.position.z], off);
  }
  const smoke = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false }));
    m.userData.phase = i / 10;
    off.add(m);
    smoke.push(m);
  }
  const flames = [];
  for (const x of [-1.6, -1.15, 1.15, 1.6]) {
    mk(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 10), std(0xf6e7c8), [x, 0.22, 0], off);
    const fl = mk(new THREE.SphereGeometry(0.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffc040 }), [x, 0.54, 0], off);
    fl.scale.set(1, 1.8, 1);
    const gl = glowSprite(0.9, "255,190,90", 0.7);
    gl.position.set(x, 0.56, 0);
    off.add(gl);
    flames.push(fl);
  }
  for (const s of [-1, 1]) {
    const x = 2.7 * s;
    const orange = std(0xf08a1c, { roughness: 0.55 });
    const apple = std(0xd8442a, { roughness: 0.5 });
    [[-0.28, 0], [0, 0], [0.28, 0], [-0.14, 0.24], [0.14, 0.24], [0, 0.46]].forEach(([dx, dy], i) =>
      mk(new THREE.SphereGeometry(0.17, 12, 10), i % 3 === 2 ? apple : orange, [x + dx, 0.26 + dy, 0], off)
    );
    mk(new THREE.CylinderGeometry(0.4, 0.3, 0.12, 14), gd, [x, 0.06, 0], off);
    vase(off, 3.9 * s, 0);
  }

  // Câu đối hai bên
  for (const [x, lines] of [[-26, ["Từ", "Bi", "Hỷ", "Xả"]], [26, ["Trí", "Tuệ", "Giải", "Thoát"]]]) {
    const m = mk(new THREE.PlaneGeometry(5.2, 24.4), new THREE.MeshBasicMaterial({ map: bannerTex(lines) }), [x, 23, HALL.zBack + 0.08], scene);
    mk(new THREE.BoxGeometry(5.8, 0.4, 0.5), gd, [x, 35.4, HALL.zBack + 0.1], scene);
    m.renderOrder = 1;
  }

  // Chuông đồng + khung gỗ
  const bell = new THREE.Group();
  const frame = std(WOOD, { roughness: 0.5 });
  for (const dx of [-1.2, 1.2]) mk(new THREE.BoxGeometry(0.28, 3.8, 0.3), frame, [dx, 1.9, 0], bell);
  mk(new THREE.BoxGeometry(3.0, 0.3, 0.36), frame, [0, 3.85, 0], bell);
  mk(new THREE.BoxGeometry(3.2, 0.06, 0.4), gd, [0, 4.03, 0], bell);
  const bp = [[0.1, 0], [0.55, 0], [0.62, 0.2], [0.5, 1.0], [0.38, 1.35], [0.15, 1.45]].map(([r, y]) => new THREE.Vector2(r, y));
  mk(new THREE.LatheGeometry(bp, 24), std(0x8a6a28, { metalness: 0.85, roughness: 0.4, envMapIntensity: 1 }), [0, 1.9, 0], bell);
  mk(new THREE.TorusGeometry(0.12, 0.03, 6, 12), bronze, [0, 3.45, 0], bell);
  bell.position.set(28, 0, -28);
  bell.rotation.y = -0.25;
  bell.scale.setScalar(3.4);
  scene.add(bell);

  for (const x of [-12, -17, 12, 17, -27, 27]) bonsai(scene, x, -27.5, 3);
  bonsai(scene, -31, -8, 3);
  bonsai(scene, 31, -8, 3);

  return (t) => {
    flames.forEach((f, i) => {
      f.scale.y = 1.7 + Math.sin(t * 14 + i * 2) * 0.35;
    });
    altarLight.intensity = 680 + Math.sin(t * 9) * 40;
    glow.material.opacity = 0.7 + Math.sin(t * 1.5) * 0.06;
    smoke.forEach((m) => {
      const k = (t * 0.16 + m.userData.phase) % 1;
      m.position.set(Math.sin(k * 7 + m.userData.phase * 9) * 0.2, 1.3 + k * 2.4, 0);
      m.material.opacity = 0.3 * (1 - k);
      m.scale.setScalar(1 + k * 2.8);
    });
  };
}

