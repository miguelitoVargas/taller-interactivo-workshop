
// let wind = 0
// let blowing = false
let clicked = false

// this makes the seeds fade as they float
function opac(flight, t) {
  return map(flight, 0, 60, t, 0);
}

class Dandelion {
  constructor (seedCount, seedCallback) {
    this.seeds = []


    // constants for the shape of the dandelion
    this.receptacleRadius = 15
    this.receptacleLocation = { x: width/2, y: 240 }
    this.stemLocation = { x: width/2, y: 650 }
    this.stemControlA = { x: 3*width/2, y: 0 }
    this.stemControlB = { x: width/2 - 100, y: 800 }

    // popula las semillas
    for (let i = 0; i < seedCount ; i++) {
      this.seeds.push(new Seed(this.receptacleLocation, this.receptacleRadius))
    }

    // this.seeds.push(new Seed(receptacleLocation, receptacleRadius))
    this.seedCallback = seedCallback

    this.blowing = false
  }

  show () {
    //stem
    noFill()
    strokeWeight(5)
    const c = color('#1d330c')
    stroke(c, 195)
    curve(
      this.stemControlA.x,
      this.stemControlA.y,
      this.receptacleLocation.x,
      this.receptacleLocation.y,
      this.stemLocation.x,
      this.stemLocation.y,
      this.stemControlB.x,
      this.stemControlB.y
    )
    // receptacle
    fill(255, 245, 147)
    noStroke()
    ellipse(
      this.receptacleLocation.x,
      this.receptacleLocation.y,
      this.receptacleRadius,
      this.receptacleRadius
    )
    const grav = createVector(0, 0.2)
    // if (mouseIsPressed) {
      // const att = random(10, 60)

      for (const seed of this.seeds) {

        if (wind > seed.attachment) {

          if (seed.free) {
            // let curr = seed.vel.copy()
            // // curr.mult(1 * noise(seed.mass + frameCount * 0.1))
            // curr.set(curr.x *noise(seed.mass + frameCount * 0.1), 0)
            // // curr.setMag(2)
            // seed.applyForce(curr)

          } else {
            const windF = createVector(random(-0.2, 0.2) * noise(seed.mass + frameCount * 0.1), random(-2, 0.2))
            // const windF = createVector(5 + noise(seed.mass + frameCount * 0.1), random(-2, 0.1 ))

            // windF.mult(2)
            const mapMag = map(wind, 10, 60, 1, 2)
            windF.setMag(mapMag)
            seed.applyForce(windF)
            // console.log(seed.vel.copy())
            seed.free = true

          }

          // seed.applyForce(currWind)

        }
      }
    // }
    for (const seed of this.seeds) {
      if (seed.free) {

        // console.log('update', seed.vel)
        let weight = p5.Vector.mult(grav, seed.mass)
        // weight.limit(1)
        seed.applyForce(weight)
        seed.drag(0.4)
        const windF = createVector(random(-0.2, 0.2) * noise(seed.mass + frameCount * 0.001))

        windF.mult(5)
        seed.applyForce(windF)
        let curr = seed.vel.copy()
        // // curr.mult(1 * noise(seed.mass + frameCount * 0.1))
        curr.set(curr.x *noise(seed.mass + frameCount * 0.01), 0)
        const mapMag = map(seed.attachment, 10, 60, 0.01, 1)
        curr.setMag(mapMag)
        // // curr.setMag(2)
        seed.applyForce(curr)
        // seed.applyForce(curr)

        if (seed.pos.y >= height) {
          // console.log('yes', seed.pos)
          if (seed.life) {
            const p = seed.pos.copy()
            // p.mult(0)
            this.seedCallback(p.x)
            seed.life = false

            this.seeds = this.seeds.filter(s => s.life)

          }
        }
      }
      seed.update()
      seed.show()
    }

  }
}

class Seed {
  constructor(origin, originVariance) {
    this.initialAngle = random(2 * Math.PI)
    this.currentAngle = this.initialAngle
    this.targetAngle = this.currentAngle
    this.free = false
    this.attachment = random(10, 60)
    this.flight = 0
    this.life = true
    this.mass = random(1, 4)
    this.qtyFluff = random(15, 20)
    this.stemLength = random(20, 60)
    this.pos = createVector(origin.x + random(-originVariance, originVariance) / 2,origin.y + random(-originVariance, originVariance) / 2,)
    // this.origin = {
    //   x: origin.x + random(-originVariance, originVariance) / 2,
    //   y: origin.y + random(-originVariance, originVariance) / 2,
    // }
    this.fluffWidth = 20
    this.fluffHeight = 10

    this.vel = createVector()
    this.acc = createVector()
  }

  applyForce (force) {
    const f = p5.Vector.div(force, this.mass)
    this.acc.add(f)
    // this.acc.limit(1)
  }

  drag (Cd) {

    // direction of drag
    let drag = this.vel.copy()
    drag.normalize()
    drag.mult(-1)

    const speed = this.vel.magSq()
    drag.setMag(Cd * speed)
    this.applyForce(drag)

  }

  update () {

    this.vel.add(this.acc)
    // this.vel.limit(5)

    this.pos.add(this.vel)
    this.acc.mult(0)

  }

  show() {
    push()
    angleMode(RADIANS)
    if (wind > this.attachment) {
      this.free = true
    }
    if (!this.free) {
      translate(this.pos.x, this.pos.y)
      let agitation = blowing
        ? map(this.attachment - wind, 40, 0, 0.005, 0.1)
        : 0.002
      this.targetAngle = blowing
        ? this.initialAngle +
          noise(agitation * frameCount * 0.2 + this.initialAngle) / 5
        : this.initialAngle +
          noise(frameCount * 0.001 + this.initialAngle) * 0.01
      this.currentAngle =
        this.currentAngle +
        (this.targetAngle - this.currentAngle) / (this.mass * 3)

      rotate(this.currentAngle)
    } else {
      this.targetAngle = Math.PI + noise(this.mass) / Math.PI
      this.currentAngle =
        this.currentAngle +
        (this.targetAngle - this.currentAngle) / (this.mass * 20)

      translate(
        this.pos.x,
        this.pos.y
      )
      // this.flight++
      // translate(
      //   this.pos.x + this.flight * this.mass,
      //   this.pos.y -
      //     this.flight * this.mass * noise(this.mass + frameCount * 0.01)
      // )
      rotate(this.currentAngle)
    }

    //calc draw location parametrically
    //base
    fill(255, 245, 147,40)
    stroke(255, 245, 147,40)
    rectMode(CENTER)
    ellipse(0, 5, 2, 10)

    //stem
    strokeWeight(1)
    stroke(255, 245, 147,60)
    line(0, 0, 0, this.stemLength)
    //fluff
    stroke(255, 245, 147,60)
    for (let i = 0; i < this.qtyFluff; i++) {
      let theta = (2 * Math.PI * i) / this.qtyFluff
      let fluffLength = map(
        abs(sin(theta)),
        0,
        1,
        this.fluffWidth,
        this.fluffHeight
      )

      line(
        0,
        this.stemLength,
        fluffLength * cos(theta),
        this.stemLength + fluffLength * sin(theta)
      )
    }
    pop()
  }
}
