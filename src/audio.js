// Âm thanh: file do người dùng cung cấp, đặt ở public/assets/audio/
const FILES = {
  chant: "assets/audio/su-thay.mp3", // tiếng kinh của sư thầy, phát lặp, đồng bộ theo giờ server
  mo: "assets/audio/go-mo.mp3", // tiếng gõ mõ của người chơi
};

let volume = 0.8;
let muted = false;
let chant = null;
let getServerNow = () => Date.now();
let moBase = null;
let ctx = null;

function applyVolume() {
  if (chant) chant.volume = muted ? 0 : volume * 0.7;
}

function syncChant() {
  if (!chant || !isFinite(chant.duration) || chant.duration <= 0) return;
  const dur = chant.duration;
  const target = (getServerNow() / 1000) % dur;
  let diff = Math.abs(chant.currentTime - target);
  diff = Math.min(diff, dur - diff);
  if (diff > 1.2) chant.currentTime = target;
}

export function initAudio(serverNowFn) {
  getServerNow = serverNowFn;
  // ?mute=1 trên URL: tắt toàn bộ âm thanh (dùng khi chạy thử)
  if (new URLSearchParams(location.search).has("mute")) muted = true;
  chant = new Audio(FILES.chant);
  chant.loop = true;
  chant.preload = "auto";
  chant.addEventListener("loadedmetadata", syncChant);
  moBase = new Audio(FILES.mo);
  moBase.preload = "auto";
  applyVolume();
  setInterval(syncChant, 20000);
}

// Gọi sau một thao tác của người dùng (trình duyệt chặn tự phát âm thanh).
export function startChant() {
  if (!chant) return;
  syncChant();
  chant.play().catch(() => {});
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
}

export function stopChant() {
  if (chant) chant.pause();
}

export function setVolume(v) {
  volume = v;
  applyVolume();
}

export function setMuted(m) {
  muted = m;
  applyVolume();
}

export function isMuted() {
  return muted;
}

export function getVolume() {
  return volume;
}

export function playMo() {
  if (!moBase || muted) return;
  const a = moBase.cloneNode();
  a.volume = Math.min(1, volume);
  a.play().catch(() => {});
}

// Tiếng lách cách của hạt: tổng hợp bằng Web Audio (không cần file).
export function playBeadClick() {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.5 * volume, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  gain.connect(ctx.destination);
  for (const [freq, dur] of [[1900, 0.05], [3100, 0.03]]) {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + dur);
    o.connect(gain);
    o.start(t);
    o.stop(t + 0.1);
  }
}
