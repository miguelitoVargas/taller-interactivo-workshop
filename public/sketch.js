// deshabilitar el log de ciertos errores para performance
// p5.disableFriendlyErrors = true
// OSC
let port = 8081
let socket
let capture
let bodyPose
let poses = []
let skeletons = []

const vidScale = 3
let W = 5;
let R = 2;
let grid

let scrWidth = 1920 / vidScale;
let scrHeight = 1080 / vidScale;
// https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection
function preload () {
// let options = { maxFaces: 1, refineLandmarks: false, flipped: false };
  //
  // bodyPose
  bodyPose = ml5.bodyPose('MoveNet', {
    modelUrl: '/t-model',
    flipHorizontal: true
  })
 // bodyPose = ml5.faceMesh(options);


}

async function setup() {
  // createCanvas(displayWidth, displayHeight)
  createCanvas(1920, 1080)


  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()
  grid = new Grid(parseInt(scrWidth / W), parseInt(scrHeight / W));

  // capture
  await navigator.mediaDevices.getUserMedia({ video: true })

  const devices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(d => d.kind === 'videoinput')
  console.log(videoDevices)
  const sense = videoDevices.find(d => !!d.label.match('RGB Module RGB'))

  const device = !!sense ? sense : videoDevices[0]
  console.log(device)
  capture = createCapture({
    video: {
      deviceId: { exact: device.deviceId }
    },
    audio: false
  }, () => {
    console.log('camera ready!')
  })
  capture.size(width/vidScale, height/vidScale)
  capture.hide()
  bodyPose.detectStart(capture, gotPoses)
  // skeletons = bodyPose.getSkeleton()
  // console.log('feck', capture)
}

function draw() {
  background(0)
  if (!capture) return

  // image(capture, 0, 0, width, height)
  // console.log('fecka', capture)
  // for (const pose of poses) {
  //   const { box, left_ear } = pose
  //   stroke('red')
  //   noFill()
  //   strokeWeight(5)
    
  //   point(box.xMin * vidScale, box.yMin * vidScale)
  //   rect(box.xMin * vidScale, box.yMin * vidScale, vidScale * (box.xMax - box.xMin), vidScale * (box.yMax - box.yMin))
  //   point(left_ear.x * vidScale, left_ear.y * vidScale)
  // }

  grid.tick(poses);
  grid.draw();

}

function handleOsc (msg) {
  // print(msg)

}

function mousePressed () {
  console.log('poses', poses, 'skel', skeletons)
}

function keyPressed () {
  key === 'f' && (fullscreen(true))
  // key === 'p' && (sample.play())
}

function gotPoses (results) {
  // console.log('got some bodies', results)
  poses = results
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y, 0);
    this.veloZ = 0;
    this.homeZ = 0; 
    this.energy = 0; // intensidad del color
  }

  tick(grid, x, y) {
    const a = createVector();
    if (x > 0) a.add(p5.Vector.sub(grid.p[x - 1][y].pos, this.pos));
    if (x < grid.p.length - 1) a.add(p5.Vector.sub(grid.p[x + 1][y].pos, this.pos));
    if (y > 0) a.add(p5.Vector.sub(grid.p[x][y - 1].pos, this.pos));
    if (y < grid.p[0].length - 1) a.add(p5.Vector.sub(grid.p[x][y + 1].pos, this.pos));

    this.veloZ += a.z * 0.01;
    this.veloZ -= (this.pos.z - this.homeZ) * 0.005;
    this.veloZ -= this.veloZ * 0.01;
    this.pos.z += this.veloZ;


    this.energy = max(0, this.energy - 2);
  }

  draw() {
 
    let base = color(100, 100, 255);
    let highlight = color(100, 100, 255);
    let c = lerpColor(base, highlight, this.energy / 100);
    fill(c);
    noStroke();

    const r = lerp(1, R * 2, this.pos.z + 1);
    ellipse(this.pos.x * vidScale, this.pos.y * vidScale, r, r);
  }
}

class Grid {
  constructor(w, h) {
    this.p = Array.from(Array(w), () => Array(h));
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        this.p[i][j] = new Particle(i * W, j * W);
      }
    }
  }

  tick(bodies) {

    if (mouseIsPressed) {
      const x = int((mouseX + W / 2) / W);
      const y = int((mouseY + W / 2) / W);
      if (this.p[x] && this.p[x][y]) {
        this.p[x][y].pos.z -= 1;
      }
    }


    if (bodies.length > 0) {
      let keypoints = bodies[0].keypoints;
      for (let i = 0; i < this.p.length; i++) {
        for (let j = 0; j < this.p[0].length; j++) {
          let particle = this.p[i][j];
          for (let kp of keypoints) {
            let d = dist(particle.pos.x, particle.pos.y, kp.x, kp.y);
            if (d < 40) { 
              // si está cerca de una parte del cuerpo, genera "hundimiento"
              particle.pos.z -= (20 - d) * 0.01;
              particle.energy = 100;
            }
          }
          particle.tick(this, i, j);
        }
      }
    } else {
     
      for (let i = 0; i < this.p.length; i++) {
        for (let j = 0; j < this.p[0].length; j++) {
          this.p[i][j].tick(this, i, j);
        }
      }
    }
  }

  draw() {
    const dx = (scrWidth - (this.p.length - 1) * W) / 2;
    const dy = (scrHeight - (this.p[0].length - 1) * W) / 2;
    push();
    translate(dx, dy);
    ellipseMode(RADIUS);
    noStroke();
    for (let i = 0; i < this.p[0].length; i++) {
      for (let j = 0; j < this.p.length; j++) {
        this.p[j][i].draw();
      }
    }
    pop();
  }
}
