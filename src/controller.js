import * as THREE from "three";
import { createMonk, pickRobe, ROBE_BROWN, ROBE_BLUE } from "./three/monk.js";
import { shadowify } from "./three/util3d.js";
import { initAudio, startChant, stopChant } from "./audio.js";
import { MAT_COUNT, MASTER_POS, ROOM, SPAWN_Z, activeNpcs, matPos } from "./shared.js";
import { store } from "./store.js";

const IDLE_MS = 5 * 60 * 1000; // ẩn tab quá 5 phút thì ngừng gửi
const SPEED = 9; // chính điện rộng gấp nhiều lần nên đi nhanh hơn

// Điều khiển trò chơi: nhân vật, NPC, mạng, camera. Chạy trong vòng lặp của R3F.
export function createController(scene) {
  const id = (() => {
    try {
      let v = sessionStorage.getItem("vc_id");
      if (!v) {
        v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
        sessionStorage.setItem("vc_id", v);
      }
      return v;
    } catch {
      return Math.random().toString(36).slice(2, 14);
    }
  })();

  let serverOffset = 0;
  const serverNow = () => Date.now() + serverOffset;
  const robeOf = (c) => (c === "blue" ? ROBE_BLUE : ROBE_BROWN);
  const me = { name: "Phật tử", robe: "brown", x: 0, z: SPAWN_Z, state: "standing", mat: null, monk: null };
  let inGame = false;
  let idle = false;
  let npcList = activeNpcs(1).mats;
  const others = new Map();
  const npcs = new Map();
  const standers = new Map();
  let pushTimer = 0;
  let idleTimer = 0;
  let toastTimer = 0;
  let nearMat = -1;
  const keys = new Set();
  let disposed = false;

  // Sư thầy ở phía trước hàng thảm đầu
  const master = createMonk({ name: "Sư thầy", robe: ROBE_BROWN });
  master.group.position.set(MASTER_POS.x, 0, MASTER_POS.z);
  master.setState("sitting");
  scene.add(master.group);
  shadowify(master.group);
  const moBox = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshStandardMaterial({ color: 0x8a4a1c }));
  moBox.scale.set(1.2, 0.8, 1);
  moBox.position.set(MASTER_POS.x, 0.26, MASTER_POS.z - 0.95);
  moBox.castShadow = true;
  scene.add(moBox);

  const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.4, 48), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.07;
  ring.visible = false;
  scene.add(ring);

  const add = (monk) => {
    scene.add(monk.group);
    shadowify(monk.group);
  };

  // ---------- Mạng ----------
  async function send(payload) {
    try {
      const r = await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  function push() {
    if (!inGame || idle) return;
    send({ id, name: me.name, robe: me.robe, x: me.x, z: me.z, state: me.state, mat: me.mat }).then(onResponse);
  }

  function onResponse(r) {
    if (!r || idle || disposed) return;
    serverOffset = r.now - Date.now();
    if (r.rejected && me.state !== "standing" && me.state !== "spinning") {
      standUp(false);
      toast("Thảm này vừa có người ngồi");
    }
    if (JSON.stringify(r.npc) !== JSON.stringify(npcList)) npcList = r.npc;
    syncNpcs();
    syncStanding(r.count ?? 1);
    applyOthers(r.players || []);
    store.set({ players: [me.name + " (bạn)", ...[...others.values()].map((o) => o.name)], npcCount: npcList.length + standers.size });
  }

  function applyOthers(list) {
    const seen = new Set();
    for (const p of list) {
      seen.add(p.id);
      let o = others.get(p.id);
      if (!o) {
        const monk = createMonk({ name: p.name, robe: robeOf(p.robe) });
        monk.group.position.set(p.x, 0, p.z);
        add(monk);
        o = { monk, tx: p.x, tz: p.z, state: "standing", mat: null, name: p.name };
        others.set(p.id, o);
      }
      o.tx = p.x;
      o.tz = p.z;
      o.mat = p.mat;
      o.name = p.name;
      if (o.state !== p.state) {
        o.state = p.state;
        o.monk.setState(p.state);
      }
    }
    for (const [pid, o] of others) {
      if (!seen.has(pid)) {
        scene.remove(o.monk.group);
        others.delete(pid);
      }
    }
  }

  function syncNpcs() {
    for (const [mat, monk] of npcs) {
      if (!npcList.includes(mat)) {
        scene.remove(monk.group);
        npcs.delete(mat);
      }
    }
    for (const mat of npcList) {
      if (npcs.has(mat)) continue;
      const p = matPos(mat);
      const monk = createMonk({ robe: pickRobe("npc" + mat), label: false });
      monk.group.position.set(p.x, 0, p.z);
      monk.setState("sitting");
      add(monk);
      npcs.set(mat, monk);
    }
  }

  // NPC đứng yên ở các vị trí cố định; bớt dần khi có thêm người vào
  function syncStanding(playerCount) {
    const want = activeNpcs(playerCount).standing;
    for (const [i, monk] of standers) {
      if (i >= want.length) {
        scene.remove(monk.group);
        standers.delete(i);
      }
    }
    want.forEach((p, i) => {
      if (standers.has(i)) return;
      const monk = createMonk({ robe: pickRobe("st" + i), label: false });
      monk.group.position.set(p.x, 0, p.z);
      add(monk);
      standers.set(i, monk);
    });
  }

  function occupied() {
    const s = new Set(npcList);
    for (const o of others.values()) if (o.state !== "standing" && o.state !== "spinning" && o.mat != null) s.add(o.mat);
    return s;
  }

  // NPC thỉnh thoảng lễ Phật
  let bowTimer = 0;
  function npcBowLoop() {
    const mats = [...npcs.keys()];
    if (mats.length) {
      const monk = npcs.get(mats[Math.floor(Math.random() * mats.length)]);
      monk.setState("bowing");
      setTimeout(() => monk.setState("sitting"), 2600);
    }
    bowTimer = setTimeout(npcBowLoop, 10000 + Math.random() * 15000);
  }

  // ---------- Hành động ----------
  function toast(msg) {
    store.set({ toast: msg });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => store.set({ toast: "" }), 3000);
  }

  function setMode(s) {
    me.state = s;
    me.monk.setState(s);
    store.set({ mode: s });
  }

  function sitDown() {
    if (me.state !== "standing" || nearMat < 0 || occupied().has(nearMat)) return;
    const p = matPos(nearMat);
    me.mat = nearMat;
    me.x = p.x;
    me.z = p.z;
    setMode("sitting");
    store.set({ sitStart: Date.now() });
    push();
  }

  function standUp(announce = true) {
    me.mat = null;
    me.z = Math.min(me.z + 1.2, ROOM.zMax);
    setMode("standing");
    store.set({ panel: null });
    if (announce) push();
  }

  function bow() {
    if (me.state !== "sitting") return;
    setMode("bowing");
    push();
    setTimeout(() => {
      if (me.state === "bowing") {
        setMode("sitting");
        push();
      }
    }, 2600);
  }

  function toggleSpin() {
    if (me.state === "standing") setMode("spinning");
    else if (me.state === "spinning") setMode("standing");
    else return;
    push();
  }

  // ---------- Phím ----------
  function onKeyDown(e) {
    if (!inGame || idle) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" && e.target.type !== "range" && e.target.type !== "checkbox") return;
    const st = store.get();
    if (e.key.startsWith("Arrow")) {
      if (me.state === "spinning") setMode("standing"), push();
      keys.add(e.key);
      e.preventDefault();
      return;
    }
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (st.panel) return;
      if (me.state === "standing" && st.canSit) sitDown();
      else if (me.state === "sitting") standUp();
      return;
    }
    if (st.panel) return;
    if (me.state === "standing" || me.state === "spinning") {
      if (e.code === "KeyQ") toggleSpin();
      return;
    }
    if (me.state === "bowing") return;
    if (e.code === "KeyQ") bow();
    else if (e.code === "KeyW") store.set({ panel: "mo" });
    else if (e.code === "KeyE") store.set({ panel: "beads" });
  }
  const onKeyUp = (e) => keys.delete(e.key);
  const onBlur = () => keys.clear();

  // ---------- Ngừng gửi khi tab ẩn quá 5 phút ----------
  function goIdle() {
    if (idle || !inGame) return;
    idle = true;
    clearInterval(pushTimer);
    navigator.sendBeacon("/api/presence", new Blob([JSON.stringify({ id, leave: true })], { type: "application/json" }));
    stopChant();
    keys.clear();
    store.set({ phase: "idle", panel: null, popup: null });
  }
  function onVisibility() {
    clearTimeout(idleTimer);
    if (document.hidden && inGame && !idle) idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  const onLeave = () => {
    if (inGame && !idle) navigator.sendBeacon("/api/presence", new Blob([JSON.stringify({ id, leave: true })], { type: "application/json" }));
  };

  // ---------- Vào chùa ----------
  function enter(name, robe) {
    if (inGame) return;
    me.robe = robe === "blue" ? "blue" : "brown";
    me.name = (name.trim() || "Phật tử").slice(0, 20);
    try {
      localStorage.setItem("vc_name", me.name);
      localStorage.setItem("vc_robe", me.robe);
    } catch {
      /* bỏ qua */
    }
    me.monk = createMonk({ name: me.name, robe: robeOf(me.robe) });
    me.x = (Math.random() - 0.5) * 24;
    me.z = SPAWN_Z;
    add(me.monk);
    inGame = true;
    store.set({ phase: "game", name: me.name, players: [me.name + " (bạn)"] });
    initAudio(serverNow);
    startChant();
    syncNpcs();
    push();
    pushTimer = setInterval(push, 1000);
  }

  const mats = [];
  for (let i = 0; i < MAT_COUNT; i++) mats.push(matPos(i));

  // ---------- Mỗi khung hình ----------
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  let camReady = false;

  function frame(dt, camera) {
    master.update(dt, false);
    for (const m of npcs.values()) m.update(dt, false);
    for (const m of standers.values()) m.update(dt, false);

    if (inGame && !idle) {
      const st = store.get();
      let moving = false;
      if (me.state === "standing" && !st.panel) {
        const dx = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
        const dz = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);
        if (dx || dz) {
          const len = Math.hypot(dx, dz);
          me.x = Math.max(-ROOM.halfW, Math.min(ROOM.halfW, me.x + (dx / len) * SPEED * dt));
          me.z = Math.max(ROOM.zMin, Math.min(ROOM.zMax, me.z + (dz / len) * SPEED * dt));
          moving = true;
        }
      }
      me.monk.group.position.set(me.x, 0, me.z);
      me.monk.update(dt, moving);

      // Thảm gần nhất
      let best = 3.4;
      let near = -1;
      if (me.state === "standing") {
        for (let i = 0; i < MAT_COUNT; i++) {
          const d = Math.hypot(mats[i].x - me.x, mats[i].z - me.z);
          if (d < best) {
            best = d;
            near = i;
          }
        }
      }
      nearMat = near;
      const free = near >= 0 && !occupied().has(near);
      if (near >= 0) {
        ring.position.set(mats[near].x, 0.07, mats[near].z);
        ring.material.color.set(free ? 0xffe08a : 0xc04030);
        ring.visible = true;
      } else ring.visible = false;
      if (st.nearMat !== near || st.canSit !== free) store.set({ nearMat: near, canSit: free });

      // Người khác: nội suy vị trí (đi xuyên nhau, không tính va chạm)
      for (const o of others.values()) {
        const g = o.monk.group.position;
        const k = Math.min(1, dt * 7);
        const mv = Math.hypot(o.tx - g.x, o.tz - g.z) > 0.08;
        g.set(g.x + (o.tx - g.x) * k, 0, g.z + (o.tz - g.z) * k);
        o.monk.update(dt, mv);
      }

      // Camera đi theo nhân vật, luôn nhìn về bàn thờ (không xoay)
      camTarget.set(me.x * 0.9, 4.4, me.z + 10.8);
      if (!camReady) {
        camPos.copy(camTarget);
        camReady = true;
      }
      camPos.lerp(camTarget, Math.min(1, dt * 6));
      camera.position.copy(camPos);
      camera.lookAt(camPos.x, camPos.y + 3.2, camPos.z - 30);
    } else if (!inGame) {
      camera.position.set(0, 4.2, 22);
      camera.lookAt(0, 10.5, -30);
    }
  }

  function mount() {
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);
    addEventListener("blur", onBlur);
    addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    syncStanding(1);
    bowTimer = setTimeout(npcBowLoop, 8000);
    Object.assign(store.actions, {
      enter,
      sit: sitDown,
      stand: () => standUp(),
      bow,
      spin: toggleSpin,
    });
  }

  function dispose() {
    disposed = true;
    removeEventListener("keydown", onKeyDown);
    removeEventListener("keyup", onKeyUp);
    removeEventListener("blur", onBlur);
    removeEventListener("pagehide", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    clearInterval(pushTimer);
    clearTimeout(idleTimer);
    clearTimeout(bowTimer);
    clearTimeout(toastTimer);
  }

  return { mount, dispose, frame };
}
