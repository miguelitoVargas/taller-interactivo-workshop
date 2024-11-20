// deshabilitar el log de ciertos errores para performance
p5.disableFriendlyErrors = true
// puntaje
let score = 5
let scoreY
let timeCheck = 0
let timeOff = 15
let timeY = 0
let gameReady, playingGame, ganador, perdedor, intentaDeNuevo = false
let gameText = 'Toca las plantas para comenzar'


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
let serpienteSonido, ambiente, birds
const sonidos = []

// graphics
let cielo, serpiente, sMask

// arbol
let arbol

// animaciones
let gAmarillas, gRojas, rana, mariposa, corocoro, ibis, tucanBlanco, tucanCaribe,
turpialMatico, tangaraEncapuchada, martinPescador, ibisVerde, casiqueCandela,
tangaraSieteColores, bichoFue, tangaraRubicunda, gVerde, barranqueroC, tangaraMulti, barranqueroCoronado

const animaciones = []


function preload () {
  cielo = new Cielo()
  // fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
  ambiente = loadSound('assets/audio/ambiente.mp3')
  birds = loadSound('assets/audio/Birds.mp3')

  for (let i = 1; i <= 4; i++) {
    sonidos.push(loadSound(`assets/audio/s${i}.mp3`))
  }

  for (let i = 1; i <= 6; i++) {
    fondos.push(loadImage(`assets/fondo-${i}.png`))
  }

  for (let i = 1; i <= 4; i++) {
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

  turpialMatico = new Animacion('assets/TurpialMatico/TM_', 'png', 6, 'aereo', 'right')
  animaciones.push(turpialMatico)

  tangaraEncapuchada = new Animacion('assets/TangaraEncapuchada/TE_', 'png', 6, 'aereo', 'right')
  animaciones.push(tangaraEncapuchada)

  martinPescador = new Animacion('assets/MartinPescador/MP_', 'png', 6, 'aereo', 'left')
  animaciones.push(martinPescador)

  ibisVerde = new Animacion('assets/IbisVerde/IV_', 'png', 6, 'aereo', 'left')
  animaciones.push(ibisVerde)

  casiqueCandela = new Animacion('assets/CaciqueCandela/CC_', 'png', 6, 'aereo', 'right')
  animaciones.push(casiqueCandela)

  tangaraSieteColores = new Animacion('assets/TangaraSietecolores/TSC_', 'png', 6, 'aereo', 'right')
  animaciones.push(tangaraSieteColores)

  bichoFue = new Animacion('assets/Bichofue/BF_', 'png', 6, 'aereo', 'left')
  animaciones.push(bichoFue)

  tangaraRubicunda = new Animacion('assets/TangaraRubicunda/TR_', 'png', 6, 'aereo', 'left')
  animaciones.push(tangaraRubicunda)

  gVerde = new Animacion('assets/GuacamayaVerde/GV_', 'png', 6, 'aereo', 'right')
  animaciones.push(gVerde)

  barranqueroC = new Animacion('assets/BarranqueroPechicastano/BP_', 'png', 6, 'aereo', 'left')
  animaciones.push(barranqueroC)

  tangaraMulti = new Animacion('assets/TangaraMulticolor/TM_', 'png', 6, 'aereo', 'right')
  animaciones.push(tangaraMulti)

  barranqueroCoronado = new Animacion('assets/BarranqueroCoronado/BC_', 'png', 6, 'aereo', 'right')
  animaciones.push(barranqueroCoronado)
}

let sx = 0
function setup() {

  // createCanvas(1600, 900, WEBGL)
  const canvas = document.getElementById('myCanvas')
  canvas.getContext('2d', {
    willReadFrequently: true
  })
  createCanvas(windowWidth, windowHeight, canvas)
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
  currentFondo = random(fondos)// fondos[3]//
  currentMundo = 'normal'

  // instancia y generacion de un cielo
  // cielo = new Cielo()
  // cielo.generate()
  // arbol
  arbol = new Arbol(width/2, height)
}

function draw() {

  let tiempo = millis() / 1000

  // genera un cielo cada 1k frames
  if (frameCount%300 === 0) {
    cielo.changeCielo(currentMundo)
   // comida.comido()
  }


  // dibuja el cielo
  image(cielo.currentCielo, 0, 0, width, height)


  // imagenes del fondo actual
  image(currentFondo, 0, 0, width, height)

  if (gameReady && playingGame) {
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
      score++
    }

    // mascara de opacidad de la serpiente
    sMask.copy(currentMascara, 0, 0, fWidth, fHeight, 0, 0, fWidth, fHeight)
    sMask.blend(serpiente.sGraphics, 0, 0, serpiente.sGraphics.width, serpiente.sGraphics.height, 0, 0, sMask.width, sMask.height, MULTIPLY)
    sMask.mask(serpiente.sGraphics)

    // dibujamos la imagen de la mascara
    image(sMask, 0, 0, width, height)
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

  //scoreY +=  //(scoreY + 1) %height
  // if (scoreY >= height) {
  //   score++

  // }

  const t = tiempo - timeCheck
  if (t > timeOff) {
    timeCheck = tiempo
    // score++

    if (playingGame) {
      score--
      timeOff--

      if (timeOff <= 0) {
        intentaDeNuevo = true
        setTimeout(() => {
         resetGame()
        }, 5000)
      }
      if (score <= 0 && !intentaDeNuevo) {
        // eres el peor jugador de snake
        playingGame = false
        perdedor = true
        setTimeout(() => {
         resetGame()
        }, 5000)
      } else if (score === 10 && !intentaDeNuevo) {
        // eres el mejor jugador de snake
        playingGame = false
        ganador = true
        setTimeout(() => {
         resetGame()
        }, 5000)
      }
    }

  }

  if (playingGame) {
    timeY = map(t, 0, timeOff, 0, height)
    gameText = `Puntaje: ${score}`
  } else {
    timeY = height / 2
    gameText = 'Toca las plantas para comenzar'
  }

  textSize(50)
  textAlign(CENTER)
  fill(0)
  if (!perdedor && !ganador) {
    text(gameText, width/2, timeY + timeOff)
  }
  ganador && text('Eres el mejor jugador de snake', width / 2, height / 2)
  perdedor && text('Eres el peor jugador de snake', width / 2, height / 2)
  intentaDeNuevo && text('Casi lo logras, intentalo de nuevo', width / 2, height / 2)
  // text("TOFF :  " + t, 200, 100)
  // text("fps = " + round(frameRate()), 50, 50)
  // text("dComida = " + parseInt(dComida), 50, 150)
}

function handleOsc (msg) {
  console.log('got message: ', msg)
  if (msg.address === '/plant') {
    // cambiamos la direccion de la serpiente de acuerdo al valor
    // arriba, abajo, izquierda, derecha
    serpiente.direccion = msg.args[0]

    !playingGame && gameReady && (playingGame = true)
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
      if (val <= 125) {
        !gameReady && (gameReady = true)
      } else {
        if (gameReady) {
          resetGame()
        }
      }
      // if (val > 0 && val < 125) {
      //   currentFondo = fondos[0]

      // } else if (val > 125 && val < 250) {
      //   currentFondo = fondos[1]


      // } else if (val > 250 && val < 375) {

      //   currentFondo = fondos[2]
      // } else if (val > 375) {

      //   currentFondo = fondos[3]
      // }
    }
}
function keyPressed () {

  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {

    !playingGame && gameReady && (playingGame = true)
  }

  if (key === 'f') {
    fullscreen(true)
    ambiente.loop()
    birds.loop()
  }

  if (key === 'a') {
    const a = random(animaciones)
    a.showAnimacion = true
    const s = random(sonidos)
    !s.isPlaying() && s.play()
  }
}

function resetGame () {
  playingGame = false
  gameReady = false
  timeOff = 15
  perdedor = false
  ganador = false
  intentaDeNuevo = false
  gameText = 'Toca las plantas para comenzar'
  score = 5
  serpiente.sGraphics.clear()
}
