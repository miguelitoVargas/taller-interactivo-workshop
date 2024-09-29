// deshabilitar el log de ciertos errores para performance
p5.disableFriendlyErrors = true
//
// OSC
let port = 8081
let socket

// capa inicial de fondo
let fondo, rainforest
// fondos
const fondos = []
const fWidth = 1600
const fHeight = 900

// bandada de guacamayas
let birdFlock

// sonidos
let serpienteSonido

// graphics
let cielo, serpiente, sMask

function preload () {
  fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
  for (let i = 1; i <= 4; i++) {
    fondos.push(loadImage(`assets/fondo-${i}.png`))
  }
}

let sx = 0
function setup() {

  // createCanvas(1600, 900, WEBGL)
  const canvas = document.getElementById('myCanvas')
  canvas.getContext('2d', {
    willReadFrequently: true
  })
  createCanvas(displayWidth, displayHeight, canvas)
  // angleMode(DEGREES)

  // creamos y conectamos el ws con el servidor
  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()

  // instancia de guacamayas
  birdFlock = new BirdFlock()


  // instancia y generacion de un cielo
  cielo = new Cielo()
  cielo.generate()

  // instancia de serpiente
  serpiente = new Serpent(fWidth, fHeight)

  sMask = createImage(fWidth, fHeight)

}

function draw() {
  if (frameCount%1000 === 0) {
    cielo.generate()
  }


  // cielo.generate()
  // dibuja el cielo
  image(cielo.buffer, 0, 0, width, height)


  // imagenes de fondo
  image(fondo, 0, 0, width, height)

  // serpiente
  serpiente.display()


  // mascara de opacidad
  sMask.copy(fondos[3], 0, 0, fWidth, fHeight, 0, 0, fWidth, fHeight)
  sMask.mask(serpiente.sGraphics)
  image(sMask, 0, 0, width, height)

  // bandada de guacamayas
  birdFlock.display()

  textSize(50)
  fill(0)
  text("fps = " + round(frameRate()), 50, 50)
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
  key === 'f' && (fullscreen(true))
}
