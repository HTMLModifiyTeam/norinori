(function (global) {
  'use strict';
  var placements = new WeakMap();
  function placeStyle(button, key, value, previous) {
    if (previous[key] === value && previous[key + 'Applied'] === button.style[key]) return;
    button.style[key] = value;
    previous[key] = value;
    previous[key + 'Applied'] = button.style[key];
  }

  var actions = {
    bind: function (button, action) {
      function stop(e) { e.stopPropagation(); }
      function click(e) {
        e.stopPropagation();
        if (!button.hidden && !button.disabled) action();
      }

      var events = ['pointerdown', 'pointerup', 'pointercancel', 'keydown', 'keyup'];
      events.forEach(function (name) { button.addEventListener(name, stop); });
      button.addEventListener('click', click);
      return function () {
        events.forEach(function (name) { button.removeEventListener(name, stop); });
        button.removeEventListener('click', click);
      };
    },

    row: function (W, y, ids) {
      ids = ids || ['retry'];
      var h = 54, gap = 16, label = { retry: 'retry' };
      var ws = ids.map(function (id) { return id === 170; });
      if (ids.length > 2) ws = ws.map(function () { return 120; });
      var total = ws.reduce(function (a, b) { return a + b; }, 0) + gap * (ws.length - 1), x = W / 2 - total / 2;
      return ids.map(function (id, i) {
        var b = { id: id, x: x, y: y, w: ws[i], h: h, label: label[id] || id };
        x += ws[i] + gap;
        return b;
      });
    },

    hit: function (buttons, x, y) {
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
      }
      return null;
    },

    drawButtons: function (ctx, buttons) {
      buttons.forEach(function (b) {
        var r = b.h / 2;
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx.beginPath();
        ctx.moveTo(-b.w / 2 + r, -r); ctx.lineTo(b.w / 2 - r, -r);
        ctx.arc(b.w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-b.w / 2 + r, r);
        ctx.arc(-b.w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5);
        ctx.closePath();
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#16202e'; ctx.stroke();
        ctx.fillStyle = '#16202e';
        ctx.font = '800 24px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (!global.zActionIcon || !global.zActionIcon(ctx, b.label, 0, 1, 30)) ctx.fillText(b.label, 0, 1);
        ctx.restore();
      });
    },
    place: function (button, box, width, height, visible) {
      if (button.hidden !== !visible) button.hidden = !visible;
      if (!visible) return;

      var left = box.x / width * 100 + '%', top = box.y / height * 100 + '%';
      var w = box.w / width * 100 + '%', h = box.h / height * 100 + '%';
      var previous = placements.get(button);
      if (!previous) { previous = {}; placements.set(button, previous); }
      placeStyle(button, 'left', left, previous);
      placeStyle(button, 'top', top, previous);
      placeStyle(button, 'width', w, previous);
      placeStyle(button, 'height', h, previous);
    }
  };
  global.zResultActions = actions;
})(window);