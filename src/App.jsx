import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import World from "./World.jsx";
import Game from "./Game.jsx";
import Hud from "./ui/Hud.jsx";
import Panels from "./ui/Panels.jsx";
import { Welcome, Idle } from "./ui/Screens.jsx";
import { useStore } from "./store.js";

export default function App() {
  const phase = useStore((s) => s.phase);

  useEffect(() => {
    // Space không được kích hoạt nút đang focus (Space dành cho hành động trong game)
    const noSpace = (e) => {
      if (e.code === "Space" && !(e.target && e.target.tagName === "INPUT")) e.preventDefault();
    };
    const blurAfterClick = (e) => {
      if (e.detail > 0 && e.target.closest && e.target.closest("button") && document.activeElement) document.activeElement.blur();
    };
    addEventListener("keyup", noSpace);
    document.addEventListener("click", blurAfterClick);
    return () => {
      removeEventListener("keyup", noSpace);
      document.removeEventListener("click", blurAfterClick);
    };
  }, []);

  return (
    <>
      <Canvas
        className="view"
        dpr={[1, 2]}
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: 62, near: 0.1, far: 700, position: [0, 4.2, 22] }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <World />
        <Game />
      </Canvas>
      {phase === "welcome" && <Welcome />}
      {phase !== "welcome" && <Hud />}
      {phase === "game" && <Panels />}
      {phase === "idle" && <Idle />}
    </>
  );
}
