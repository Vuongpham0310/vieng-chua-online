import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MAT_COUNT, matPos } from "./shared.js";
import { std, canvasTex, mergeStatic } from "./three/util3d.js";
import { buildHall } from "./three/hall.js";
import { buildAltar } from "./three/altar.js";

// Một phần của thế giới dựng bằng hàm Three.js thuần, gắn vào cảnh R3F qua <primitive>.
function Part({ build }) {
  const part = useMemo(() => {
    const group = new THREE.Group();
    const update = build(group);
    return { group, update };
  }, [build]);
  useFrame(({ clock }) => part.update && part.update(clock.elapsedTime));
  return <primitive object={part.group} />;
}

// Hình chữ nhật bo góc
function roundedRect(w, h, r) {
  const x = -w / 2, y = -h / 2;
  const sh = new THREE.Shape();
  sh.moveTo(x + r, y);
  sh.lineTo(x + w - r, y);
  sh.quadraticCurveTo(x + w, y, x + w, y + r);
  sh.lineTo(x + w, y + h - r);
  sh.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  sh.lineTo(x + r, y + h);
  sh.quadraticCurveTo(x, y + h, x, y + h - r);
  sh.lineTo(x, y + r);
  sh.quadraticCurveTo(x, y, x + r, y);
  return sh;
}

// Vải bọc viền nâu sẫm, đan chéo
function clothTex() {
  return canvasTex(64, 64, (c, w, h) => {
    c.fillStyle = "#4a2618";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 4) {
      c.fillStyle = i % 8 ? "rgba(20,8,4,0.35)" : "rgba(130,80,50,0.28)";
      c.fillRect(i, 0, 2, h);
      c.fillRect(0, i, w, 2);
    }
  }, [3, 3]);
}

// Cói đan thành từng dải bện dọc, màu vàng rơm
function strawTex() {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#c98f48";
    c.fillRect(0, 0, w, h);
    const colW = 16;
    for (let x = 0; x < w; x += colW) {
      for (let y = 0; y < h; y += 8) {
        const k = ((x / colW + y / 8) % 2) * 0.12;
        const g = c.createLinearGradient(x, 0, x + colW, 0);
        g.addColorStop(0, "rgba(122,74,28," + (0.55 + k) + ")");
        g.addColorStop(0.3, "rgba(236,190,112,1)");
        g.addColorStop(0.7, "rgba(222,172,96,1)");
        g.addColorStop(1, "rgba(122,74,28," + (0.55 + k) + ")");
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(x + colW / 2, y + 4, colW / 2 - 0.5, 4.6, 0, 0, 6.3);
        c.fill();
      }
    }
  }, [1.5, 1.5]);
}

// Thảm ngồi thiền: viền vải nâu bo tròn dày, mặt cói đan, đường chỉ khâu
function Mats() {
  const group = useMemo(() => {
    const g = new THREE.Group();
    const edge = new THREE.ExtrudeGeometry(roundedRect(2.4, 2.4, 0.34), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.06, bevelSegments: 4, curveSegments: 6 });
    edge.rotateX(-Math.PI / 2);
    edge.translate(0, 0.05, 0);
    const top = new THREE.ExtrudeGeometry(roundedRect(1.9, 1.9, 0.14), { depth: 0.02, bevelEnabled: false, curveSegments: 6 });
    top.rotateX(-Math.PI / 2);
    top.translate(0, 0.148, 0);
    const stitch = new THREE.ExtrudeGeometry(
      (() => {
        const o = roundedRect(1.98, 1.98, 0.18);
        o.holes.push(roundedRect(1.94, 1.94, 0.16));
        return o;
      })(),
      { depth: 0.004, bevelEnabled: false, curveSegments: 6 }
    );
    stitch.rotateX(-Math.PI / 2);
    stitch.translate(0, 0.162, 0);
    const mats = [
      [edge, std(0xffffff, { map: clothTex(), roughness: 0.95 })],
      [top, std(0xffffff, { map: strawTex(), roughness: 0.9 })],
      [stitch, std(0xb5642b, { roughness: 0.8 })],
    ];
    for (let i = 0; i < MAT_COUNT; i++) {
      const p = matPos(i);
      for (const [geo, mat] of mats) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(p.x, 0, p.z);
        g.add(m);
      }
    }
    return g;
  }, []);
  return <primitive object={group} />;
}

// Ánh sáng phản chiếu cho kim loại vàng
function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    return () => {
      scene.environment = null;
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Optimize({ target }) {
  useEffect(() => {
    if (target.current) mergeStatic(target.current);
  }, [target]);
  return null;
}

export default function World() {
  const world = useRef();
  return (
    <>
      <color attach="background" args={[0x24110a]} />
      <Env />
      <hemisphereLight args={[0xfff1dc, 0x8a5a3c, 1.0]} />
      <directionalLight
        color={0xffdca8}
        intensity={1.9}
        position={[-40, 75, 40]}
        castShadow
        shadow-mapSize={[3072, 3072]}
        shadow-camera-left={-58}
        shadow-camera-right={58}
        shadow-camera-top={58}
        shadow-camera-bottom={-58}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-radius={3}
      >
        <object3D attach="target" position={[0, 0, -6]} />
      </directionalLight>
      <directionalLight color={0xffc890} intensity={0.45} position={[10, 12, 30]} />
      <group ref={world}>
        <Part build={buildHall} />
        <Part build={buildAltar} />
        <Mats />
      </group>
      <Optimize target={world} />
    </>
  );
}
