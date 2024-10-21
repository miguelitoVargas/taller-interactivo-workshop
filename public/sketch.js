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

// animaciones
let gAmarillas
let pajX = 0
let pajY = 0



function preload () {
  fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
  for (let i = 1; i <= 4; i++) {
    fondos.push(loadImage(`assets/fondo-${i}.png`))
  }
  // guacamayas amarillas
  gAmarillas = new Animacion('assets/seq/ga_', 'png', 6)
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



  // instancia de serpiente
  serpiente = new Serpent(fWidth, fHeight)

  sMask = createImage(fWidth, fHeight)

  comida = new Comida(random(width),random(height))
  comida.cargar()

  currentMascara = random(fondos)
  currentFondo = fondo

  // instancia y generacion de un cielo
  cielo = new Cielo(serpiente.sGraphics)
  cielo.generate()
  // arbol
  arbol = new Arbol(width/2, height)
}

function draw() {

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

  const dComida = dist(sxMapped, syMapped, comida.posX + 50, comida.posY + 50)
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
  sMask.blend(serpiente.sGraphics, 0, 0, serpiente.sGraphics.width, serpiente.sGraphics.height, 0, 0, sMask.width, sMask.height, MULTIPLY)
  sMask.mask(serpiente.sGraphics)
  // cielo.blendCielo(serpiente.sGraphics)
  image(sMask, 0, 0, width, height)

  // bandada de guacamayas
  birdFlock.display()

  // arbol
  arbol.display()

  // animacion guacamayas
  pajX++
  gAmarillas.display(pajX, pajY)

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
    // if (!serpienteSonido.isPlaying()) {
    //   serpienteSonido.play()
    //   // console.log('plaaaaay')
    // }
    serpiente.direccion = msg.args[0]

  } else if (msg.address === '/motion')
    {
      pajX = random(width)
      pajY = random(height)
      randomize()
    } else if (msg.address === '/distance') {
      const val = msg.args[0]
      if (val > 0 && val < 125) {
        currentFondo = fondos[0]

      } else if (val > 125 && val < 250) {
        currentFondo = fondos[1]


      } else if (val > 250 && val < 375) {

        currentFondo = fondos[2]
      } else if (val > 375) {

        currentFondo = fondos[3]
      }
    }
}
function keyPressed () {
  key === 'f' && fullscreen(true)
}
