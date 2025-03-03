function createZoneChecker(entity, zone, onEnter, onExit) {
  let wasInside = false;
  return function() {
    const pos = entity.object3D.position;
    const inside =
      pos.x >= zone.xMin &&
      pos.x <= zone.xMax &&
      pos.z >= zone.zMin &&
      pos.z <= zone.zMax;
    if (inside && !wasInside) {
      wasInside = true;
      if (onEnter) { onEnter(); }
    } else if (!inside && wasInside) {
      wasInside = false;
      if (onExit) { onExit(); }
    }
  };
}

function createTiles(room) {
  const { left, right, front, back } = room;
  const tileSize = 2.5;
  const gap = 0.1; // gap on each side within the cell
  const innerSize = tileSize - 2 * gap; // visible tile size

  const numTilesX = Math.floor((right - left) / tileSize);
  const numTilesZ = Math.floor((back - front) / tileSize);

  const tilesContainer = document.createElement("a-entity");

  for (let i = 0; i < numTilesX; i++) {
    for (let j = 0; j < numTilesZ; j++) {
      const tileX = left + tileSize / 2 + i * tileSize;
      const tileZ = front + tileSize / 2 + j * tileSize;

      const tile = document.createElement("a-plane");
      tile.setAttribute("width", innerSize);
      tile.setAttribute("height", innerSize);
      tile.setAttribute("color", "blue");
      tile.setAttribute("opacity", "0.3");
      tile.setAttribute("position", `${tileX} 0.029 ${tileZ}`);
      tile.setAttribute("rotation", "-90 0 0");

      tilesContainer.appendChild(tile);
    }
  }

  scene.appendChild(tilesContainer);
}

function getTileCoordinates(room) {
  const { left, right, front, back } = room;
  const tileSize = 2.5;
  
  const numTilesX = Math.floor((right - left) / tileSize);
  const numTilesZ = Math.floor((back - front) / tileSize);
  
  const coordinates = [];
  
  for (let i = 0; i < numTilesX; i++) {
    for (let j = 0; j < numTilesZ; j++) {
      const tileX = left + tileSize / 2 + i * tileSize;
      const tileZ = front + tileSize / 2 + j * tileSize;
      
      coordinates.push({ x: tileX, z: tileZ });
    }
  }
  
  return coordinates;
}

function spawnEnemiesInRoom(room, count) {
  const tileCoords = getTileCoordinates(room);
  const roomEl = document.getElementById("room1");
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * tileCoords.length);
    const coord = tileCoords[randomIndex];
    
    const enemyInstance = new enemy();
    enemyInstance.rig.setAttribute("position", `${coord.x} 0 ${coord.z}`);
    
    roomEl.appendChild(enemyInstance.rig);
  }
}

function snapToTile(room, x, z) {
  const tileSize = 2.5;
  const startX = room.left + tileSize / 2;
  const startZ = room.front + tileSize / 2;
  const col = Math.round((x - startX) / tileSize);
  const row = Math.round((z - startZ) / tileSize);
  return {
    x: startX + col * tileSize,
    z: startZ + row * tileSize
  };
}

function enableDiscreteMovement(room) {
  ball.rig.removeAttribute("wasd-controls");
  cube.rig.removeAttribute("wasd-controls");

  const tileSize = 2.5;
  const numTilesX = Math.floor((room.right - room.left) / tileSize);
  const numTilesZ = Math.floor((room.back - room.front) / tileSize);

  if (!activeCharacter.originTile) {
    const pos = activeCharacter.rig.getAttribute("position");
    activeCharacter.originTile = {
      col: Math.round((pos.x - (room.left + tileSize/2)) / tileSize),
      row: Math.round((pos.z - (room.front + tileSize/2)) / tileSize)
    };
  }

  window.addEventListener("keydown", function(e) {
    if (!activeCharacter || activeCharacter.moving) return;
    
    const pos = activeCharacter.rig.getAttribute("position");
    let col = Math.round((pos.x - (room.left + tileSize/2)) / tileSize);
    let row = Math.round((pos.z - (room.front + tileSize/2)) / tileSize);
    
    if (e.keyCode === 37) {       // Left arrow
      col = Math.max(0, col - 1);
    } else if (e.keyCode === 39) { // Right arrow
      col = Math.min(numTilesX - 1, col + 1);
    } else if (e.keyCode === 38) { // Up arrow (assuming increasing z is "up")
      row = Math.min(numTilesZ - 1, row + 1);
    } else if (e.keyCode === 40) { // Down arrow
      row = Math.max(0, row - 1);
    } else {
      return; // Ignore other keys.
    }
    
    const origin = activeCharacter.originTile;
    const dx = Math.abs(col - origin.col);
    const dy = Math.abs(row - origin.row);
    if (dx + dy > activeCharacter.movementRadius) {
      console.log("Move out of range");
      return;
    }
    
    const newX = room.left + tileSize/2 + col * tileSize;
    const newZ = room.front + tileSize/2 + row * tileSize;
    smoothMove(activeCharacter, { x: newX, z: newZ }, 500);
  });
  
  function smoothMove(character, newPos, duration) {
    character.moving = true;
    const startTime = performance.now();
    const startPos = character.rig.object3D.position.clone();
    const endPos = new THREE.Vector3(newPos.x, startPos.y, newPos.z);

    function animate() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      character.rig.object3D.position.lerpVectors(startPos, endPos, t);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        character.moving = false;
      }
    }
    requestAnimationFrame(animate);
  }
}

function calculateAllowedTiles(character, room) {
  const tileSize = 2.5;
  // Total grid dimensions:
  const numTilesX = Math.floor((room.right - room.left) / tileSize);
  const numTilesZ = Math.floor((room.back - room.front) / tileSize);
  
  // Get current tile indices for the character.
  const pos = character.rig.getAttribute("position");
  const currentCol = Math.round((pos.x - (room.left + tileSize/2)) / tileSize);
  const currentRow = Math.round((pos.z - (room.front + tileSize/2)) / tileSize);
  
  const allowedTiles = [];
  // Using Manhattan distance (|dx| + |dy|) for allowed moves.
  for (let col = 0; col < numTilesX; col++) {
    for (let row = 0; row < numTilesZ; row++) {
      if (Math.abs(col - currentCol) + Math.abs(row - currentRow) <= character.movementRadius) {
        allowedTiles.push({ col, row });
      }
    }
  }
  return allowedTiles;
}
