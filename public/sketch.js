// deshabilitar el log de ciertos errores para performance
p5.disableFriendlyErrors = true
//
// OSC
let port = 8081
let socket

let comida
let numComidas = 0

// capa inicial de fondo
let fondo, currentFondo, currentMascara, currentMundo
let garden
// fondos
const fondos = []
const fondosP = []
const fWidth = 1600
const fHeight = 900

// bandada de guacamayas
let birdFlock

// sonidos
let serpienteSonido, ambiente
const sonidos = []

// graphics
let cielo, serpiente, sMask

// arbol
let arbol

// animaciones
let gAmarillas, gRojas, rana, mariposa, corocoro, ibis, tucanBlanco, tucanCaribe
const animaciones = []


function preload () {
  // fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
  ambiente = loadSound('assets/audio/ambiente.mp3')

  for (let i = 1; i <= 4; i++) {
    sonidos.push(loadSound(`assets/audio/s${i}.mp3`))
  }

  for (let i = 1; i <= 4; i++) {
    fondos.push(loadImage(`assets/fondo-${i}.png`))
  }

  for (let i = 1; i <= 3; i++) {
    fondosP.push(loadImage(`assets/FondosPixelArt/Fondo${i}.png`))
  }

  // guacamayas amarillas
  gAmarillas = new Animacion('assets/seq/ga_', 'png', 6, 'aereo', 'left')
  animaciones.push(gAmarillas)

  gRojas = new Animacion('assets/seq/grv_', 'png', 6, 'aereo')
  animaciones.push(gRojas)

  rana = new Animacion('assets/RANA/Rana', 'png', 5, 'terrestre', 'left', {
    x: 145,
    y: 100
  })
  animaciones.push(rana)

  mariposa = new Animacion('assets/Mariposa/mar', 'png', 14, 'aereo', 'left', {
    x: 85.8,
    y: 60
  }, 60)
  animaciones.push(mariposa)
  //
  corocoro = new Animacion('assets/corocoroRojo/CR_', 'png', 6, 'aereo', 'left')
  animaciones.push(corocoro)

  ibis = new Animacion('assets/ibisBlanco/IB_', 'png', 6, 'aereo')
  animaciones.push(ibis)

  tucanBlanco = new Animacion('assets/tucanPechiBlanco/TP_', 'png', 6, 'aereo')
  animaciones.push(tucanBlanco)

  tucanCaribe = new Animacion('assets/tucanCaribe/TC_', 'png', 6, 'aereo', 'left')
  animaciones.push(tucanCaribe)
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

  // instancia del garden pixelado
  garden = new PixelGarden()
  garden.initialize()


  // instancia de serpiente
  serpiente = new Serpent(fWidth, fHeight)

  sMask = createImage(fWidth, fHeight)

  comida = new Comida(random(20, width - 100),random(20, height - 100))
  comida.cargar()

  currentMascara = random(fondosP)
  currentFondo = random(fondos)
  currentMundo = 'normal'

  // instancia y generacion de un cielo
  cielo = new Cielo(serpiente.sGraphics)
  cielo.generate()
  // arbol
  arbol = new Arbol(width/2, height)
}

function draw() {

  // genera un cielo cada 1k frames
  if (frameCount%1000 === 0) {
    cielo.generate()
   // comida.comido()
  }

  // mouseIsPressed && cielo.generate()

  // dibuja el cielo
  image(cielo.buffer, 0, 0, width, height)


  // imagenes del fondo actual
  image(currentFondo, 0, 0, width, height)

  // dibuja la serpiente
  serpiente.display()
  // mapea X y Y de la serpiente a el ancho y alto
  const sxMapped = map(serpiente.pointX, 0, fWidth, 0, width)
  const syMapped = map(serpiente.pointY, 0, fHeight, 0, height)

  // mide la distancia entre la comida y la serpiente
  const dComida = dist(sxMapped, syMapped, comida.posX + 50, comida.posY + 50)


  // si la serpiente esta a 20px de distancia ha comido
  // dibujamos la comida en otro punto y sumamos la cuenta de comidas
  if (parseInt(dComida) <= 20){
    //comida.comido()
    comida.setPos(random(20, width - 100), random(20, height - 100))
    numComidas++
  }

  // si van 2 comidas cambiamos de mundo
  if (numComidas === 2) {
    numComidas = 0
    comida.setPos(random(20, width - 100), random(20, height - 100))
    //comida.comido()
    currentFondo = currentMascara
    currentMascara = currentMundo === 'normal' ? random(fondos) : random(fondosP)
    currentMundo = currentMundo === 'normal' ? 'pixel' : 'normal'
    cielo.changeCielo(currentMundo)
    serpiente.sGraphics.clear()
    arbol.resetArbol()
  }


  // mascara de opacidad de la serpiente
  sMask.copy(currentMascara, 0, 0, fWidth, fHeight, 0, 0, fWidth, fHeight)
  sMask.blend(serpiente.sGraphics, 0, 0, serpiente.sGraphics.width, serpiente.sGraphics.height, 0, 0, sMask.width, sMask.height, MULTIPLY)
  sMask.mask(serpiente.sGraphics)

  // dibujamos la imagen de la mascara
  image(sMask, 0, 0, width, height)

  // bandada de guacamayas solo cuando el mundo es el normal
  // currentMundo === 'normal' && ()

  // dibujamos las animaciones actuales
  for (let a of animaciones) {
    a.display()
  }

  // dibujamos el arbol y la bandada de guacmayas en el mundo normal
  // y el jardin pixelado en el mundo pixelado
  if (currentMundo === 'normal') {
    birdFlock.display()
    arbol.display()
  } else {
    garden.update()
    garden.draw()
  }

  // dibujamos la comida
  comida.display()
  image(comida.cGraphics, 0 ,0)

  // animacion guacamayas
  // gAmarillas.display()
  // gRojas.display()
  // image(gAmarillas.aGraphics, 0, 0)


  // image(serpiente.sGraphics, 0, 0, 500, 500)

  textSize(50)
  fill(0)
  text("fps = " + round(frameRate()), 50, 50)
  // text("dComida = " + parseInt(dComida), 50, 150)
}

function handleOsc (msg) {
  console.log('got message: ', msg)
  if (msg.address === '/plant') {
    // cambiamos la direccion de la serpiente de acuerdo al valor
    // arriba, abajo, izquierda, derecha
    serpiente.direccion = msg.args[0]

  } else if (msg.address === '/motion')
    {
      // cambiamos el arbol y tomamos una animacion y sonido aleatorios para mostrar
      randomize()
      const a = random(animaciones)
      a.showAnimacion = true
      const s = random(sonidos)
      s.play()
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
  // key === 'f' && ambiente.loop()

  if (key === 'a') {
    const a = random(animaciones)
    a.showAnimacion = true
    const s = random(sonidos)
    s.play()
  }
}

