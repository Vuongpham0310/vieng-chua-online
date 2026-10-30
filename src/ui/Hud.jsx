import { useEffect, useState } from "react";
import { store, useStore } from "../store.js";
import { setVolume, setMuted, isMuted, getVolume } from "../audio.js";
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
  const [vol, setVol] = useState(getVolume());
  const [mute, setMute] = useState(isMuted());
  if (!popup) return null;
  const closeBtn = (
    <button className="x" onClick={() => store.set({ popup: null })} aria-label="Đóng">
      <Close />
    </button>
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
  const popup = useStore((s) => s.popup);
  const sitting = mode === "sitting" || mode === "bowing";
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
      <div className="profile">
        <div className="avatar">
          <Monk size={30} />
        </div>
        <div>
          <div className="pname">{name}</div>
          <div className="psub" aria-live="polite">
            {sub}
          </div>
        </div>
      </div>

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

      <div className="dock">
        {!sitting && (
          <p className={"guide" + (nearMat >= 0 && !canSit ? " warn" : "")} role="status">
            {guide}
          </p>
        )}
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
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
