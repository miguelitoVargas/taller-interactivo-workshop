let autoplay = false
let showsFPS = false;
let clearsBackground = true;
let windEnabled = true;
let rotRange = 10;
let rotDecay = 1.1;
let sizeDecay = 0.7;
let lengthDecay = 0.91;
let levelMax = 8;
let leafLevel = 2;
let leafChance = 0.3;
let branchHue = 50;
let leafHue = 150;
let leafSat = 100;
let mouseWind = 0;
let mouseWindV = 0;
let startLength;
let startSize;
let trunkColor;
let bgColor;
let time = 0;
let lengthRand = 1.0;
let bloomWidthRatio = 0.2;
let bloomSizeAverage = 10;
let mDamp = 0.00002;
let wDamp = 0.003;
let mFriction = 0.98;
let flowerChance = 0.1;
let flowerColor;
let flowerWidth = 10;
let flowerHeight = 20;

let node;

function reset() {
  //background(bgColor);
  // node = new Node(startLength, startSize, rotRange, 0);
}

function randomize() {
  //randomizeBackground();
  randomizeColor();
  rotRange = random(20, 60);
  rotDecay = random(0.9, 1.1);
  startLength = random(20, 80);
  startSize = random(3, 20);
  lengthRand = random(0.0, 0.2);
  leafChance = random(0.3, 0.9);
  sizeDecay = random(0.6, 0.7);
  lengthDecay = map(startLength, 20, 80, 1.1, 0.85);
  leafLevel = int(random(0, 4));
  bloomWidthRatio = random(0.01, 0.9);
  bloomSizeAverage = random(10, 40);
  mDamp = 0.00002;
  wDamp = 0.005;
  mFriction = 0.96;
  flowerWidth = random(5, 15);
  flowerHeight = random(10, 30);
  flowerChance = 0.1;
}

function randomizeBackground() {
  bgColor = color(random(255), random(0, 100), 255);
}

function randomizeColor() {
  branchHue = 21//random(0, 255);
  leafHue = 120//random(0, 255);
  leafSat = 100//random(0, 255);
  flowerColor = color(random(255), random(0, 255), 255);
  if (node) node.randomizeColor();
}

function displayFPS() {
  fill(150);
  let output = "fps=" + int(frameRate());
  text(output, 10, 30);
}

function mousePressed() {
  time = 0;
  randomize();
  // reset();
}

class Node {
  constructor(_len, _size, _rotRange, _level) {
    this.len = _len * (1 + random(-lengthRand, lengthRand));
    this.size = _size;
    this.level = _level;
    this.rot = radians(random(-_rotRange, _rotRange));
    if (this.level < leafLevel) this.rot *= 0.3;
    if (this.level === 0) this.rot = 0;
    this.windFactor = random(0.2, 1);
    this.doesBloom = false;
    if (this.level >= leafLevel && random(1) < leafChance) this.doesBloom = true;
    this.bloomSize = random(bloomSizeAverage * 0.7, bloomSizeAverage * 0.8);
    this.leafRot = radians(random(-180, 180));
    this.flowerScaleT = random(0.8, 1.2);
    this.flowerDelay = int(random(200, 250));
    this.leafDelay = int(random(50, 150));
    this.doesFlower = random(1) < flowerChance;

    let rr = _rotRange * rotDecay;

    if (this.level < levelMax) {
      this.n1 = new Node(this.len * lengthDecay, this.size * sizeDecay, rr, this.level + 1);
      this.n2 = new Node(this.len * lengthDecay, this.size * sizeDecay, rr, this.level + 1);
    }
    this.randomizeColor();
  }

  draw() {
    strokeWeight(this.size);
    scale(1.08 - 1.0 / (15 + this.level * 5)); //El tamaño del arbol.
    push();
  
    stroke(this.branchColor);
    let rotOffset = sin(noise(millis() * 0.000006 * (this.level * 1)) * 100);
    if (!windEnabled) rotOffset = 0;
    rotate(this.rot + (rotOffset * 0.1 + mouseWind) * this.windFactor);
    line(0, 0, 0, -this.len);
    translate(0, -this.len);

    // Dibuja hojas
    if (this.doesBloom) {
      if (this.leafDelay < 0) {
        this.leafScale += (1.0 - this.leafScale) * 0.05;
        fill(this.leafColor);
        noStroke();
        push();
        scale(this.leafScale);
        rotate(this.leafRot);
        translate(0, -this.bloomSize / 2);
        ellipse(0, 0, this.bloomSize * bloomWidthRatio, this.bloomSize);
        pop();
      } else {
        this.leafDelay--;
      }
    }

    // Dibuja flores
    if (this.doesFlower && this.level > levelMax - 3) {
      if (this.flowerDelay < 0) {
        push();
        this.flowerScale += (this.flowerScaleT - this.flowerScale) * 0.1;
        scale(this.flowerScale);
        rotate(this.flowerScale * 3);
        noStroke();
        fill(hue(flowerColor), saturation(flowerColor), this.flowerBright);
        ellipse(0, 0, flowerWidth, flowerHeight);
        rotate(radians(360 / 3));
        ellipse(0, 0, flowerWidth, flowerHeight);
        rotate(radians(360 / 3));
        ellipse(0, 0, flowerWidth, flowerHeight);
        fill(this.branchColor);
        ellipse(0, 0, 5, 5);
        pop();
      } else {
        this.flowerDelay--;
      }
    }

    push();
    if (this.n1) this.n1.draw();
    pop();
    push();
    if (this.n2) this.n2.draw();
    pop();
    pop();
  }

  randomizeColor() {
    this.branchColor = color(branchHue, random(170, 255), random(100, 200));
    this.leafColor = color(leafHue, 100, random(20, 80));
    this.flowerBright = random(200, 255);
    if (this.n1) this.n1.randomizeColor();
    if (this.n2) this.n2.randomizeColor();
  }
}

class Arbol {
  constructor (x, y) {
    this.x = x
    this.y = y
    randomize()
    this.node =  new Node(startLength, startSize, rotRange, 0);
  }
  display () {
    let dx = mouseX - pmouseX
    mouseWindV += dx * mDamp
    mouseWindV += (0 - mouseWind) * wDamp
    mouseWindV *= mFriction
    mouseWind += mouseWindV

    push()
    translate(this.x, this.y)
    this.node.draw()
    pop()
  }
}
