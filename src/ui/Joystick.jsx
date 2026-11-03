import { useRef, useState } from "react";
import { store } from "../store.js";

const R = 34; // bán kính di chuyển của núm

// Cần điều khiển ảo cho điện thoại: kéo núm để đi, thả ra để dừng.
export default function Joystick() {
  const base = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const move = (e) => {
    const r = base.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    setKnob({ x: dx, y: dy });
    store.actions.joy(dx / R, dy / R);
  };
  const end = () => {
    setKnob({ x: 0, y: 0 });
    store.actions.joy(0, 0);
  };

  return (
    <div
      ref={base}
      className="joy"
      role="presentation"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => e.buttons && move(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joy-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
