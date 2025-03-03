class enemy {
  constructor() {
    this.rig = document.createElement("a-entity");
    
    this.obj = document.createElement("a-box");
    this.obj.setAttribute("width", "1");
    this.obj.setAttribute("height", "1");
    this.obj.setAttribute("depth", "1");
    this.obj.setAttribute("color", "red");
    this.obj.setAttribute("position", "0 0.5 0");
    this.rig.appendChild(this.obj);
  }
 
}