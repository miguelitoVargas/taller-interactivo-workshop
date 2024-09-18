// OSC
let port = 8081
let socket

// capa inicial de fondo
let fondo
let cielo

function preload () {
  fondo = loadImage('assets/fondo.png')
}

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL)
  // creamos y conectamos el ws con el servidor
  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()


  cielo = new Cielo()
}

function draw() {
  translate(-width/2, -height/2)
  cielo.generate()
  image(cielo.cieloImg(), 0, 0, width, height)
  image(fondo, 0, 0, width, height)
}

function handleOsc (msg) {
  console.log('got message: ', msg)
}
