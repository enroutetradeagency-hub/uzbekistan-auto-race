/**
 * Asfalt Atlas design reminder: this component is an invisible mobile-first frame
 * around a cinematic road corridor; all rich motion belongs to the Babylon canvas.
 */
import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    let handle: GameHandle | null = null;
    let disposed = false;
    createGameScene(engine, canvas).then((nextHandle) => {
      if (disposed) {
        nextHandle.dispose();
        return;
      }
      handle = nextHandle;
      engine.runRenderLoop(() => nextHandle.scene.render());
    });

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="UZBEKISTAN AUTO RACE 3D o‘yin maydoni"
        style={{ touchAction: "none" }}
      />
      <div id="game-ui" aria-live="polite" />
      <div className="rotate-notice" aria-hidden="true">
        O‘YIN UCHUN TELEFONNI GORIZONTAL USHLANG
      </div>
      <style>{`.game-shell,.game-canvas,#game-ui,.game-menu,.race-hud,.rotate-notice { position:absolute!important; } .game-menu.is-visible + .race-hud { opacity:0; } .race-hud { transition:opacity 180ms cubic-bezier(.23,1,.32,1); }`}</style>
    </div>
  );
}
