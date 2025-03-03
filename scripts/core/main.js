// main.js
let scene, ball, cube, activeCharacter;
let torches = [], fires = [];
let lastTime;
let fadeDone = false;

let tunnelState = "none";
let tunnelCutsceneTime = 0;
const tunnelCutsceneDuration = 5000;
let tunnelStartZ = 0;
let tunnelTargetZ = -26;

const room1EntranceZone = { xMin: -2, xMax: 2, zMin: -29, zMax: -27.5 };
const room1 = {
  left: -22.494,
  right: 22.532,
  front: -62.910,
  back: -28.062
};

window.onload = function() {
  scene = document.querySelector("a-scene");
  if (scene.hasLoaded) {
    init();
  } else {
    scene.addEventListener("loaded", init);
  }
};

function init() {
  const scene = document.querySelector('a-scene');
  pillars.forEach((pillarData) => {
    const pillar = createPillar(pillarData);
    if (pillarData.rotation) {
      pillar.setAttribute('rotation', pillarData.rotation);
    }
    scene.appendChild(pillar);
  });

  ball = new Ball();
  cube = new Cube();
  activeCharacter = ball;
  cube.disableControls();

  lastTime = performance.now();
  requestAnimationFrame(loop);

  const checkRoom1Entrance = createZoneChecker(ball.rig, room1EntranceZone, () => {
    console.log("hi");
    spawnEnemiesInRoom(room1, 2);
    createTiles(room1);
    
    ball.rig.setAttribute("position", "-1.24 0 -31.66");
    cube.rig.setAttribute("position", "1.256 0 -31.66");
    
    enableDiscreteMovement(room1);
    
    canSwitch = true;
  });
  
  function zoneCheckerLoop() {
    checkRoom1Entrance();
    requestAnimationFrame(zoneCheckerLoop);
  }
  zoneCheckerLoop();

  window.addEventListener("keydown", function(e) {
    if (e.key === "1" && activeCharacter !== ball) {
      switchTo(ball);
    } else if (e.key === "2" && activeCharacter !== cube) {
      switchTo(cube);
    }
  });
}

function loop(currentTime) {
  let delta = currentTime - lastTime;
  lastTime = currentTime;

  ball.update(delta);
  cube.update(delta);													

  if (ball.cutsceneFinished && !fadeDone) {
    doFadeEffect();
    fadeDone = true;
  }
  
  if (tunnelState === "none" && activeCharacter === ball) {
    let pos = ball.rig.getAttribute("position");
    if (Math.abs(pos.z - 1) < 0.5 && Math.abs(pos.x) < 1) {
      startTunnelCutscene();
    }
  }

  if (tunnelState === "playing") {
    tunnelCutsceneTime += delta;
    let t = tunnelCutsceneTime / tunnelCutsceneDuration;
    if (t > 1) t = 1;
    let pos = ball.rig.getAttribute("position");
    let newZ = tunnelStartZ + (tunnelTargetZ - tunnelStartZ) * t;
    ball.rig.setAttribute("position", `${pos.x} ${pos.y} ${newZ}`);

    if (t >= 1) {
      tunnelState = "ending";
      fadeOut(function() {
        let ballPos = ball.rig.getAttribute("position");
        cube.rig.setAttribute("position", `${parseFloat(ballPos.x) + 2} ${ballPos.y} ${ballPos.z}`);
        cube.rig.setAttribute("visible", "true");
        fadeIn(function() {
          ball.enableControls();
          tunnelState = "none";
        });
      });
    }
  }

  torches.forEach((torch, index) => {
    let fire = fires[index];
    let dist = calculateDistance(ball.rig, torch);
    if (dist < 18) {
      fire.toggleVisibility(true);
    } else {
      fire.toggleVisibility(false);
    }
  });

  requestAnimationFrame(loop);
}

function doFadeEffect() {
  let fadeOverlay = document.createElement("a-plane");
  fadeOverlay.setAttribute("position", "0 0 -0.1");
  fadeOverlay.setAttribute("width", "10");
  fadeOverlay.setAttribute("height", "10");
  fadeOverlay.setAttribute("material", "color: black; opacity: 1");
  activeCharacter.camera.appendChild(fadeOverlay);
  fadeOverlay.setAttribute("animation", "property: material.opacity; from: 1; to: 0; dur: 1000; easing: linear;");
  setTimeout(function() {
    if (fadeOverlay.parentNode) fadeOverlay.parentNode.removeChild(fadeOverlay);
  }, 1000);
}

function fadeOut(callback) {
  let fadeOverlay = document.createElement("a-plane");
  fadeOverlay.setAttribute("position", "0 0 -0.1");
  fadeOverlay.setAttribute("width", "10");
  fadeOverlay.setAttribute("height", "10");
  fadeOverlay.setAttribute("material", "color: black; opacity: 0");
  activeCharacter.camera.appendChild(fadeOverlay);
  fadeOverlay.setAttribute("animation", "property: material.opacity; from: 0; to: 1; dur: 1000; easing: linear;");
  setTimeout(function() {
    if (fadeOverlay.parentNode) fadeOverlay.parentNode.removeChild(fadeOverlay);
    if (callback) callback();
  }, 1000);
}

function fadeIn(callback) {
  let fadeOverlay = document.createElement("a-plane");
  fadeOverlay.setAttribute("position", "0 0 -0.1");
  fadeOverlay.setAttribute("width", "10");
  fadeOverlay.setAttribute("height", "10");
  fadeOverlay.setAttribute("material", "color: black; opacity: 1");
  activeCharacter.camera.appendChild(fadeOverlay);
  fadeOverlay.setAttribute("animation", "property: material.opacity; from: 1; to: 0; dur: 1000; easing: linear;");
  setTimeout(function() {
    if (fadeOverlay.parentNode) fadeOverlay.parentNode.removeChild(fadeOverlay);
    if (callback) callback();
  }, 1000);
}

function startTunnelCutscene() {
  tunnelState = "starting";
  ball.rig.removeAttribute("wasd-controls");
  activateCamera(ball.camera);
  fadeOut(function() {
    ball.rig.setAttribute("position", "0 0 1");
    tunnelStartZ = 1;
    tunnelTargetZ = -26;
    tunnelCutsceneTime = 0;
    cube.rig.setAttribute("visible", "false");
    fadeIn(function() {
      tunnelState = "playing";
    });
  });
}

function switchTo(character) {
  if (activeCharacter) {
    activeCharacter.disableControls();
  }
  character.enableControls();
  activeCharacter = character;
}

function activateCamera(cameraEl) {
  let cameras = scene.querySelectorAll("[camera]");
  cameras.forEach(camEl => {
    camEl.setAttribute("camera", "active", false);
  });
  cameraEl.setAttribute("camera", "active", true);
  scene.camera = cameraEl.getObject3D("camera");
  scene.cameraEl = cameraEl;
}
