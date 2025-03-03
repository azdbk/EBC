// ball.js
class Ball {
  constructor() {
    this.rig = document.createElement("a-entity");
    this.rig.setAttribute("position", "0 0 25");
    
    this.obj = document.createElement("a-sphere");
    this.obj.setAttribute("radius", "1");
    this.obj.setAttribute("color", "blue");
    this.obj.setAttribute("position", "0 2 0");
    this.rig.appendChild(this.obj);
    
    this.camera = document.createElement("a-camera");
    this.camera.setAttribute("position", "0 4 0");
    this.camera.setAttribute("wasd-controls-enabled", "false");
    this.camera.setAttribute("look-controls-enabled", "false");
    
    let cursor = document.createElement("a-cursor");
    cursor.setAttribute("visible", "false");
    this.camera.appendChild(cursor);
    
    this.rig.appendChild(this.camera);
    scene.appendChild(this.rig);
    
    // --- Initial cutscene steps (play on game load) ---
    this.steps = [
      { duration: 900,  targetRotation: { x: 20,   y: 0,       z: 0 } },    // Look down
      { duration: 700,  targetRotation: { x: -10,  y: 0,       z: 0 } },    // Look up
      { duration: 700,  targetRotation: { x: -10,  y: -20,     z: 0 } },    // Turn left
      { duration: 800,  targetRotation: { x: -10,  y: 20,      z: 0 } },    // Turn right
      { duration: 500,  targetRotation: { x: -10,  y: 0,       z: 0 } },    // Return center
      { duration: 500,  targetRotation: { x: 0,    y: 0,       z: 0 } },    // Look straight
      { duration: 1500, targetRotation: { x: -24,  y: 26.565, z: 0 } },    // Rotate to track cube (cube moves in)
      { duration: 3000, targetRotation: { x: -24,  y: 26.565, z: 0 } },    // Hold orientation (cube "talks")
      { duration: 500,  targetRotation: { x: 0,    y: 0,       z: 0 } }     // Look back to center
    ];
    this.currentStep = 0;
    this.elapsedTime = 0;
    this.cameraStartRotation = { x: 0, y: 0, z: 0 };
    
    this.cutsceneFinished = false;
    this.controlsEnabled = false;
	
    this.movementRadius = 5;
	
    
    this.dialogElement = null;
    this.dialogText = "Hello!";
    this.dialogStartTime = 0;
    
    this.room3CutsceneStarted = false;
    this.room3Active = false;
    this.room3Steps = [];
    this.room3CurrentStep = 0;
    this.room3ElapsedTime = 0;
    this.room3CameraStartRotation = { x: 0, y: 0, z: 0 };
  }
  
  update(delta) {
    if (this.room3Active) {
      this.updateRoom3Cutscene(delta);
      return;
    }
    
    if (this.currentStep < this.steps.length) {
      let step = this.steps[this.currentStep];
      this.elapsedTime += delta;
      let t = this.elapsedTime / step.duration;
      if (t > 1) t = 1;
      
      let newRot = {
        x: this.cameraStartRotation.x + (step.targetRotation.x - this.cameraStartRotation.x) * t,
        y: this.cameraStartRotation.y + (step.targetRotation.y - this.cameraStartRotation.y) * t,
        z: this.cameraStartRotation.z + (step.targetRotation.z - this.cameraStartRotation.z) * t
      };
      this.camera.setAttribute("rotation", `${newRot.x} ${newRot.y} ${newRot.z}`);
  
      if (this.currentStep === 6) {
        let startX = -10;
        let endX = -2;
        let newX = startX + t * (endX - startX);
        cube.rig.setAttribute("position", `${newX} 0 21`);
      }
      
      if (this.currentStep === 7) {
        if (!this.dialogElement) {
          this.dialogText = "Hey. You're awake. Let's get to the tunnel.";
          this.dialogElement = document.createElement("a-text");
          this.dialogElement.setAttribute("value", "");
          this.dialogElement.setAttribute("color", "#FFFFFF");
          this.dialogElement.setAttribute("align", "center");
          this.dialogElement.setAttribute("position", "0 -1 -2");
          this.dialogElement.setAttribute("width", "3");
          this.camera.appendChild(this.dialogElement);
          this.dialogStartTime = this.elapsedTime;
        }
        let typeDuration = 2000; // milliseconds to finish typing
        let fraction = Math.min(this.elapsedTime / typeDuration, 1);
        let numChars = Math.floor(this.dialogText.length * fraction);
        let currentValue = this.dialogText.substring(0, numChars);
        this.dialogElement.setAttribute("value", currentValue);
      }
      
      if (this.elapsedTime >= step.duration) {
        if (this.currentStep === 7 && this.dialogElement) {
          this.camera.removeChild(this.dialogElement);
          this.dialogElement = null;
          this.dialogText = "";
          this.dialogStartTime = 0;
        }
        this.camera.setAttribute("rotation", `${step.targetRotation.x} ${step.targetRotation.y} ${step.targetRotation.z}`);
        this.currentStep++;
        this.elapsedTime = 0;
        this.cameraStartRotation = Object.assign({}, step.targetRotation);
      }
    } else {
      if (!this.cutsceneFinished) {
        this.cutsceneFinished = true;
        if (activeCharacter === this && !this.controlsEnabled) {
          this.enableControls();
        }
      }
    }
    
    // --- Trigger the Room3 cutscene once the initial cutscene is done ---
    if (!this.room3CutsceneStarted && this.cutsceneFinished) {
      let pos = this.rig.getAttribute("position");
      // Check if the ball is approximately at position 51 0 -86
      if (Math.abs(pos.x - 51) < 0.5 && Math.abs(pos.z + 86) < 0.5) {
        this.startRoom3Cutscene();
      }
    }
  }
  
