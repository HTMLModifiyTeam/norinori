const MIN_GAME_HEIGHT = 780;
const MAX_GAME_HEIGHT = 1700;
const MAX_DPR = 2;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Measures the host element and derives a logical game height that matches
 * its aspect ratio, given the fixed logical `designWidth`.
 */
function measure(wrap, designWidth) {
  const host = wrap.parentElement;
  const width = host?.clientWidth || window.innerWidth;
  const height = host?.clientHeight || window.innerHeight;
  const aspectHeight = width > 0 ? Math.round((designWidth * height) / width) : MIN_GAME_HEIGHT;

  return { width, height, gameHeight: clamp(aspectHeight, MIN_GAME_HEIGHT, MAX_GAME_HEIGHT) };
}

/**
 * Scales the canvas (and its wrapper) to fit `view` while preserving the
 * logical `width` x `height` aspect ratio, and sets up the context transform
 * so drawing code can keep using logical coordinates.
 */
function fit(canvas, wrap, ctx, width, height, view) {
  const scale = Math.min(view.width / width, view.height / height);
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

  const cssWidth = Math.round(width * scale);
  const cssHeight = Math.round(height * scale);
  const cssWidthPx = `${cssWidth}px`;
  const cssHeightPx = `${cssHeight}px`;

  wrap.style.width = cssWidthPx;
  wrap.style.height = cssHeightPx;
  canvas.style.width = cssWidthPx;
  canvas.style.height = cssHeightPx;

  // Size the backing store from the rounded CSS size so pixels map 1:1.
  const pixelWidth = Math.round(cssWidth * dpr);
  const pixelHeight = Math.round(cssHeight * dpr);

  // Assigning canvas.width/height clears the canvas and resets context state,
  // even when the value is unchanged, so only do it when the size differs.
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

  ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
}

/** Converts a pointer event's client coordinates to logical canvas coordinates. */
function point(canvas, event, width, height) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * width,
    y: ((event.clientY - rect.top) / rect.height) * height,
  };
}

// Default export kept so existing `import gameView from ...` callers still work.
export default { measure, fit, point };