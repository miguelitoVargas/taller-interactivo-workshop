p5.disableFriendlyErrors = true
//
// OSC
let port = 8081
let socket

// capa inicial de fondo
let fondo
let cielo

// sonidos
let serpienteSonido

// graphics
let gp, mask
function preload () {
  fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
}

let sx = 0
function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL)

  // creamos y conectamos el ws con el servidor
  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()


  cielo = new Cielo()
  cielo.generate()

  gp = createGraphics(640, 360, WEBGL)
  gp.translate(-320, -180)
  mask = createGraphics(640, 360, WEBGL)
  mask.translate(-320, -180)
  mask.background('black')
}

function draw() {
  // frameRate(15)
  translate(-width/2, -height/2)
  if (mouseIsPressed) {
    cielo.generate()
  }
  image(cielo.cieloImg(), 0, 0, width, height)
  image(fondo, 0, 0, width, height)
  sx += 10
  // mask.clear()
  mask.reset()
  // mask.clear()
  mask.translate(-320, -180)
  mask.fill(255)
  mask.noStroke()
  mask.circle(sx, 180, 10)

  gp.clear()
  gp.translate(-320, -180)
  gp.background('red')
  gp.loadPixels()
  mask.loadPixels()

  for (let x = 0; x < 640; x++) {
    for (let y = 0; y < 360; y++) {
      const loc = (x + y * 640) * 4

      const mr = mask.pixels[loc]
      const mg = mask.pixels[loc + 1]
      const mb = mask.pixels[loc + 2]
      const ma = mask.pixels[loc + 3]

      const gr = gp.pixels[loc]
      const gg = gp.pixels[loc + 1]
      const gb = gp.pixels[loc + 2]
      const ga = gp.pixels[loc + 3]

      const mColor = color(mr, mg, mb, ma)
      const mBr = brightness(mColor)

      if (mBr > 70) {
        gp.pixels[loc] = gr
        gp.pixels[loc + 1] = gg
        gp.pixels[loc + 2] = gb
        gp.pixels[loc + 3] = 255
      } else {
        gp.pixels[loc] = gr
        gp.pixels[loc + 1] = gg
        gp.pixels[loc + 2] = gb
        gp.pixels[loc + 3] = 0
      }
    }
  }

  gp.updatePixels()
  image(gp, 0, 0, width, height)
  // image(mask, 0, 0)
}

function handleOsc (msg) {
  console.log('got message: ', msg)
  if (msg.address === '/plant') {
    if (!serpienteSonido.isPlaying()) {
      serpienteSonido.play()
      // console.log('plaaaaay')

    }
  }
}

function keyPressed () {
  // console.log(key)
  if (key === 'p') {
    // console.log('plaaaaay')
    serpienteSonido.play()
  }
}
