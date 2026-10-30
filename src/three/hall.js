import * as THREE from "three";
import { std, gold, canvasTex, mk, glowPlane, markCast } from "./util3d.js";
import { HALL } from "../shared.js";

const WOOD = 0x603424; // cột gỗ tròn, sơn bóng nhẹ
const WALL = 0x563727; // vách gỗ mờ, có vân
const BEAM = 0x39251d; // xà ngang gỗ sẫm
const CARVE = 0xb88342; // hoa văn chạm khắc, vàng đồng cổ
const EDGE = 0x291a17; // viền trang trí, nâu gần đen
const W = HALL.halfW * 2;
const D = HALL.zFront - HALL.zBack;
const ZC = (HALL.zFront + HALL.zBack) / 2;

function marbleTex() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#b7acb0";
    g.fillRect(0, 0, w, h);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = "rgba(" + (rnd() > 0.5 ? "255,255,255" : "70,55,60") + "," + (0.06 + rnd() * 0.12) + ")";
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      let x = rnd() * w, y = rnd() * h;
      g.moveTo(x, y);
      for (let k = 0; k < 5; k++) {
        x += (rnd() - 0.4) * 160;
        y += (rnd() - 0.4) * 160;
        g.quadraticCurveTo(x - 40, y + 30, x, y);
      }
      g.stroke();
    }
    g.strokeStyle = "rgba(60,45,50,0.6)";
    g.lineWidth = 5;
    g.strokeRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.lineWidth = 2;
    g.strokeRect(5, 5, w - 10, h - 10);
  }, [W / 4, D / 4]);
}

function latticeTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#563727";
    g.fillRect(0, 0, w, h);
    // vân gỗ
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = "rgba(" + (rnd() > 0.5 ? "30,18,12" : "120,80,55") + "," + (0.1 + rnd() * 0.12) + ")";
      g.lineWidth = 1 + rnd() * 1.5;
      const x = rnd() * w;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + (rnd() - 0.5) * 24, h * 0.35, x + (rnd() - 0.5) * 24, h * 0.7, x + (rnd() - 0.5) * 12, h);
      g.stroke();
    }
    g.strokeStyle = "#b88342";
    g.lineWidth = 3;
    for (let i = -h; i < w + h; i += 32) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i + h, h);
      g.moveTo(i + h, 0);
      g.lineTo(i, h);
      g.stroke();
    }
    g.fillStyle = "#b88342";
    for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) {
      g.beginPath();
      g.arc(x, y, 3, 0, 6.3);
      g.fill();
    }
  }, [W / 5, 14]);
}

function friezeTex() {
  return canvasTex(512, 64, (g, w, h) => {
    g.fillStyle = "#39251d";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b88342";
    g.lineWidth = 2.5;
    for (let x = 0; x < w; x += 64) {
      g.beginPath();
      g.arc(x + 32, 32, 18, 0, 6.3);
      g.moveTo(x + 14, 32);
      g.bezierCurveTo(x + 24, 6, x + 40, 58, x + 50, 32);
      g.stroke();
    }
    g.strokeRect(2, 2, w - 4, h - 4);
  }, [W / 9, 1]);
}

function column(scene, x, z, h) {
  const wood = std(WOOD, { roughness: 0.3, metalness: 0.05 });
  const g = new THREE.Group();
  mk(new THREE.CylinderGeometry(1.45, 1.6, h, 32), wood, [0, h / 2 + 1.5, 0], g);
  const stone = std(0xb7b0aa, { roughness: 0.55 });
  mk(new THREE.CylinderGeometry(2.7, 3.0, 0.7, 32), stone, [0, 0.35, 0], g);
  mk(new THREE.CylinderGeometry(2.1, 2.45, 1.5, 32), stone, [0, 1.35, 0], g);
  mk(new THREE.TorusGeometry(2.1, 0.22, 10, 32), stone, [0, 2.1, 0], g).rotation.x = Math.PI / 2;
  const gd = std(CARVE, { metalness: 0.55, roughness: 0.42, envMapIntensity: 0.8 });
  for (const y of [3.6, 7.5, h * 0.5, h + 1.4]) mk(new THREE.CylinderGeometry(1.5, 1.5, 0.28, 32), gd, [0, y, 0], g);
  // đấu củng trên đầu cột
  const br = std(BEAM, { roughness: 0.55 });
  [[3.4, 0.7], [5.0, 0.7], [6.6, 0.7]].forEach(([s, t], i) => {
    mk(new THREE.BoxGeometry(s, t, s), br, [0, h + 2.0 + i * 0.75, 0], g);
    mk(new THREE.BoxGeometry(s + 0.1, 0.12, s + 0.1), gd, [0, h + 2.4 + i * 0.75, 0], g);
  });
  g.position.set(x, 0, z);
  markCast(g);
  scene.add(g);
}

