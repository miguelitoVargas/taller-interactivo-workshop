let proximityThreshold = 100
let brightnessLevel = 0.7 // 🔧 entre 0.3 (más oscuro) y 1.0 (brillante)

class Medusas {
  constructor (w, h) {
    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })

    this.medusas = []
    this.pGraphics = createGraphics(w, h, P2D, gc)

    this.pGraphics.noStroke()
    this.pGraphics.colorMode(HSB, 360, 100, 100, 100)
    this.pGraphics.frameRate(30)

    this.medusas.push(
      new Creature(
        createVector(width / 2, height / 2),
        20,
        20,
        10,
        60,
        10,
        3,
        color(random(160, 190), 80, 90 * brightnessLevel, 20) // menor brillo y alfa
      )
    )
  }
  display () {
    this.pGraphics.background(0, 0, 0, 25)
    this.pGraphics.blendMode(ADD)

    for (const medusa of this.medusas) {
      medusa.update(mouseX, mouseY)
      medusa.draw(this.pGraphics)
    }
    this.pGraphics.blendMode(BLEND)

  }
}


class TentaclePart {
  constructor() {
    this.position = createVector(0, 0)
    this.width = 0
    this.height = 0
    this.clr = color(180, 100, 100, 100)
  }
}


class Tentacle {
  constructor(pos, nb, w, h, o, c, clr) {
    this.position = pos.copy()
    this.nbParts = nb
    this.compactness = c
    this.orientation = o
    this.tentacleColor = clr
    this.parts = []

    for (let i = 0; i < nb; i++) {
      let part = new TentaclePart()
      part.width = ((nb - i) * w) / nb
      part.height = ((nb - i) * h) / nb
      part.position = pos.copy()
      part.position.x += c * i * cos(o)
      part.position.y += c * i * sin(o)
      part.clr = color(
        hue(clr),
        saturation(clr),
        brightness(clr) - i * 0.5,
        35 // 🔧 más transparencia para menos brillo
      )
      this.parts.push(part)
    }
  }

  update() {
    let pos0 = this.parts[0].position
    let pos1 = this.parts[1].position
    pos0.set(this.position)
    pos1.x = pos0.x + this.compactness * cos(this.orientation)
    pos1.y = pos0.y + this.compactness * sin(this.orientation)
    for (let i = 2; i < this.nbParts; i++) {
      let currentPos = this.parts[i].position.copy()
      let distVec = p5.Vector.sub(currentPos, this.parts[i - 2].position)
      let distmag = distVec.mag()
      let pos = this.parts[i - 1].position.copy()
      let move = distVec.copy().mult(this.compactness).div(distmag)
      pos.add(move)
      this.parts[i].position.set(pos)
    }
  }

  draw(graphics) {
    for (let i = this.nbParts - 1; i >= 0; i--) {
      let part = this.parts[i]
      graphics.fill(part.clr)
      graphics.ellipse(part.position.x, part.position.y, part.width, part.height)
    }
  }
}


class Creature {
  constructor(pos, rx, ry, nb, l, ts, td, clr) {
    this.position = pos.copy()
    this.radX = rx
    this.radY = ry
    this.orientation = 0
    this.nbTentacles = nb
    this.tentaclesLength = l
    this.headClr = clr
    this.tentacles = []
    this.state = "Wander"

    for (let i = 0; i < nb; i++) {
      let tx = this.position.x + cos((i * TWO_PI) / nb) * (rx / 2)
      let ty = this.position.y + sin((i * TWO_PI) / nb) * (ry / 2)
      let tr = atan2(ty - this.position.y, tx - this.position.x)
      this.tentacles.push(new Tentacle(createVector(tx, ty), l, ts, ts, tr, td, clr))
    }
  }

  update(targetX, targetY) {
    let d = dist(targetX, targetY, this.position.x, this.position.y)
    // this.position.add(createVector(random(-1, 1), random(-1, 1)))


    if (this.state === "Wander") {
      this.position.add(createVector(random(-1, 1), random(-1, 1)))
      if (d < 150) this.state = "Avoid"
    } else if (this.state === "Avoid") {
      if (d < 100) {
        let a = atan2(this.position.y - targetY, this.position.x - targetX)
        this.position.x += cos(a) * 2
        this.position.y += sin(a) * 2
      } else {
        this.state = "Approach"
      }
    } else if (this.state === "Approach") {
      if (d < 100) this.state = "Avoid"
      else if (d < 300) {
        this.position.x += (targetX - this.position.x) * 0.02
        this.position.y += (targetY - this.position.y) * 0.02
      } else {
        this.state = "Wander"
      }
    }

    for (let i = 0; i < this.nbTentacles; i++) {
      let t = this.tentacles[i]
      t.position.x = this.position.x + cos((i * TWO_PI) / this.nbTentacles + this.orientation) * (this.radX / 2)
      t.position.y = this.position.y + sin((i * TWO_PI) / this.nbTentacles + this.orientation) * (this.radY / 2)
      t.orientation = atan2(t.position.y - this.position.y, t.position.x - this.position.x)
      t.update()
    }

    this.orientation += random(-3, 3) * radians(0.1)
  }

  draw(graphics) {
    graphics.push()
    // drawingContext.shadowBlur = 10 // 🔧 antes 20 → menos resplandor
    // drawingContext.shadowColor = this.headClr
    graphics.fill(this.headClr)
    graphics.ellipse(this.position.x, this.position.y, this.radX * 2, this.radY * 2)
    for (let t of this.tentacles) {
      t.draw(graphics)
    }
    graphics.pop()
  }
}
