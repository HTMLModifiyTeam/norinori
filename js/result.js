import { drawActionIcon } from "./icons.js";

const BUTTON_WIDTH = 170;
const BUTTON_HEIGHT = 54;
const BUTTON_GAP = 16;
const INK = "#000000";
const LABELS = { retry: "retry" };
const GUARDED_EVENTS = ["pointerdown", "pointerup", "pointercancel", "keydown", "keyup"];

// Last style values written per button, so unchanged frames cost no DOM writes.
const placements = new WeakMap();

function setStyle(button, cache, key, value) {
  const last = cache[key];
  if (last && last.requested === value && last.applied === button.style[key]) return;
  button.style[key] = value;
  cache[key] = { requested: value, applied: button.style[key] };
}

function pillPath(ctx, x, y, w, h) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, h / 2);
    return;
  }
  const r = h / 2;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath();
}

export default new class actions {
  constructor() {}

  /** Attaches `action` to a DOM button and shields the page from its events. Returns a cleanup function. */
  bind(button, action) {
    const controller = new AbortController();
    const { signal } = controller;
    const stop = event => event.stopPropagation();

    for (const name of GUARDED_EVENTS) button.addEventListener(name, stop, { signal });
    button.addEventListener("click", event => { event.stopPropagation(); if (!button.hidden && !button.disabled) action(); }, { signal });
    return () => controller.abort();
  }

  /** Lays out a horizontally centered row of buttons whose top edge is at `y`. */
  row(width, y, ids = ["retry"]) {
    const total = ids.length * BUTTON_WIDTH + (ids.length - 1) * BUTTON_GAP;
    const startX = (width - total) / 2;
    return ids.map((id, index) => ({ id, x: startX + index * (BUTTON_WIDTH + BUTTON_GAP), y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT, label: LABELS[id] ?? id }));
  }

  /** Returns the id of the button under (x, y), or null. */
  hit(buttons, x, y) {
    const match = buttons.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
    return match?.id ?? null;
  }

  drawButtons(ctx, buttons) {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.font = "800 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const button of buttons) {
      const cx = button.x + button.w / 2;
      const cy = button.y + button.h / 2 + 1;

      pillPath(ctx, button.x, button.y, button.w, button.h);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.stroke();

      ctx.fillStyle = INK;
      if (drawActionIcon) {
        ctx.save(); // isolate whatever state the icon helper changes
        drawActionIcon(ctx, button.label, cx, cy, 30);
        ctx.restore();
      } else ctx.fillText(button.label, cx, cy);
    }

    ctx.restore();
  }

  /** Positions a DOM button over a canvas-space `box`, using percentages so it scales with the canvas. */
  place(button, box, width, height, visible) {
    const hidden = !visible;
    if (button.hidden !== hidden) button.hidden = hidden;
    if (hidden) return;

    let cache = placements.get(button);
    if (!cache) placements.set(button, (cache = {}));

    setStyle(button, cache, "left", `${(box.x / width) * 100}%`);
    setStyle(button, cache, "top", `${(box.y / height) * 100}%`);
    setStyle(button, cache, "width", `${(box.w / width) * 100}%`);
    setStyle(button, cache, "height", `${(box.h / height) * 100}%`);
  }
}