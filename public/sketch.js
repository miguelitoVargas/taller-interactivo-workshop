// deshabilitar el log de ciertos errores para performance
p5.disableFriendlyErrors = true
// OSC
let port = 8081
let socket


// Dandelion
let dandelion

let plants = []

// dandelion vars
let blowing = false
let wind = 0

// backgrounds
let desert
let landscape
let mediumDesert
// desert || landscape || medium
let currentEcoState = 'desert'

// plant max | min in each state
const desertPMax = 5
const mediumDesertPMax = 10
const landscapePMin = 5

const numberOfSeeds = 60
// videos
let hongoVid

let isPlaying = false

// 240:320
const videoSizes = {
  flowerVideos:  {
    0: [120, 160],
    1: [240, 320],
    2: [80, 107],
    3: [60, 80],
    4: [30, 40],
  },
  plantVideos: {
    0: [120, 160],
    1: [240, 320],
    2: [80, 107],
    3: [480, 640],
  }
}

const videoTypes = ['flowerVideos', 'plantVideos']
// const videoSizes = {
//   0: [120, 160],
//   1: [240, 320],
//   2: [80, 107],
//   3: [60, 80],
//   4: [30, 40],
// }

// fondos
let backGr

function preload () {
  desert = loadImage('assets/deforest.jpg')
  landscape = loadImage('assets/landscape.png')
  mediumDesert = loadImage('assets/deforestMedium.png')
}

function setup() {
  // createCanvas(displayWidth, displayHeight)
  createCanvas(windowWidth, windowHeight)

  backGr = createGraphics(width, height)

  // hongoVid = createVideo('assets/hongo2.webm')
  // hongoVid.hide()
  // hongoVid.stop()

  // console.log(hongoVid)
  dandelion = new Dandelion(numberOfSeeds, seedHandler)

  socket = new osc.WebSocketPort({
    url: 'ws://localhost:' + port
  })
  socket.on('message', handleOsc)
  socket.open()
}

function draw() {
  backGr.push()
  if (plants.length <= desertPMax) {
    // currentEcoState = 'desert'
    backGr.tint(255, map(plants.length, 0, desertPMax, 100, 0))
    backGr.image(desert, 0, 0, width, height)

    backGr.tint(255, map(plants.length, 0, desertPMax, 0, 100))
    backGr.image(mediumDesert, 0, 0, width, height)
  } else if (plants.length > desertPMax && plants.length <= mediumDesertPMax) {
    // currentEcoState = 'mediumDesert'
    backGr.tint(255, map(plants.length, desertPMax, mediumDesertPMax, 100, 0))
    backGr.image(mediumDesert, 0, 0, width, height)
    backGr.tint(255, map(plants.length, desertPMax, mediumDesertPMax, 0, 100))
    backGr.image(landscape, 0, 0, width, height)

  } else if (plants.length > landscapePMin) {
    // currentEcoState = 'landscape'
    // tint(255, map(plants.length, 80, 120, 0, 100))
    backGr.image(landscape, 0, 0, width, height)

  }
  backGr.pop()
  image(backGr, 0, 0)


  dandelion.show()
  strokeWeight(1)

  if (plants.length) {
    plants = plants.filter(p => !p.isDead)
  }

  for (const p of plants) {
    p.update()
    p.show()
    image(p.plantGr, p.px, p.py - p.plant.height)
  }

  if (plants.length <= desertPMax) {
    currentEcoState = 'desert'
  } else if (plants.length > desertPMax && plants.length <= mediumDesertPMax) {
    currentEcoState = 'mediumDesert'
  } else if (plants.length > landscapePMin) {
    currentEcoState = 'landscape'
  }
}

