// OSC
let port = 8081
let socket


// Dandelion
let dandelion

const plants = []

// dandelion vars
let blowing = false
let wind = 0

function setup() {
  createCanvas(windowWidth, windowHeight)

  dandelion = new Dandelion(70, seedHandler)

  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()
}

function draw() {
  background(51)
  dandelion.show()
  strokeWeight(1)

  for (const p of plants) {
    p.show()
  }
}

function handleOsc (msg) {
  // print(msg)

  if (msg.address === '/mic') {
    const b = msg.args[0]

    console.log('wind', b)
    if (b >= 160) {
      blowing = true
      wind = map(b, 160, 4000, 10, 60)
    } else {
      blowing = false
    }

  }
}

function mousePressed () {
  const f = random(10, 60)
  // wind = 60
  console.log('seed count', dandelion.seeds.length)
}

function keyPressed () {
  key === 'f' && (fullscreen(true))
}

function seedHandler (px) {
  // console.log(px)
  plants.push(new Plant(px))
}

class Plant {
  constructor (px) {
    this.px = px
  }
  show () {
    stroke(255)
    line(this.px, height, this.px, height - 100)

  }
}
