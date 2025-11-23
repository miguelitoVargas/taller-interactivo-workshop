// deshabilitar el log de ciertos errores para performance
// p5.disableFriendlyErrors = true
// OSC
let port = 8081
let socket
let capture
let bodyPose
let poses = []
let skeletons = []
let poseMovements = {}

const vidScale = 3
let W = 16;
let R = 4;
let grid

let scrWidth = 1920 / vidScale;
let scrHeight = 1080 / vidScale;
// https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection

// nodes grid
let nodeArray = []
let linkArray = []

// medusas
let medusas
let medusa

function preload () {
// let options = { maxFaces: 1, refineLandmarks: false, flipped: false };
  //
  // bodyPose
  bodyPose = ml5.bodyPose('MoveNet', {
    modelUrl: '/t-model',
    flipped: true
  })
 // bodyPose = ml5.faceMesh(options);


}

async function setup() {
  // const m = min(windowWidth, windowHeight)
  // createCanvas(m, m)
  createCanvas(windowWidth, windowHeight)
  // createCanvas(displayWidth, displayHeight)
  // createCanvas(1920, 1080)


  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()
  // grid = new Grid(parseInt(scrWidth / W), parseInt(scrHeight / W));

  // capture
  await navigator.mediaDevices.getUserMedia({ video: true })

  const devices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(d => d.kind === 'videoinput')
  console.log(videoDevices)
  const sense = videoDevices.find(d => !!d.label.match('RGB Module RGB'))
  console.log(videoDevices)

  const device = !!sense ? sense : videoDevices[0]
  console.log(device)
  capture = createCapture({
    video: {
      deviceId: { exact: device.deviceId }
    },
    audio: false
  },
  {
    flipped: true
  }, () => {
    console.log('camera ready!')
  })
  capture.size(width/vidScale, height/vidScale)
  capture.hide()
  bodyPose.detectStart(capture, gotPoses)

  speedLimit = (width / gridCount) * 1.5;

  nodeArray = createNodes();
  linkArray = createLinks(nodeArray);

  // medusas
  // medusas = new Medusas(width, height)
  medusa = new Creature(
    // createVector(width / 2, height / 2),
    20,
    20,
    10,
    40,
    10,
    3,
    color(random(160, 190), 80, 90 * brightnessLevel, 20) // menor brillo y alfa
  )
}

function draw() {
  background(0)
  if (!capture) return

  // medusas
  // medusas.display()
  // tint(255, 128)
  // image(capture, 0, 0, width, height)
  // mouseIsPressed && grabNodesNearMouse();
  medusa.update(mouseX, mouseY)
  medusa.draw()


  linkArray.forEach((link) => link.update());
  nodeArray.forEach((node) => node.update());
  linkArray.forEach((link) => link.show());
  // grid.tick(poses);
  // grid.draw();
  drawMarkers(poses)

  getPoseMovementsAndRipple(poses)

  image(medusa.pGraphics, width/2, height/2)
  // image(medusas.pGraphics, 0, 0)
  // mouseIsPressed && grabNodesNearMouse()

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

function getPoseMovementsAndRipple (poses) {
  if (!poses.length) return

  for (const p of poses) {
    !poseMovements[p.id] && (poseMovements[p.id] = {
      left_wrist: p.left_wrist,
      right_wrist: p.right_wrist,
      left_shoulder: p.left_shoulder,
      right_shoulder: p.right_shoulder
    })
  }

  if (frameCount% 5 === 0) {
    // console.log('gono')
    for (const p of poses) {
      const prevPoint = poseMovements[p.id]
      // console.log(prevPoint.left_wrist.x, p.left_wrist.x)
      // console.log(dist(prevPoint.left_wrist.x, prevPoint.left_wrist.y, p.left_wrist.x, p.left_wrist.y))
      // const prevPos = createVector(prevPoint.left_wrist.x, prevPoint.left_wrist.y)
      // const currentPos = createVector(p.left_wrist.x, p.left_wrist.y)

      // console.log('d', currentPos.dist(prevPos))
      // hubo movimiento en el punto
      if (dist(prevPoint.left_wrist.x, prevPoint.left_wrist.y, p.left_wrist.x, p.left_wrist.y) > 50) {
        grabNodesNearPoint(p.left_wrist.x, p.left_wrist.y)
      }
      if (dist(prevPoint.right_wrist.x, prevPoint.right_wrist.y, p.right_wrist.x, p.right_wrist.y) > 50) {
        grabNodesNearPoint(p.right_wrist.x, p.right_wrist.y)
      }
      if (dist(prevPoint.left_shoulder.x, prevPoint.left_shoulder.y, p.left_shoulder.x, p.left_shoulder.y) > 50) {
        grabNodesNearPoint(p.left_shoulder.x, p.left_shoulder.y)
      }
      if (dist(prevPoint.right_shoulder.x, prevPoint.right_shoulder.y, p.right_shoulder.x, p.right_shoulder.y) > 50) {
        grabNodesNearPoint(p.right_shoulder.x, p.right_shoulder.y)
      }

      poseMovements[p.id] = {
        left_wrist: p.left_wrist,
        right_wrist: p.right_wrist,
        left_shoulder: p.left_shoulder,
        right_shoulder: p.right_shoulder
      }
    }

  }


}

function drawMarkers (poses) {
  if (!poses.length) return

  fill('red')
  for (const pose of poses) {
    const { left_wrist, right_wrist, left_shoulder, right_shoulder } = pose

    if (left_wrist.confidence > 0.2) {
      circle(left_wrist.x * vidScale, left_wrist.y * vidScale, 50)
    }
    if (right_wrist.confidence > 0.2) {
      circle(right_wrist.x * vidScale, right_wrist.y * vidScale, 50)
    }
    if (right_shoulder.confidence > 0.2) {
      circle(right_shoulder.x * vidScale, right_shoulder.y * vidScale, 50)
    }
    if (left_shoulder.confidence > 0.2) {
      circle(left_shoulder.x * vidScale, left_shoulder.y * vidScale, 50)
    }

  }

}

function grabNodesNearPoint (x, y) {
  const point = createVector(x * vidScale, y * vidScale)
  const nodesNearPoint = nodeArray.filter(
    (node) => node.pinned == false && point.dist(node.pos) < 70
  );
  nodesNearPoint.forEach((node) => {
    node.pos = point.copy()
    node.color = color(255, 255, 0)
    setTimeout(() => {
      node.color = color(255, 255, 255)
    }, 3000)
  });
}

function grabNodesNearMouse() {
  const mouse = createVector(mouseX, mouseY);
  const nodesNearMouse = nodeArray.filter(
    (node) => node.pinned == false && mouse.dist(node.pos) < mouseRadius
  );
  nodesNearMouse.forEach((node) => {
    node.pos = mouse.copy()
    node.color = color(255, 255, 0)
    setTimeout(() => {
      node.color = color(255, 255, 255)
    }, 1000)
  });
}