function handleOsc (msg) {
  // print(msg)

  if (msg.address === '/mic') {
    const b = msg.args[0]
    const mWind =map(b, 0, 170, -20, 60)
    // console.log('wind', mWind, b)
    wind = mWind

    if (mWind >= 6) {
      blowing = true
      // wind = map(b, 50, 130, 10, 60)
    } else {
      blowing = false
      // wind = map(b, 0, 50, 0, 9)
      // console.log('oe', b, wind)
    }

    // wind = 0
    // blowing = false

  }
}

function mousePressed () {
  const f = random(10, 60)
  wind = 60
  // console.log('seed count', dandelion.seeds.length, 'plants', plants.length )
  setTimeout(() => {
    wind = 0

  }, 1000)
}

function keyPressed () {
  key === 'f' && (fullscreen(true))
}

function seedHandler (px, py) {
  // console.log(px)
  // probabilidad de nacer dependiendo
  // del estado del ecosistema
  const prob = Math.random()
  // const willGrow = currentEcoState === 'desert' ? prob <= 0.2 : prob <= 0.8
  let willGrow = false

  if (currentEcoState === 'desert') {
    willGrow = prob <= 0.2

  } else if (currentEcoState === 'mediumDesert') {
    willGrow = prob <= 0.4
  } else if (currentEcoState === 'landscape') {
    willGrow = prob <= 0.7 //true
  }

  const plantTimes = {
    desert: 20,
    mediumDesert: 25,
    landscape: 30
  }
  // console.log('will hatch', willGrow, plantTimes[currentEcoState])
  willGrow && plants.push(new Plant(px, py, plantTimes[currentEcoState], random(videoTypes)))
}

class Plant {
  constructor (px, py, life, type) {
    this.px = px
    this.py = py
    this.life = life
    this.maxLife = life
    this.isDead = false
    this.isPlaying = false

    const sizes = videoSizes[type]

    // const vidSize = random(Object.keys(sizes))
    const vidSize = sizes[floor(random(Object.keys(sizes).length - 0.3))]
    // console.log('size', vidSize)
    // const vidSize = videoSizes[floor(random(Object.keys(videoSizes).length - 1))]
    console.log(vidSize, type)
    const videos = {
      plantVideos:['assets/Arbusto-1.webm', 'assets/Arbusto-2.webm', 'assets/Arbusto-3.webm'],
      flowerVideos: ['assets/hongo2.webm', 'assets/lavanda.webm', 'assets/ruda.webm', 'assets/lantana.webm']
    }
    // const flowerVideos = ['assets/hongo2.webm', 'assets/lavanda.webm', 'assets/Arbusto-1.webm', 'assets/Arbusto-2.webm', 'assets/Arbusto-3.webm']

    this.plant = createVideo(random(videos[type]))
    this.plant.size(vidSize[0], vidSize[1])
    this.plant.hide()
    this.plant.stop()

    this.plantGr = createGraphics(vidSize[0], vidSize[1])
    // console.log(this.life, life)

    this.interval = setInterval(() => {
      this.life--
      // console.log('gono', this.life)
    }, 1000)
  }
  update () {
    if (this.life <= 0) {
      // console.log('kill me')
      clearInterval(this.interval)
      this.interval = null
      this.isDead = true
    }

  }
  show () {
    // stroke('red')
    // line(this.px, height, this.px, height - 100)
    // if (!this.isPlaying) this.plant.play()
    if (!this.isPlaying) {
      // hongoVid.stop()
      // hongoVid.play()
      this.plant.play()
      this.isPlaying = true
    }
    // image(hongoVid, this.px, height - hongoVid.height)
    // push()
    // tint(255, map(this.life, this.maxLife, 0, 255, 0))
    // image(this.plant, this.px, height - this.plant.height)
    // pop()
    // this.plantGr.push()
    // this.plantGr.tint(255, map(this.life, this.maxLife, 0, 255, 0))
    // this.plantGr.tint(255, 6)
    this.plantGr.clear()
    this.plantGr.tint(255, map(this.life, this.maxLife, 0, 255, 0))
    this.plantGr.image(this.plant, 0, 0)
    // this.plantGr.pop()
  }
}