export function buildHall(scene) {
  const hw = HALL.halfW;
  // Sàn đá bóng
  const floor = mk(new THREE.PlaneGeometry(W, D), std(0xffffff, { map: marbleTex(), roughness: 0.2, metalness: 0.12, envMapIntensity: 0.45 }), [0, 0, ZC], scene);
  floor.rotation.x = -Math.PI / 2;

  // Vệt nắng trên sàn
  const patches = [[-20, 20, 9, 24, 0.2], [-6, -6, 8, 20, 0.1], [14, 6, 9, 26, -0.15], [24, -14, 7, 18, 0.1], [-24, -22, 7, 16, 0.05]];
  for (const [x, z, w, h, r] of patches) {
    const p = glowPlane(w, h, "255,225,160", 0.4);
    p.rotation.x = -Math.PI / 2;
    p.rotation.z = r;
    p.position.set(x, 0.05, z);
    scene.add(p);
  }

  // Tường sau: lưới gỗ + tấm đá ốp sau hào quang
  mk(new THREE.PlaneGeometry(W, HALL.ceil), std(0xffffff, { map: latticeTex(), roughness: 0.85 }), [0, HALL.ceil / 2, HALL.zBack - 0.1], scene);
  const panelTex = canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, w * 0.7);
    r.addColorStop(0, "#fff0c8");
    r.addColorStop(0.5, "#e8d5b0");
    r.addColorStop(1, "#bfa982");
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(120,90,60,0.18)";
    g.lineWidth = 2;
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.moveTo(Math.random() * w, 0);
      g.bezierCurveTo(Math.random() * w, h * 0.3, Math.random() * w, h * 0.6, Math.random() * w, h);
      g.stroke();
    }
  });
  mk(new THREE.PlaneGeometry(40, 44), new THREE.MeshBasicMaterial({ map: panelTex }), [0, 23, HALL.zBack + 0.02], scene);
  const trim = std(EDGE, { roughness: 0.5 });
  const pz = HALL.zBack + 0.08;
  mk(new THREE.BoxGeometry(41, 0.5, 0.4), trim, [0, 45.2, pz], scene);
  mk(new THREE.BoxGeometry(41, 0.5, 0.4), trim, [0, 0.9, pz], scene);
  for (const s of [-1, 1]) mk(new THREE.BoxGeometry(0.5, 44.3, 0.4), trim, [20.3 * s, 23, pz], scene);
  mk(new THREE.PlaneGeometry(W, 3.6), new THREE.MeshBasicMaterial({ map: friezeTex() }), [0, 52, HALL.zBack + 0.03], scene);

  // Trần + xà (cao 69)
  mk(new THREE.PlaneGeometry(W + 4, D + 4), std(BEAM), [0, HALL.ceil, ZC], scene).rotation.x = Math.PI / 2;
  const beam = std(BEAM, { roughness: 0.55 });
  for (let z = HALL.zBack + 2; z <= HALL.zFront; z += 11) {
    mk(new THREE.BoxGeometry(W + 1, 2.4, 1.6), beam, [0, HALL.ceil - 2.4, z], scene);
    mk(new THREE.BoxGeometry(W + 1, 0.2, 1.7), trim, [0, HALL.ceil - 3.7, z], scene);
  }
  for (const x of [-hw, -hw / 2, 0, hw / 2, hw]) mk(new THREE.BoxGeometry(1.8, 2.2, D + 2), beam, [x, HALL.ceil - 4.4, ZC], scene);
  // xà ngang tầng giữa để treo đèn
  for (const z of [-40, -22, -4, 14, 30]) mk(new THREE.BoxGeometry(W, 1.2, 1.0), beam, [0, 30, z], scene);

  // Cột: hai hàng bên + hai cột gần bàn thờ
  const colH = HALL.ceil - 6;
  const cz = [-44, -30, -16, -2, 12, 26];
  for (const x of [-hw, hw]) for (const z of cz) column(scene, x, z, colH);
  for (const x of [-24, 24]) column(scene, x, -27, colH);

  // Tường kín hai bên và phía trước (lưới gỗ + diềm hoa văn)
  const wallTex = (len) => {
    const t = latticeTex();
    t.repeat.set(len / 5, 14);
    return std(0xffffff, { map: t, roughness: 0.85 });
  };
  for (const s of [-1, 1]) {
    const w = mk(new THREE.PlaneGeometry(D, HALL.ceil), wallTex(D), [s * (hw + 1.8), HALL.ceil / 2, ZC], scene);
    w.rotation.y = -s * Math.PI / 2;
    const f = mk(new THREE.PlaneGeometry(D, 3.6), new THREE.MeshBasicMaterial({ map: friezeTex() }), [s * (hw + 1.75), 52, ZC], scene);
    f.rotation.y = -s * Math.PI / 2;
  }
  const front = mk(new THREE.PlaneGeometry(W + 4, HALL.ceil), wallTex(W + 4), [0, HALL.ceil / 2, HALL.zFront + 1.8], scene);
  front.rotation.y = Math.PI;

  // Đèn lồng đỏ treo từ các xà ngang
  const lanterns = [];
  const red = std(0xd02a1c, { emissive: 0xa01808, emissiveIntensity: 0.9, roughness: 0.5 });
  const lx = [-26, -13, 0, 13, 26];
  for (const z of [-22, -4, 14, 30]) for (const x of lx) {
    const g = new THREE.Group();
    mk(new THREE.CylinderGeometry(0.03, 0.03, 5.5, 4), std(0x222222), [0, 3.4, 0], g);
    mk(new THREE.SphereGeometry(1.15, 20, 14), red, [0, 0, 0], g).scale.set(1, 1.2, 1);
    mk(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 14), gold(), [0, 1.42, 0], g);
    mk(new THREE.CylinderGeometry(0.6, 0.6, 0.25, 14), gold(), [0, -1.42, 0], g);
    mk(new THREE.CylinderGeometry(0.04, 0.2, 1.4, 6), std(0xe8b83a), [0, -2.2, 0], g);
    g.position.set(x, 21.5, z);
    g.userData.noMerge = true;
    scene.add(g);
    lanterns.push(g);
  }

  return (t) => {
    lanterns.forEach((l, i) => {
      l.rotation.z = Math.sin(t * 1.1 + i) * 0.04;
      l.rotation.x = Math.cos(t * 0.9 + i) * 0.025;
    });
  };
}