  startRoom3Cutscene() {
    this.room3CutsceneStarted = true;
    this.room3Active = true;
    // Define the room3 cutscene steps as provided
    this.room3Steps = [
      { duration: 900, targetRotation: { x: 0,   y: 0,  z: 0 } },    // Starting point (look straight)
      { duration: 700, targetRotation: { x: -10, y: -20, z: 0 } },    // Turn left
      { duration: 700, targetRotation: { x: -10, y: 20,  z: 0 } },    // Turn right
      { duration: 500, targetRotation: { x: 0,   y: 0,   z: 0 } },    // Return to center
      { duration: 2000, targetRotation: { x: 0,   y: 180, z: 0 } }     // Turn 180 degrees backward
    ];
    this.room3CurrentStep = 0;
    this.room3ElapsedTime = 0;
    this.room3CameraStartRotation = Object.assign({}, this.camera.getAttribute("rotation"));
    // Disable controls during the cutscene
    this.disableControls();
  }
  
  updateRoom3Cutscene(delta) {
    if (this.room3CurrentStep >= this.room3Steps.length) {
      // Cutscene finished: re-enable controls.
      this.room3Active = false;
      this.enableControls();
      return;
    }
    let step = this.room3Steps[this.room3CurrentStep];
    this.room3ElapsedTime += delta;
    let t = this.room3ElapsedTime / step.duration;
    if (t > 1) t = 1;
    let newRot = {
      x: this.room3CameraStartRotation.x + (step.targetRotation.x - this.room3CameraStartRotation.x) * t,
      y: this.room3CameraStartRotation.y + (step.targetRotation.y - this.room3CameraStartRotation.y) * t,
      z: this.room3CameraStartRotation.z + (step.targetRotation.z - this.room3CameraStartRotation.z) * t
    };
    this.camera.setAttribute("rotation", `${newRot.x} ${newRot.y} ${newRot.z}`);
    if (this.room3ElapsedTime >= step.duration) {
      this.camera.setAttribute("rotation", `${step.targetRotation.x} ${step.targetRotation.y} ${step.targetRotation.z}`);
      this.room3CurrentStep++;
      this.room3ElapsedTime = 0;
      this.room3CameraStartRotation = step.targetRotation;
    }
  }
  
  enableControls() {
    this.rig.setAttribute("wasd-controls", "acceleration: 100");
    this.rig.setAttribute("look-controls", "pointerLockEnabled: false");
    activateCamera(this.camera);
    let cursor = this.camera.querySelector("a-cursor");
    if (cursor) cursor.setAttribute("visible", "true");
    this.controlsEnabled = true;
  }
  
  disableControls() {
    this.rig.removeAttribute("wasd-controls");
    this.rig.removeAttribute("look-controls");
    this.camera.setAttribute("camera", "active", false);
    let cursor = this.camera.querySelector("a-cursor");
    if (cursor) cursor.setAttribute("visible", "false");
    this.controlsEnabled = false;
  }
}
