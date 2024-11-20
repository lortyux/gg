let font;
let tSize = 250; // size of text
let tposX = 250; // x position of text
let tposY = 500; // y position of text
let pointCount = 0.8; // 0-1; 0 = few particles, 1 = more particles

let speed = 70; // speed of particles
let comebackSpeed = 1000; // behavior of particles after interaction
let dia = 100; // diameter of interaction
let randomPos = true; // start particles at random positions
let pointsDirection = "down"; // initial direction for points
let interactionDirection = 1; // 1 is pulling, -1 is pushing

let textPoints = [];
let suckedIn = true; // track if particles are sucked in
let currentWord = "hello"; // starting word
let nextWord = "bye"; // word to transform into

// Variables for shake detection
let prevMouseX, prevMouseY;
let shakeThreshold = 450; // set the shake threshold (adjustable)

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  tposX = width / 2 - tSize / 0.9;
  tposY = height / 2 + tSize / 2.9;
  
  setupTextPoints(currentWord);
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function setupTextPoints(word) {
  textPoints = []; // reset text points
  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  console.log(`Setting up text points for word: ${word}`);

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function draw() {
  background(29, 60, 110);

  // Detect if all points are near the mouse to set `suckedIn`
  let allNearMouse = true;
  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();
    
    // Check if each point is close enough to the mouse
    if (dist(mouseX, mouseY, v.pos.x, v.pos.y) > dia / 2) {
      allNearMouse = false;
    }
  }

  // Change to "bye" only when all points are near the mouse
  if (allNearMouse) {
    if (!suckedIn) {
      console.log("All particles are near the mouse, setting `suckedIn` to true");
      suckedIn = true; // Only set suckedIn to true once all particles are near the mouse
    }
  }

  // Check for a shake by calculating the speed of mouse movement
  let mouseSpeed = dist(mouseX, mouseY, prevMouseX, prevMouseY);
  console.log(`Mouse speed: ${mouseSpeed}`);

  // If particles are sucked in and mouse is shaking, change the word to "bye"
  if (suckedIn && mouseSpeed > shakeThreshold) {
    console.log("Shake detected! Releasing particles to form the next word.");
    suckedIn = false;
    setupTextPoints(nextWord); // Set up new text points for "bye"
  }

  // Update previous mouse position
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

// Interact class and methods stay mostly the same, with minor adjustments
function Interact(x, y, m, d, t, s, di, p) {
    this.home = t ? createVector(random(width), random(height)) : createVector(x, y);
    this.pos = this.home.copy();
    this.target = createVector(x, y);

    if (di == "general") {
        this.vel = createVector();
    } else if (di == "up") {
        this.vel = createVector(0, -y);
    } else if (di == "down") {
        this.vel = createVector(0, y);
    } else if (di == "left") {
        this.vel = createVector(-x, 0);
    } else if (di == "right") {
        this.vel = createVector(x, 0);
    }

    this.acc = createVector();
    this.r = 8;
    this.maxSpeed = m;
    this.maxforce = 1;
    this.dia = d;
    this.come = s;
    this.dir = p;
}

Interact.prototype.behaviors = function () {
    let arrive = this.arrive(this.target);
    let mouse = createVector(mouseX, mouseY);
    let flee = this.flee(mouse);

    this.applyForce(arrive);
    this.applyForce(flee);
}

Interact.prototype.applyForce = function (f) {
    this.acc.add(f);
}

Interact.prototype.arrive = function (target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;
    if (d < this.come) {
        speed = map(d, 0, this.come, 0, this.maxSpeed);
    }
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    return steer;
}

Interact.prototype.flee = function (target) {
    let desired = p5.Vector.sub(target, this.pos);
    let d = desired.mag();

    if (d < this.dia) {
        desired.setMag(this.maxSpeed);
        desired.mult(this.dir);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    } else {
        return createVector(0, 0);
    }
}

Interact.prototype.update = function () {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
}

Interact.prototype.show = function () {
    stroke(255);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
  
  function windowResized(){
    resizeCanvas(windowWidth, windowHeight)
  }
}
