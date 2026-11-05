const unlockedAudioContexts = new WeakMap();

export function zAudioResume(context, samples = 1) {
  if (!context || context.state === "closed") return;
  if (context.state !== "running") {
    unlockedAudioContexts.set(context, false);
    try {
      const pending = context.resume();
      pending?.catch(() => {});
    } catch {}
  }
  if (unlockedAudioContexts.get(context)) return;
  try {
    const warmup = context.createBufferSource();
    warmup.buffer = context.createBuffer(1, samples, context.sampleRate);
    warmup.connect(context.destination);
    warmup.onended = () => {
      unlockedAudioContexts.set(context, context.state === "running");
      warmup.disconnect();
    };
    warmup.start(0);
  } catch {}
};