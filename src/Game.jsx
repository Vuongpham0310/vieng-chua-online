import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { createController } from "./controller.js";

// Logic trò chơi chạy trong vòng lặp của R3F.
export default function Game() {
  const scene = useThree((s) => s.scene);
  const ctl = useMemo(() => createController(scene), [scene]);
  useEffect(() => {
    ctl.mount();
    return () => ctl.dispose();
  }, [ctl]);
  useFrame(({ camera }, dt) => ctl.frame(Math.min(dt, 0.1), camera));
  return null;
}
