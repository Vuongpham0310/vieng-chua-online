// Dùng chung cho trình duyệt và Netlify Function: bố cục thảm + vị trí NPC (cố định, không random).
export const COLS = 8;
export const ROWS = 5;
export const MAT_COUNT = COLS * ROWS;

// Chính điện: rộng 68 x sâu 88, trần cao 69 (gấp 10 lần bản cũ)
export const HALL = { halfW: 34, zBack: -52, zFront: 36, ceil: 69 };
export const MASTER_POS = { x: 0, z: -25 };
export const ROOM = { halfW: 31, zMin: -22.5, zMax: 31 };
export const SPAWN_Z = 24;

// Thảm cách nhau gấp đôi: 6.0 theo chiều ngang, 6.8 theo chiều dọc
export function matPos(i) {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  return { x: (c - 3.5) * 6.0, z: -17 + r * 6.8 };
}

// Thảm giữa chùa: Thích Yến Nhi luôn ngồi đây, không ai khác ngồi được
export const FIXED_MAT = 20;

// 13 NPC ngồi thiền trên các thảm cố định (khoảng 2/3 trong 20 NPC)
export const NPC_MATS = [1, 4, 6, 9, 11, 16, 19, 21, 26, 29, 33, 35, 38];

// 7 NPC còn lại đứng yên ở các lối đi giữa các thảm
export const NPC_STANDING = [
  { x: -12, z: -13.6 },
  { x: 6, z: -6.8 },
  { x: -18, z: 0 },
  { x: 0, z: 6.8 },
  { x: 12, z: 0 },
  { x: -6, z: 14 },
  { x: 18, z: 14 },
];

export const NPC_TOTAL = 20;

// Càng nhiều người thật trong chùa thì càng ít NPC: tổng NPC = 20 - số người (tối thiểu 0).
// Khoảng 2/3 NPC ngồi, 1/3 đứng; bớt từ cuối danh sách nên vị trí còn lại không đổi.
export function activeNpcs(playerCount) {
  const target = Math.max(0, NPC_TOTAL - Math.max(0, playerCount));
  const sit = Math.min(NPC_MATS.length, Math.ceil((target * 2) / 3));
  const stand = Math.min(NPC_STANDING.length, target - sit);
  return { mats: NPC_MATS.slice(0, sit), standing: NPC_STANDING.slice(0, Math.max(0, stand)) };
}

// Điện thoại / máy bảng cảm ứng: bật cần điều khiển, giảm độ phân giải bóng đổ
export const isTouch = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

// Công đức: Lễ Phật +1, đủ một vòng tràng hạt (108 hạt) +10.
export const MERIT_BOW = 1;
export const MERIT_BEADS_ROUND = 10;

// Cấp độ theo công đức. Mỗi cấp được ban áo khoác ngoài và chỗ ngồi riêng, bắt buộc dùng từ đó.
export const LEVELS = [
  { name: "Phật tử", min: 0, coat: "Chưa có áo ngoài", seat: "Thảm cói" },
  { name: "Sa di", min: 100, coat: "Áo tràng xám", seat: "Đệm xám" },
  { name: "Tỳ kheo", min: 500, coat: "Cà sa nâu", seat: "Bồ đoàn nâu" },
  { name: "Đại đức", min: 1500, coat: "Cà sa vàng nghệ", seat: "Bồ đoàn vàng" },
  { name: "Thượng tọa", min: 5000, coat: "Cà sa đỏ đô", seat: "Tòa sen hồng" },
  { name: "Hòa thượng", min: 15000, coat: "Cà sa vàng kim", seat: "Tòa sen vàng" },
];
export const levelOf = (merit) => LEVELS.reduce((lv, l, i) => (merit >= l.min ? i : lv), 0);
