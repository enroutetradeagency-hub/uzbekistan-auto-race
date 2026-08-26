import type { VehicleControls } from "../actors/Vehicle";

type Action = "throttle" | "brake" | "left" | "right" | "nitro";

export class InputManager {
  private active = new Set<Action>();
  private readonly cleanups: Array<() => void> = [];

  constructor(root: HTMLElement) {
    const keyboardAction = (key: string): Action | null => {
      const map: Record<string, Action> = { ArrowUp: "throttle", w: "throttle", W: "throttle", ArrowDown: "brake", s: "brake", S: "brake", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right", Shift: "nitro" };
      return map[key] ?? null;
    };
    const keyDown = (event: KeyboardEvent) => {
      const action = keyboardAction(event.key);
      if (!action) return;
      event.preventDefault();
      this.active.add(action);
    };
    const keyUp = (event: KeyboardEvent) => {
      const action = keyboardAction(event.key);
      if (action) this.active.delete(action);
    };
    const clear = () => this.active.clear();
    window.addEventListener("keydown", keyDown, { passive: false });
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", () => { if (document.hidden) clear(); });
    this.cleanups.push(() => window.removeEventListener("keydown", keyDown), () => window.removeEventListener("keyup", keyUp), () => window.removeEventListener("blur", clear));

    root.querySelectorAll<HTMLElement>("[data-drive-action]").forEach((button) => {
      const action = button.dataset.driveAction as Action;
      const begin = (event: PointerEvent) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.active.add(action);
        button.classList.add("is-pressed");
        navigator.vibrate?.(8);
      };
      const end = () => {
        this.active.delete(action);
        button.classList.remove("is-pressed");
      };
      button.addEventListener("pointerdown", begin);
      button.addEventListener("pointerup", end);
      button.addEventListener("pointercancel", end);
      button.addEventListener("lostpointercapture", end);
      this.cleanups.push(
        () => button.removeEventListener("pointerdown", begin),
        () => button.removeEventListener("pointerup", end),
        () => button.removeEventListener("pointercancel", end),
        () => button.removeEventListener("lostpointercapture", end),
      );
    });
  }

  controls(): VehicleControls {
    return { throttle: this.active.has("throttle") ? 1 : 0, brake: this.active.has("brake") ? 1 : 0, steer: (this.active.has("right") ? 1 : 0) - (this.active.has("left") ? 1 : 0), nitro: this.active.has("nitro") };
  }

  dispose(): void {
    this.cleanups.splice(0).forEach((cleanup) => cleanup());
    this.active.clear();
  }
}
