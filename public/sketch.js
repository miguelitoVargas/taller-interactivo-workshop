// deshabilitar el log de ciertos errores para performance
p5.disableFriendlyErrors = true
//
// OSC
let port = 8081
let socket

let comida
let numComidas = 0

// capa inicial de fondo
let fondo, currentFondo, currentMascara
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

// arbol
let arbol

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

  comida = new Comida(random(width),random(height))

  currentMascara = random(fondos)
  currentFondo = fondo

  // arbol
  arbol = new Arbol(width/2, height)
}

function draw() {
  let dx = mouseX - pmouseX
  mouseWindV += dx * mDamp
  mouseWindV += (0 - mouseWind) * wDamp
  mouseWindV *= mFriction
  mouseWind += mouseWindV

  if (frameCount%1000 === 0) {
    cielo.generate()
   // comida.comido()
  }


  // cielo.generate()
  // dibuja el cielo
  image(cielo.buffer, 0, 0, width, height)


  // imagenes de fondo
  image(currentFondo, 0, 0, width, height)

  // serpiente
  serpiente.display()
  const sxMapped = map(serpiente.pointX, 0, fWidth, 0, width)
  const syMapped = map(serpiente.pointY, 0, fHeight, 0, height)

  const dComida = dist(sxMapped, syMapped, comida.posX, comida.posY)
  if (parseInt(dComida) <= 20){
    //comida.comido()
    comida.setPos(random(width), random(height))
    numComidas++
  }

  if (numComidas === 2) {
    numComidas = 0
    comida.setPos(random(width), random(height))
    //comida.comido()
    currentFondo = currentMascara
    currentMascara = random(fondos)
    serpiente.sGraphics.clear()
  }


  // mascara de opacidad
  sMask.copy(currentMascara, 0, 0, fWidth, fHeight, 0, 0, fWidth, fHeight)
  sMask.mask(serpiente.sGraphics)
  image(sMask, 0, 0, width, height)

  // bandada de guacamayas
  birdFlock.display()

  // arbol
  arbol.display()

  if (comida.isAlive()) {
    comida.display()
    image(comida.cGraphics, 0 ,0)

  }

  // image(serpiente.sGraphics, 0, 0, 500, 500)

  textSize(50)
  fill(0)
  text("fps = " + round(frameRate()), 50, 50)
  // text("dComida = " + parseInt(dComida), 50, 150)
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
