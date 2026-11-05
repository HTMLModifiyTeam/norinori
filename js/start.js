export function startTap(isWaiting, onStart, { target = document, signal } = {}) {
  let activePointerId = null;

  const reset = () => { activePointerId = null; };
  const isTrackedPointer = event => activePointerId === event.pointerId;

  const onPointerDown = event => {
    const isPrimaryButton = event.button === 0;
    if (activePointerId !== null || !event.isPrimary || !isPrimaryButton || !isWaiting()) return;
    activePointerId = event.pointerId;
    event.stopImmediatePropagation();
  };

  const onPointerUp = event => {
    if (!isTrackedPointer(event)) return;
    reset();
    if (!isWaiting()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    onStart(event);
  };

  const onPointerCancel = event => { if (isTrackedPointer(event)) reset(); };

  const controller = new AbortController();
  const listenerOptions = { capture: true, signal: controller.signal };

  target.addEventListener("pointerdown", onPointerDown, listenerOptions);
  target.addEventListener("pointerup", onPointerUp, listenerOptions);
  target.addEventListener("pointercancel", onPointerCancel, listenerOptions);
  window.addEventListener("blur", reset, { signal: controller.signal });

  const stop = () => {
    controller.abort();
    reset();
  };

  if (signal) {
    if (signal.aborted) stop();
    else signal.addEventListener("abort", stop, { once: true });
  }

  return stop;
}