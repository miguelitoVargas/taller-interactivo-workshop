class Serpent {
  constructor (w, h) {

    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })

    this.pointX = 400
    this.pointY = 400
    this.circleRadius = 5
    this.sDiameter = 25
    this.xDirection = 1
    this.yDirection = 1
    this.angle = 0.01
    this.w = w
    this.h = h
    this.sGraphics = createGraphics(w, h, P2D, gc)
    this.sGraphics.background(0, 0)
    this.tAngle = 3*HALF_PI
    this.tLength = 0
    this.direccion = ''
  }

  display () {
    this.angle += 0.5
    this.tLength = (this.tLength + 2)%15
    // this.sGraphics.frameRate(5)
    this.sGraphics.noStroke()

    this.sGraphics.fill(255)
    this.sGraphics.stroke(255)
    // this.sGraphics.push()
    // this.sGraphics.translate(this.pointX, this.pointY)
    // this.sGraphics.circle(0, 0, this.sDiameter)
    // this.sGraphics.pop()
    this.sGraphics.circle(this.pointX, this.pointY, this.sDiameter)
    this.sGraphics.push()
      // this.sGraphics.strokeWeight(2)
      this.sGraphics.translate(this.pointX, this.pointY)
      // this.sGraphics.line(this.sDiameter/2, 0, this.sDiameter, 0)
      this.sGraphics.rotate(this.tAngle)
      this.sGraphics.point(0, this.sDiameter/2)
      this.sGraphics.line(0, this.sDiameter/2, 0, this.sDiameter/2 + this.tLength)
      this.sGraphics.translate(0, this.sDiameter/2 + this.tLength)
      // this.sGraphics.line(0, 0, cos(QUARTER_PI/2) * 30, 0)
      this.sGraphics.line(0, 0, 8, 8)
      this.sGraphics.line(0, 0, -8, 8)

    this.sGraphics.pop()


    if (keyCode === UP_ARROW || this.direccion === 'arriba'){
      //pointY -=2;
      this.yDirection = -1
      this.tAngle = PI
      this.pointY += 2 * this.yDirection
      this.pointX = this.pointX + this.circleRadius * cos(this.angle)
    }

    else if (keyCode === DOWN_ARROW || this.direccion === 'abajo'){
      // pointY +=2;
       this.yDirection = 1
       this.tAngle = 0
       this.pointY += 2 * this.yDirection
      this.pointX = this.pointX - this.circleRadius * cos(this.angle)
    }

    else if (keyCode === RIGHT_ARROW || this.direccion === 'derecha'){

      this.xDirection = 1
      this.tAngle = 3*HALF_PI
      this.pointX += 2 * this.xDirection
      this.pointY = this.pointY - this.circleRadius * sin(this.angle)
    }
    else if (keyCode === LEFT_ARROW || this.direccion === 'izquierda'){
      this.xDirection = -1
      this.tAngle = HALF_PI
      this.pointX += 2 * this.xDirection
      this.pointY = this.pointY - this.circleRadius * sin(this.angle)
    }

    this.pointX > this.w && (this.pointX = 0)
    this.pointX  < 0 && (this.pointX = this.w)
    this.pointY > this.h && (this.pointY = 0)
    this.pointY < 0 && (this.pointY = this.h)
    // return null
  }
}
