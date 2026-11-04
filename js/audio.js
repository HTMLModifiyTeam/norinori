(function () {
  "use strict";
  var unlocked = new WeakMap();
  window.zAudioResume = function (context, samples) {
    if (!context || context.state === "closed") return;
    if (context.state !== "running") {
      unlocked.set(context, false);
      try {
        var pending = context.resume();
        if (pending && pending.catch) pending.catch(function () { });
      } catch (e) { }
    }
    if (!unlocked.get(context)) {
      try {
        var warmup = context.createBufferSource();
        warmup.buffer = context.createBuffer(1, samples || 1, context.sampleRate);
        warmup.connect(context.destination);
        warmup.onended = function () {
          unlocked.set(context, context.state === "running");
          warmup.disconnect();
        };
        warmup.start(0);
      } catch (e) { }
    }
  };
})();