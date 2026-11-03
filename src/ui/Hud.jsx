import { useEffect, useState } from "react";
import { store, useStore } from "../store.js";
import { setVolume, setMuted, isMuted, getVolume } from "../audio.js";
import Joystick from "./Joystick.jsx";
import { isTouch, LEVELS } from "../shared.js";
import { Sit, Bow, Mo, Beads, Stand, Spin, Users, Gear, Monk, Close } from "./Icons.jsx";

function Timer() {
  const start = useStore((s) => s.sitStart);
  const [, tick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
  return <span className="tnum">{String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0")}</span>;
}

function Action({ icon, label, kbd, onClick, disabled, hint, wide }) {
  return (
    <button className="act" onClick={onClick} disabled={disabled} title={hint} aria-keyshortcuts={kbd}>
      <span className="act-ic">{icon}</span>
      <span className="act-lb">{label}</span>
      <kbd className={wide ? "wide" : ""} aria-hidden="true">
        {kbd}
      </kbd>
    </button>
  );
}

function Popup() {
  const popup = useStore((s) => s.popup);
  const players = useStore((s) => s.players);
  const npc = useStore((s) => s.npcCount);
  const level = useStore((s) => s.level);
  const [vol, setVol] = useState(getVolume());
  const [mute, setMute] = useState(isMuted());
  if (!popup) return null;
  const closeBtn = (
    <button className="x" onClick={() => store.set({ popup: null })} aria-label="Đóng">
      <Close />
    </button>
  );
  if (popup === "levels")
    return (
      <aside className="card popup levels" aria-label="Cấp độ">
        {closeBtn}
        <h3>Cấp độ công đức</h3>
        <p className="rules">Lễ Phật +1 · Đủ một vòng 108 hạt +10</p>
        <ol>
          {LEVELS.map((l, i) => (
            <li key={l.name} className={i === level ? "now" : i < level ? "done" : ""}>
              <b>{l.name}</b> <span className="tnum">{l.min.toLocaleString("vi-VN")} công đức</span>
              <small>{i === 0 ? l.seat : l.coat + " · " + l.seat}</small>
            </li>
          ))}
        </ol>
      </aside>
    );
  if (popup === "players")
    return (
      <aside className="card popup" aria-label="Người trong chùa">
        {closeBtn}
        <h3>Trong chùa: {players.length} người</h3>
        <ul>
          {players.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
        <small>Cùng {npc} chú tiểu</small>
      </aside>
    );
  return (
    <aside className="card popup" aria-label="Cài đặt">
      {closeBtn}
      <h3>Cài đặt</h3>
      <label className="field">
        <span>Âm lượng</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={vol}
          onChange={(e) => {
            setVol(Number(e.target.value));
            setVolume(Number(e.target.value));
          }}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={mute}
          onChange={(e) => {
            setMute(e.target.checked);
            setMuted(e.target.checked);
          }}
        />
        <span>Tắt âm thanh</span>
      </label>
    </aside>
  );
}

export default function Hud() {
  const mode = useStore((s) => s.mode);
  const name = useStore((s) => s.name);
  const canSit = useStore((s) => s.canSit);
  const nearMat = useStore((s) => s.nearMat);
  const toast = useStore((s) => s.toast);
  const toastKind = useStore((s) => s.toastKind);
  const merit = useStore((s) => s.merit);
  const level = useStore((s) => s.level);
  const gain = useStore((s) => s.gain);
  const popup = useStore((s) => s.popup);
  const sitting = mode === "sitting" || mode === "bowing";
  const next = LEVELS[level + 1];
  const pct = next ? (merit - LEVELS[level].min) / (next.min - LEVELS[level].min) : 1;
  const act = store.actions;

  let sub = <span>Đang đứng</span>;
  if (mode === "spinning") sub = <span>Đang xoay đầu</span>;
  if (sitting)
    sub = (
      <span>
        Đang thiền · <Timer />
      </span>
    );

  let guide = "Đi đến gần một tấm thảm để ngồi thiền";
  if (nearMat >= 0) guide = canSit ? "Nhấn Space để ngồi thiền" : "Thảm này đã có người ngồi";

  return (
    <div className="hud">
      <button className="profile" aria-pressed={popup === "levels"} onClick={() => store.set({ popup: popup === "levels" ? null : "levels" })} aria-label="Xem cấp độ công đức">
        <div className="avatar">
          <Monk size={30} />
        </div>
        <div className="pinfo">
          <div className="pname">{name}</div>
          <div className="psub" aria-live="polite">
            {sub}
          </div>
          <div className="plv">
            <span>{LEVELS[level].name}</span>
            <span className="tnum">{merit.toLocaleString("vi-VN")}</span>
          </div>
          <div className="bar" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ lên cấp">
            <i style={{ width: pct * 100 + "%" }} />
          </div>
        </div>
        {gain && (
          <span className="gain" key={gain.key} aria-hidden="true">
            +{gain.n} công đức
          </span>
        )}
      </button>

      <nav className="top-right" aria-label="Menu">
        <button className="pill" aria-pressed={popup === "players"} onClick={() => store.set({ popup: popup === "players" ? null : "players" })}>
          <Users size={22} /> <span>Người chơi</span>
        </button>
        <button className="pill" aria-pressed={popup === "settings"} onClick={() => store.set({ popup: popup === "settings" ? null : "settings" })}>
          <Gear size={22} /> <span>Cài đặt</span>
        </button>
      </nav>
      <Popup />

      <div className="hint" aria-hidden="true">
        <span><kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> di chuyển</span>
        <span><kbd>Space</kbd> ngồi thiền / đứng dậy</span>
        <span><kbd>Q</kbd> xoay đầu</span>
        <span>Khi ngồi: <kbd>Q</kbd> lễ Phật · <kbd>W</kbd> gõ mõ · <kbd>E</kbd> tràng hạt</span>
      </div>

      {isTouch && !sitting && mode !== "bowing" && <Joystick />}

      {!sitting && (
        <p className={"guide" + (nearMat >= 0 && !canSit ? " warn" : "")} role="status">
          {guide}
        </p>
      )}

      <div className="dock">
        <div className="acts">
          {!sitting && <Action icon={<Spin size={30} />} label={mode === "spinning" ? "Dừng xoay" : "Xoay đầu"} kbd="Q" onClick={act.spin} />}
          {!sitting && <Action icon={<Sit size={30} />} label="Ngồi thiền" kbd="Space" wide onClick={act.sit} disabled={!canSit} hint={nearMat >= 0 && !canSit ? "Thảm này đã có người ngồi" : undefined} />}
          {sitting && <Action icon={<Bow size={30} />} label="Lễ Phật" kbd="Q" onClick={act.bow} disabled={mode === "bowing"} />}
          {sitting && <Action icon={<Mo size={30} />} label="Gõ mõ" kbd="W" onClick={() => store.set({ panel: "mo" })} />}
          {sitting && <Action icon={<Beads size={30} />} label="Tràng hạt" kbd="E" onClick={() => store.set({ panel: "beads" })} />}
          {sitting && <Action icon={<Stand size={30} />} label="Đứng dậy" kbd="Space" wide onClick={act.stand} />}
        </div>
      </div>

      {toast && (
        <div className={"toast " + toastKind} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
