import * as THREE from "three";
import { LEVELS } from "../shared.js";
import { canvasTex } from "./util3d.js";

// Chỉ có hai màu áo, theo ảnh tham chiếu: nâu và xanh.
export const ROBE_BROWN = 0x7a4a2e;
export const ROBE_BLUE = 0x4a6f9a;
export const pickRobe = (seed) => ([...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0) % 2 ? ROBE_BLUE : ROBE_BROWN);

const SKIN = 0xf2c398;

function labelSprite(text, rank) {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = rank ? 104 : 72;
  const g = c.getContext("2d");
  g.font = "600 32px 'Be Vietnam Pro', 'Segoe UI', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const w = Math.min(308, g.measureText(text).width + 36);
  g.fillStyle = "rgba(34,16,9,0.78)";
  g.beginPath();
  g.roundRect(160 - w / 2, 8, w, 54, 27);
  g.fill();
  g.strokeStyle = "rgba(232,191,98,0.7)";
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = "#fff3d6";
  g.fillText(text, 160, 36, 280);
  if (rank) {
    g.font = "600 24px 'Be Vietnam Pro', 'Segoe UI', sans-serif";
    const rw = g.measureText(rank).width + 28;
    g.fillStyle = "rgba(34,16,9,0.78)";
    g.beginPath();
    g.roundRect(160 - rw / 2, 68, rw, 32, 16);
    g.fill();
    g.fillStyle = "#f3d98c";
    g.fillText(rank, 160, 85, 280);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sp.scale.set(2.2, rank ? 0.72 : 0.5, 1);
  sp.renderOrder = 10;
  return sp;
}

const mesh = (geo, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
};

const P = (pts) => pts.map(([r, y]) => new THREE.Vector2(r, y));

// Cà sa: các ô vải ghép (patchwork) ngăn bởi đường chỉ
function patchTex(color, seam) {
  return canvasTex(128, 128, (g, w, h) => {
    const base = new THREE.Color(color);
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 2; x++) {
        g.fillStyle = "#" + base.clone().multiplyScalar(0.9 + ((x + y) % 2) * 0.12).getHexString();
        g.fillRect(x * 64, y * 43, 64, 43);
      }
    g.strokeStyle = seam;
    g.lineWidth = 4;
    for (let x = 0; x <= w; x += 64) g.strokeRect(x - 2, -2, 4, h + 4);
    for (let y = 0; y <= h; y += 43) g.strokeRect(-2, y - 2, w + 4, 4);
  }, [6, 3]);
}
const cloth2 = (color, seam, patch) => new THREE.MeshStandardMaterial(patch ? { map: patchTex(color, seam), roughness: 1, envMapIntensity: 0.15 } : { color, roughness: 1, envMapIntensity: 0.15 });
const FULL = [[0.64, 0.34], [0.62, 0.42], [0.57, 0.7], [0.49, 0.95], [0.45, 1.15], [0.47, 1.3], [0.38, 1.42], [0.31, 1.455]];
const OUTER = [
  null,
  { pts: [[0.55, 0.6], [0.52, 0.78], [0.49, 0.95], [0.45, 1.15], [0.47, 1.3], [0.38, 1.42], [0.31, 1.455]], mat: cloth2(0x8d8a84, "", false), trim: new THREE.MeshStandardMaterial({ color: 0x5a5854, roughness: 1 }) },
  { pts: FULL, mat: cloth2(0x9b6a2e, "#5a3a14", true), trim: new THREE.MeshStandardMaterial({ color: 0x5a3a14, roughness: 1 }) },
  { pts: FULL, mat: cloth2(0xd9a21b, "#8a5a08", true), trim: new THREE.MeshStandardMaterial({ color: 0xf3d98c, roughness: 0.6, metalness: 0.4 }) },
  { pts: FULL, mat: cloth2(0x9b1c24, "#e0b050", true), trim: new THREE.MeshStandardMaterial({ color: 0xe8bf62, roughness: 0.5, metalness: 0.6 }) },
  { pts: FULL, mat: cloth2(0xe6b422, "#b01820", true), trim: new THREE.MeshStandardMaterial({ color: 0xfff0a0, roughness: 0.4, metalness: 0.7 }), cape: new THREE.MeshStandardMaterial({ color: 0xb01820, roughness: 0.9 }) },
];

