// kaiser.js

export function initKaiser(player) {
  player.characterName = "Kaiser";
  player.isKaiser = true;
}

export function renderKaiser(ctx, player) {
  if (!player.isKaiser) return;

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(player.characterName, player.x, player.y - 40);
}
