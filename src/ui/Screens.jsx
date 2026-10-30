import { useState } from "react";
import { store } from "../store.js";
import { Lotus, Moon } from "./Icons.jsx";

export function Welcome() {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem("vc_name") || "";
    } catch {
      return "";
    }
  });
  const [robe, setRobe] = useState(() => {
    try {
      return localStorage.getItem("vc_robe") === "blue" ? "blue" : "brown";
    } catch {
      return "brown";
    }
  });
  const go = (e) => {
    e.preventDefault();
    store.actions.enter && store.actions.enter(name, robe);
  };
  return (
    <div className="overlay welcome">
      <form className="card welcome-card" onSubmit={go}>
        <div className="lotus-mark">
          <Lotus size={46} />
        </div>
        <h1>Viếng Chùa Online</h1>
        <p className="lead">Bước vào chính điện, chọn một tấm thảm và ngồi thiền cùng mọi người.</p>
        <label className="field" htmlFor="nameInput">
          <span>Pháp danh hoặc tên của bạn</span>
          <input id="nameInput" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="Ví dụ: Minh Tâm" autoComplete="nickname" autoFocus />
        </label>
        <fieldset className="robes">
          <legend>Màu áo</legend>
          {[["brown", "Áo nâu"], ["blue", "Áo xanh"]].map(([v, label]) => (
            <label key={v} className={"robe" + (robe === v ? " on" : "")}>
              <input type="radio" name="robe" value={v} checked={robe === v} onChange={() => setRobe(v)} />
              <span className={"swatch " + v} aria-hidden="true" />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
        <button className="primary" type="submit">
          Vào chùa
        </button>
        <small>Dùng phím mũi tên để đi lại · Tiếng kinh tự bật khi vào chùa</small>
      </form>
    </div>
  );
}

export function Idle() {
  return (
    <div className="overlay idle" role="alertdialog" aria-labelledby="idleT" aria-describedby="idleD">
      <div className="card welcome-card">
        <div className="lotus-mark">
          <Moon size={42} />
        </div>
        <h2 id="idleT">Bạn đã rời chùa</h2>
        <p id="idleD" className="lead">
          Trang bị ẩn quá 5 phút nên kết nối đã được tạm dừng để nhường chỗ cho người khác. Nhấn <kbd>F5</kbd> để quay lại chùa.
        </p>
        <button className="primary" autoFocus onClick={() => location.reload()}>
          Tải lại (F5)
        </button>
      </div>
    </div>
  );
}
