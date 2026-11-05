export function drawActionIcon(ctx, label, x, y, size = 30) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (label === "retry") {
    ctx.beginPath(); ctx.arc(0, 0, 8, -Math.PI * 0.8, Math.PI * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-6.5, -3); ctx.lineTo(-1.5, -5); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-4, -10); ctx.lineTo(9, 10); ctx.lineTo(4, 10); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -10); ctx.lineTo(1, -1); ctx.moveTo(-1, 1); ctx.lineTo(-9, 10); ctx.stroke();
  }
  ctx.restore();
}