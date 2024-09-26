p5.disableFriendlyErrors = true
//
// OSC
let port = 8081
let socket

// capa inicial de fondo
let fondo
let cielo

// bandada de guacamayas
let birdFlock

// sonidos
let serpienteSonido

// graphics
let gp, mask, serpiente
function preload () {
  fondo = loadImage('assets/fondo.png')
  serpienteSonido = loadSound('assets/serpiente.mp3')
}

let sx = 0
function setup() {
  // createCanvas(1600, 900, WEBGL)
  createCanvas(displayWidth, displayHeight, WEBGL)
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
  // cielo = new Cielo()
  // cielo.generate()

  gp = createGraphics(640, 360, WEBGL)
  gp.translate(-320, -180)
  fondo.resize(640, 360)
  // instancia de serpiente
  serpiente = new Serpent(fondo.width, fondo.height)

  // mask = createGraphics(fondo.width, fondo.height)
  // mask.translate(-320, -180)
  // mask.translate(-width/2, -height/2)
  // mask.background('black')
  // fondo.mask(mask)
}

function draw() {
  frameRate(15)
  // mask.frameRate(5)
  translate(-width/2, -height/2)
  colorMode(RGB)
  fill(135, 206, 250)
  rect(0, 0, width, height)
  // if (mouseIsPressed) {
  //   cielo.generate()
  // }
  // cielo.generate()

  // dibuja el cielo
  // image(cielo.buffer, 0, 0, width, height)

  // imagenes de fondo
  image(fondo, 0, 0, width, height)
  // image(gp, 0, 0, width, height)
  serpiente.display()

  let p = pgMask(fondo, serpiente.sGraphics)
  image(p, 0, 0, width, height)
  // image(serpiente.sGraphics, 0, 0, width, height)
  // bandada de guacamayas
  birdFlock.display()



  // mascara serpiente
  // sx += 5
  // mask.clear()
  // mask.reset()
  // mask.clear()
  // mask.translate(-320, -180)
  // mask.fill(255)
  // mask.noStroke()
  // mask.circle(sx, 180, 10)


  
  // gp.clear()
  // gp.translate(-320, -180)
  // const backs = ['red', 'green', 'blue']
  // gp.background(random(backs))
  // gp.loadPixels()
  // mask.loadPixels()

  // for (let x = 0; x < 640; x++) {
  //   for (let y = 0; y < 360; y++) {
  //     const loc = (x + y * 640) * 4

  //     const mr = mask.pixels[loc]
  //     const mg = mask.pixels[loc + 1]
  //     const mb = mask.pixels[loc + 2]
  //     const ma = mask.pixels[loc + 3]

  //     const gr = gp.pixels[loc]
  //     const gg = gp.pixels[loc + 1]
  //     const gb = gp.pixels[loc + 2]
  //     const ga = gp.pixels[loc + 3]

  //     const mColor = color(mr, mg, mb, ma)
  //     const mBr = brightness(mColor)

  //     if (mBr > 90) {
  //       gp.pixels[loc] = gr
  //       gp.pixels[loc + 1] = gg
  //       gp.pixels[loc + 2] = gb
  //       gp.pixels[loc + 3] = 255
  //     } else {
  //       gp.pixels[loc] = gr
  //       gp.pixels[loc + 1] = gg
  //       gp.pixels[loc + 2] = gb
  //       gp.pixels[loc + 3] = 0
  //     }
  //   }
  // }

  // gp.updatePixels()
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

function pgMask(_content,_mask){
  //Create the mask as image
  var img = createImage(_mask.width,_mask.height);
  img.copy(_mask, 0, 0, _mask.width, _mask.height, 0, 0, _mask.width, _mask.height);
  //load pixels
  img.loadPixels();
  for (var i = 0; i < img.pixels.length; i += 4) {
    // 0 red, 1 green, 2 blue, 3 alpha
    // Assuming that the mask image is in grayscale,
    // the red channel is used for the alpha mask.
    // the color is set to black (rgb => 0) and the
    // alpha is set according to the pixel brightness.
    var v = img.pixels[i];
    img.pixels[i] = 0;
    img.pixels[i+1] = 0;
    img.pixels[i+2] = 0;
    img.pixels[i+3] = v;
  }
  img.updatePixels();

  //convert _content from pg to image
  var contentImg = createImage(_content.width,_content.height);
  contentImg.copy(_content, 0, 0, _content.width, _content.height, 0, 0, _content.width, _content.height);
  // create the mask
  contentImg.mask(img)
  // return the masked image
  return contentImg;
}
