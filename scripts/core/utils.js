function calculateDistance(object, torch) {
  let pos = object.getAttribute("position");
  let dx = pos.x - torch.x;
  let dy = pos.y - torch.y;
  let dz = pos.z - torch.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}