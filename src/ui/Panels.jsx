import { useEffect, useRef, useState } from "react";
import { store, useStore } from "../store.js";
import { playMo, playBeadClick } from "../audio.js";
import { Back } from "./Icons.jsx";

const BEADS = 108;

const load = (k) => {
  try {
    return Number(localStorage.getItem(k)) || 0;
  } catch {
    return 0;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, String(v));
  } catch {
    /* bỏ qua */
  }
};
const close = () => store.set({ panel: null });

function Shell({ title, children, labelId }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    addEventListener("keydown", onKey);
    ref.current && ref.current.focus();
    return () => removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section className="card panel" role="dialog" aria-modal="true" aria-labelledby={labelId}>
        <button ref={ref} className="back" onClick={close}>
          <Back /> Trở lại
        </button>
        <h2 id={labelId}>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function MoPanel() {
  const [count, setCount] = useState(() => load("vc_mo"));
  const [plus, setPlus] = useState([]);
  const [hit, setHit] = useState(false);
  const n = useRef(0);
  const cnt = useRef(count);

  const strike = () => {
    cnt.current += 1;
    setCount(cnt.current);
    save("vc_mo", cnt.current);
    playMo();
    setHit(true);
    setTimeout(() => setHit(false), 90);
    const key = ++n.current;
    setPlus((p) => [...p, { key, dx: Math.random() * 70 - 35 }]);
    setTimeout(() => setPlus((p) => p.filter((x) => x.key !== key)), 900);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        strike();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <Shell title="Gõ mõ" labelId="moTitle">
      <div className="mo-stage" onMouseDown={(e) => (strike(), e.preventDefault())} role="button" tabIndex={0} aria-label="Gõ mõ" onKeyDown={(e) => e.key === "Enter" && strike()}>
        <svg className={"mo-svg" + (hit ? " hit" : "")} viewBox="0 0 220 200" width="270" height="245" aria-hidden="true">
          <defs>
            <radialGradient id="woodG" cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#d9873a" />
              <stop offset="0.6" stopColor="#a8531c" />
              <stop offset="1" stopColor="#6b3010" />
            </radialGradient>
          </defs>
          <ellipse cx="110" cy="182" rx="76" ry="10" fill="rgba(0,0,0,.28)" />
          <ellipse cx="110" cy="100" rx="88" ry="80" fill="url(#woodG)" stroke="#4a2008" strokeWidth="3" />
          <path d="M45 100 Q110 128 175 100" fill="none" stroke="#3a1805" strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="86" cy="60" rx="30" ry="14" fill="rgba(255,225,170,.35)" />
          <circle cx="178" cy="62" r="7" fill="#e6b84a" stroke="#4a2008" strokeWidth="2" />
        </svg>
        <div className="plus-layer" aria-hidden="true">
          {plus.map((p) => (
            <span key={p.key} className="plus" style={{ marginLeft: p.dx }}>
              +1 công đức
            </span>
          ))}
        </div>
      </div>
      <p className="count" aria-live="polite">
        Số lần gõ: <b>{count}</b>
      </p>
      <small>Bấm chuột vào mõ hoặc nhấn Space để gõ · Esc để trở lại</small>
    </Shell>
  );
}

function BeadsPanel() {
  const [total, setTotal] = useState(() => load("vc_beads_total"));
  const t = useRef(total);
  const advance = () => {
    t.current += 1;
    setTotal(t.current);
    save("vc_beads_total", t.current);
    playBeadClick();
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        advance();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  const now = total % BEADS;
  const R = 108;
  return (
    <Shell title="Lần tràng hạt" labelId="beadTitle">
      <svg className="bead-svg" viewBox="-130 -150 260 280" width="320" height="344" onClick={advance} aria-hidden="true">
        {Array.from({ length: BEADS }, (_, i) => {
          const a = (i / BEADS) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={(Math.cos(a) * R).toFixed(2)}
              cy={(Math.sin(a) * R).toFixed(2)}
              r={i % 27 === 26 ? 6.2 : 4.6}
              stroke="#2a1206"
              strokeWidth="0.8"
              fill={i === now - 1 ? "#ffe08a" : i < now ? "#d99a48" : "#a56a3e"}
            />
          );
        })}
        <path d="M0 -108 L0 -126 M-5 -126 L5 -126 L0 -138 Z" stroke="#e8bf62" fill="#d9a53a" />
      </svg>
      <p className="count" aria-live="polite">
        Hạt <b>{now}</b> / 108 · Vòng <b>{Math.floor(total / BEADS)}</b>
      </p>
      <button className="primary" onClick={advance}>
        Lần một hạt
      </button>
      <small>Bấm nút, bấm vào tràng hạt hoặc nhấn Space · Esc để trở lại</small>
    </Shell>
  );
}

export default function Panels() {
  const panel = useStore((s) => s.panel);
  if (panel === "mo") return <MoPanel />;
  if (panel === "beads") return <BeadsPanel />;
  return null;
}
