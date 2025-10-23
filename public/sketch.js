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
}

function draw() {
  background(0, 20)
  if (!capture) return

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


