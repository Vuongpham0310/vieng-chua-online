import { getStore } from "@netlify/blobs";
import { MAT_COUNT, activeNpcs } from "../../src/shared.js";

const TTL = 15000;

export default async (req) => {
  const store = getStore({ name: "presence", consistency: "strong" });
  const now = Date.now();
  let body = {};
  if (req.method === "POST") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  const players = (await store.get("players", { type: "json" })) || {};
  for (const id of Object.keys(players)) {
    if (now - players[id].t > TTL) delete players[id];
  }

  const id = typeof body.id === "string" && body.id.length <= 40 ? body.id : null;
  const liveBefore = Object.keys(players).length + (id && !players[id] && !body.leave ? 1 : 0);
  const npc = activeNpcs(liveBefore).mats;
  let rejected = false;

  if (id) {
    if (body.leave) {
      delete players[id];
    } else {
      let state = ["standing", "sitting", "bowing", "spinning"].includes(body.state) ? body.state : "standing";
      let mat = Number.isInteger(body.mat) ? body.mat : null;
      if (state === "sitting" || state === "bowing") {
        const taken = Object.entries(players).some(
          ([pid, p]) => pid !== id && p.mat === mat && p.state !== "standing"
        );
        if (mat === null || mat < 0 || mat >= MAT_COUNT || npc.includes(mat) || taken) {
          rejected = true;
          state = "standing";
          mat = null;
        }
      } else {
        mat = null;
      }
      players[id] = {
        name: String(body.name || "Phật tử").slice(0, 24),
        x: Number(body.x) || 0,
        z: Number(body.z) || 0,
        robe: body.robe === "blue" ? "blue" : "brown",
        state,
        mat,
        t: now,
      };
    }
    await store.setJSON("players", players);
  }

  const others = Object.entries(players)
    .filter(([pid]) => pid !== id)
    .map(([pid, p]) => ({ id: pid, name: p.name, robe: p.robe, x: p.x, z: p.z, state: p.state, mat: p.mat }));

  const count = Object.keys(players).length;
  return Response.json({ now, rejected, npc: activeNpcs(count).mats, count, players: others });
};

export const config = { path: "/api/presence" };