// Chú tiểu chibi theo ảnh tham chiếu: đầu tròn to, trán bóng, tai nhỏ, áo cổ chéo vạt,
// tay áo rộng, đai lưng, quần ống rộng, giày xám đế kem.
// Mặt quay về -z (hướng bàn thờ), camera nhìn từ phía sau.
export function createMonk({ name = "", robe = ROBE_BROWN, label = true, level = 0 } = {}) {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  rig.rotation.order = "YXZ";
  root.add(rig);
  const upper = new THREE.Group();
  rig.add(upper);

  const rc = new THREE.Color(robe);
  const cloth = new THREE.MeshStandardMaterial({ color: robe, roughness: 1, envMapIntensity: 0.15 });
  const clothD = new THREE.MeshStandardMaterial({ color: rc.clone().multiplyScalar(0.8), roughness: 1, envMapIntensity: 0.15 });
  const beltMat = new THREE.MeshStandardMaterial({ color: rc.clone().multiplyScalar(0.6), roughness: 0.9, envMapIntensity: 0.15 });
  const pants = new THREE.MeshStandardMaterial({ color: rc.clone().multiplyScalar(0.9), roughness: 1, envMapIntensity: 0.15 });
  const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6, envMapIntensity: 0.25 });
  const ink = new THREE.MeshBasicMaterial({ color: 0x14100e });
  const brow = new THREE.MeshBasicMaterial({ color: 0x5a3320 });
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blush = new THREE.MeshBasicMaterial({ color: 0xf29a88, transparent: true, opacity: 0.55 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x38383c, roughness: 0.8, envMapIntensity: 0.15 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xdccfb0, roughness: 0.9, envMapIntensity: 0.15 });

  // Áo dài: bầu xuống như chiếc chuông, hơi dẹt theo chiều sâu
  const body = mesh(new THREE.LatheGeometry(P([[0.0, 0.36], [0.56, 0.36], [0.58, 0.42], [0.52, 0.7], [0.44, 0.95], [0.4, 1.15], [0.42, 1.3], [0.34, 1.42], [0.18, 1.46], [0.0, 1.46]]), 36), cloth);
  body.scale.z = 0.8;
  upper.add(body);
  // Đai lưng
  const belt = mesh(new THREE.CylinderGeometry(0.478, 0.5, 0.2, 40), beltMat, 0, 0.86, 0);
  belt.scale.z = 0.8;
  upper.add(belt);
  // Cổ áo chéo vạt
  for (const s of [-1, 1]) {
    const lap = mesh(new THREE.BoxGeometry(0.075, 0.66, 0.035), clothD, 0.095 * s, 1.1, -0.325);
    lap.rotation.z = 0.27 * s;
    upper.add(lap);
  }
  const vee = mesh(new THREE.CircleGeometry(0.105, 3), skin, 0, 1.36, -0.295);
  vee.rotation.z = Math.PI / 2 * 3;
  upper.add(vee);
  const collar = mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 24), clothD, 0, 1.43, 0);
  collar.rotation.x = Math.PI / 2;
  collar.scale.set(1, 0.85, 1);
  upper.add(collar);

  // Đầu
  const head = new THREE.Group();
  head.position.y = 1.88;
  upper.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.54, 40, 30), skin);
  skull.scale.set(1.02, 0.96, 0.97);
  head.add(skull);
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.115, 14, 12), skin, 0.545 * s, -0.04, 0.02);
    ear.scale.set(0.5, 1, 0.8);
    head.add(ear);
    const eye = mesh(new THREE.SphereGeometry(0.062, 14, 12), ink, 0.2 * s, -0.05, -0.47);
    eye.scale.set(0.78, 1.2, 0.5);
    head.add(eye);
    const spark = mesh(new THREE.SphereGeometry(0.017, 8, 6), white, 0.215 * s, -0.01, -0.5);
    head.add(spark);
    const cheek = mesh(new THREE.SphereGeometry(0.085, 12, 10), blush, 0.32 * s, -0.19, -0.4);
    cheek.scale.set(1, 0.65, 0.35);
    head.add(cheek);
    const br = mesh(new THREE.TorusGeometry(0.085, 0.0095, 4, 14, Math.PI * 0.55), brow, 0.21 * s, 0.12, -0.46);
    br.rotation.z = Math.PI * 0.225 + (s < 0 ? 0 : 0);
    head.add(br);
  }
  const smile = mesh(new THREE.TorusGeometry(0.07, 0.011, 4, 14, Math.PI * 0.85), brow, 0, -0.2, -0.485);
  smile.rotation.z = Math.PI * 1.075;
  head.add(smile);

  // Tay áo rộng (xoay quanh vai)
  const arms = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(0.45 * s, 1.3, 0);
    pivot.add(mesh(new THREE.SphereGeometry(0.17, 16, 12), cloth, 0, 0, 0));
    pivot.add(mesh(new THREE.CylinderGeometry(0.16, 0.29, 0.72, 20), cloth, 0, -0.38, 0));
    const hem = mesh(new THREE.TorusGeometry(0.285, 0.03, 8, 20), clothD, 0, -0.74, 0);
    hem.rotation.x = Math.PI / 2;
    pivot.add(hem);
    pivot.add(mesh(new THREE.SphereGeometry(0.1, 14, 12), skin, 0, -0.78, 0));
    upper.add(pivot);
    arms.push({ pivot, s });
  }

  // Chân + giày
  const legs = new THREE.Group();
  const shoes = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.x = 0.2 * s;
    leg.add(mesh(new THREE.CylinderGeometry(0.19, 0.205, 0.42, 16), pants, 0, 0.3, 0));
    const shoe = mesh(new THREE.SphereGeometry(0.2, 16, 12), shoeMat, 0, 0.1, -0.08);
    shoe.scale.set(0.95, 0.55, 1.45);
    leg.add(shoe);
    const sole = mesh(new THREE.CylinderGeometry(0.205, 0.215, 0.05, 16), soleMat, 0, 0.03, -0.08);
    sole.scale.set(0.95, 1, 1.5);
    leg.add(sole);
    legs.add(leg);
    shoes.push(leg);
  }
  rig.add(legs);

  // Ngồi kiết già: vạt áo trải trên thảm
  const lap = mesh(new THREE.SphereGeometry(0.62, 28, 16), cloth, 0, 0.19, -0.03);
  lap.scale.set(1.3, 0.4, 1.05);
  rig.add(lap);

  // Áo khoác ngoài theo cấp độ (bắt buộc mặc), vẽ đè lên áo nền
  const outer = new THREE.Group();
  upper.add(outer);
  let lv = 0;
  function setLevel(n) {
    lv = n;
    outer.children.forEach((c) => c.geometry.dispose());
    outer.clear();
    const o = OUTER[n];
    lap.material = o ? o.mat : cloth;
    if (o) {
      const shell = mesh(new THREE.LatheGeometry(P(o.pts), 40), o.mat);
      shell.scale.z = 0.8;
      outer.add(shell);
      const hem = mesh(new THREE.TorusGeometry(o.pts[0][0], 0.028, 8, 40), o.trim, 0, o.pts[0][1], 0);
      hem.rotation.x = Math.PI / 2;
      hem.scale.y = 0.8;
      outer.add(hem);
      const neck = mesh(new THREE.TorusGeometry(0.31, 0.03, 8, 28), o.trim, 0, 1.455, 0);
      neck.rotation.x = Math.PI / 2;
      neck.scale.y = 0.8;
      outer.add(neck);
      if (o.cape) {
        const cape = mesh(new THREE.LatheGeometry(P([[0.6, 0.98], [0.56, 1.15], [0.54, 1.3], [0.42, 1.42], [0.34, 1.455]]), 40), o.cape);
        cape.scale.z = 0.8;
        outer.add(cape);
      }
    }
    if (label && name) {
      if (tag) {
        root.remove(tag);
        tag.material.map.dispose();
        tag.material.dispose();
      }
      tag = labelSprite(name, n > 0 ? LEVELS[n].name : "");
      root.add(tag);
      placeTag();
    }
  }
  const placeTag = () => tag && (tag.position.y = (state === "sitting" || state === "bowing" ? 2.7 : state === "spinning" ? 2.7 : 3.0) + (lv > 0 ? 0.12 : 0));

  let tag = null;

  let state = "standing";
  let t = Math.random() * 10;
  let bowT = 0;
  let spinA = 0;
  const SIT_Y = -0.32;

  function setState(s) {
    state = s;
    const sitting = s === "sitting" || s === "bowing";
    legs.visible = !sitting;
    lap.visible = sitting;
    upper.position.y = sitting ? SIT_Y : 0;
    upper.rotation.set(0, 0, 0);
    placeTag();
    for (const a of arms) {
      // Ngồi: chắp tay trước ngực. Đứng: tay buông.
      a.pivot.rotation.set(sitting ? 1.2 : 0, 0, sitting ? -0.45 * a.s : 0.1 * a.s);
    }
    // Xoay đầu kiểu breakdance: trồng chuối trên đầu, quay quanh trục dọc
    rig.rotation.set(0, 0, 0);
    rig.position.y = sitting ? 0.14 : 0; // ngồi trên thảm dày
    shoes.forEach((l) => (l.rotation.z = 0));
    if (s === "spinning") {
      rig.rotation.x = Math.PI;
      rig.position.y = 2.42;
      for (const a of arms) a.pivot.rotation.set(0, 0, 1.3 * a.s);
      placeTag();
    }
    if (s === "bowing") bowT = 0;
  }

  function update(dt, moving) {
    t += dt;
    if (state === "spinning") {
      spinA += dt * 13;
      rig.rotation.y = spinA;
      rig.position.y = 2.42 + Math.abs(Math.sin(t * 6)) * 0.03;
      shoes[0].rotation.z = 0.55 + Math.sin(t * 9) * 0.3;
      shoes[1].rotation.z = -(0.55 + Math.sin(t * 9 + 1.2) * 0.3);
      arms[0].pivot.rotation.z = -1.3 + Math.sin(t * 9) * 0.15;
      arms[1].pivot.rotation.z = 1.3 - Math.sin(t * 9 + 1) * 0.15;
      return;
    }
    if (state === "standing") {
      const sw = Math.sin(t * 10);
      upper.position.y = moving ? Math.abs(sw) * 0.06 : Math.sin(t * 2) * 0.012;
      upper.rotation.z = moving ? sw * 0.04 : 0;
      upper.rotation.x = 0;
      shoes[0].position.y = moving ? Math.max(0, sw) * 0.1 : 0;
      shoes[1].position.y = moving ? Math.max(0, -sw) * 0.1 : 0;
      arms[0].pivot.rotation.x = moving ? sw * 0.4 : 0;
      arms[1].pivot.rotation.x = moving ? -sw * 0.4 : 0;
    } else if (state === "sitting") {
      upper.rotation.x = 0;
      upper.rotation.z = 0;
      upper.position.y = SIT_Y + Math.sin(t * 1.3) * 0.015;
    } else {
      bowT += dt;
      const k = Math.sin(Math.min(bowT / 2.4, 1) * Math.PI);
      upper.rotation.x = -k * 0.8;
      upper.position.y = SIT_Y - k * 0.05;
    }
  }

  setState("standing");
  setLevel(level);
  return { group: root, setState, setLevel, update, get state() { return state; } };
}
