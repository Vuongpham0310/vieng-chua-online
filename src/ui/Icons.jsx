// Bộ biểu tượng SVG nét liền (24x24, nét 1.8) — cùng một phong cách, không dùng emoji.
const base = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false };
const I = ({ children, size, ...p }) => (
  <svg {...base} {...(size ? { width: size, height: size } : {})} {...p}>
    {children}
  </svg>
);

export const Lotus = (p) => (
  <I {...p}>
    <path d="M12 20c-3.2 0-6.3-1.6-8-5 2.6 0 4.6.8 6 2.2" />
    <path d="M12 20c3.2 0 6.3-1.6 8-5-2.6 0-4.6.8-6 2.2" />
    <path d="M12 19.5c-2.6-1.6-3.8-4-3.8-7 0-2.4 1.5-4.5 3.8-6.5 2.3 2 3.8 4.1 3.8 6.5 0 3-1.2 5.4-3.8 7z" />
    <path d="M5.2 12.2c-.8 1-1.2 2-1.2 2.8M18.8 12.2c.8 1 1.2 2 1.2 2.8" />
  </I>
);
export const Sit = (p) => (
  <I {...p}>
    <circle cx="12" cy="5.2" r="2.4" />
    <path d="M12 8.2v5M8.2 11.6c1.1.9 2.5 1.4 3.8 1.4s2.7-.5 3.8-1.4" />
    <path d="M4 18.5c2.2-2.4 5-3.4 8-3.4s5.8 1 8 3.4M6 18.5h12" />
  </I>
);
export const Bow = (p) => (
  <I {...p}>
    <path d="M12 3.5c-1.4 2-2.4 4-2.4 6.2 0 1.2.3 2.2 1 3.1l1.4 1.7 1.4-1.7c.7-.9 1-1.9 1-3.1 0-2.2-1-4.2-2.4-6.2z" />
    <path d="M9.6 11.6 6 15.2c-1 1-.6 2.6.7 3l3.4.9M14.4 11.6 18 15.2c1 1 .6 2.6-.7 3l-3.4.9" />
  </I>
);
export const Mo = (p) => (
  <I {...p}>
    <ellipse cx="10.5" cy="14" rx="7.5" ry="6" />
    <path d="M4.6 14.6c3.6 1.8 7.2 1.8 10.8 0" />
    <path d="M15 4.5l4.5 4.5M14 3.6a1.4 1.4 0 1 0 2 2" />
  </I>
);
export const Beads = (p) => (
  <I {...p}>
    <circle cx="12" cy="4.6" r="1.5" />
    <circle cx="18.4" cy="8.2" r="1.5" />
    <circle cx="18.4" cy="15.6" r="1.5" />
    <circle cx="12" cy="19.2" r="1.5" />
    <circle cx="5.6" cy="15.6" r="1.5" />
    <circle cx="5.6" cy="8.2" r="1.5" />
    <path d="M12 21.2v1.6" />
  </I>
);
export const Stand = (p) => (
  <I {...p}>
    <circle cx="12" cy="4.6" r="2.2" />
    <path d="M12 8v7M8.4 10.6 12 9l3.6 1.6M12 15l-2.4 6M12 15l2.4 6" />
  </I>
);
export const Spin = (p) => (
  <I {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20.2 3.8v4h-4" />
    <circle cx="12" cy="12" r="1.7" />
  </I>
);
export const Users = (p) => (
  <I {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.2 19c.4-3 2.7-5 5.8-5s5.4 2 5.8 5" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.2c1.7.6 2.7 2.2 3 4.8" />
  </I>
);
export const Gear = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
  </I>
);
export const Back = (p) => (
  <I {...p} size={20}>
    <path d="M15 5l-7 7 7 7" />
  </I>
);
export const Close = (p) => (
  <I {...p} size={20}>
    <path d="M6 6l12 12M18 6 6 18" />
  </I>
);
export const Moon = (p) => (
  <I {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </I>
);
export const Monk = (p) => (
  <I {...p} strokeWidth={1.6}>
    <circle cx="12" cy="9" r="5.4" />
    <path d="M9.6 9.6v.2M14.4 9.6v.2M10.4 11.8c.9.7 2.3.7 3.2 0" />
    <path d="M5 21c.5-3.2 3-5 7-5s6.5 1.8 7 5" />
  </I>
);
