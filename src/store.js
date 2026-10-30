import { useSyncExternalStore } from "react";

// Kho trạng thái nhỏ nối phần 3D (R3F) với giao diện React.
let state = {
  phase: "welcome", // welcome | game | idle
  mode: "standing", // standing | spinning | sitting | bowing
  nearMat: -1,
  canSit: false,
  sitStart: 0,
  name: "Phật tử",
  players: [],
  npcCount: 0,
  panel: null, // null | "mo" | "beads"
  popup: null, // null | "players" | "settings"
  toast: "",
};
const listeners = new Set();

export const store = {
  get: () => state,
  set(patch) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  actions: {}, // controller đăng ký: enter, sit, stand, bow, spin
};

export const useStore = (sel) => useSyncExternalStore(store.subscribe, () => sel(state));
