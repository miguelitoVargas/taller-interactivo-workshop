class Serpent {
  constructor (w, h) {

    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })

    this.pointX = 400
    this.pointY = 400
    this.circleRadius = 5
    this.xDirection = 1
    this.yDirection = 1
    this.angle = 0.01
    this.w = w
    this.h = h
    this.sGraphics = createGraphics(w, h, P2D, gc)
    this.sGraphics.background(0, 0)
  }

  display () {
    this.angle += 0.5
    this.sGraphics.frameRate(5)
    this.sGraphics.noStroke()

    this.sGraphics.fill(255)
    this.sGraphics.circle(this.pointX, this.pointY, this.circleRadius*5)


    if (keyCode==UP_ARROW){
      //pointY -=2;
      this.yDirection = -1
      this.pointY += 2 * this.yDirection
      this.pointX = this.pointX + this.circleRadius * cos(this.angle)
    }

    else if (keyCode==DOWN_ARROW){
      //pointY +=2;
      this.yDirection = 1
      this.pointY += 2 * this.yDirection

      this.pointX = this.pointX - this.circleRadius * cos(this.angle)
    }

    else if (keyCode==RIGHT_ARROW){

      this.xDirection = 1
      this.pointX += 2 * this.xDirection

      //pointX +=2;
      this.pointY = this.pointY - this.circleRadius * sin(this.angle)
    }
    else if (keyCode==LEFT_ARROW){
      this.xDirection = -1
      this.pointX += 2 * this.xDirection

      //pointX -=2;
      this.pointY = this.pointY - this.circleRadius * sin(this.angle)
    }

    this.pointX > this.w && (this.pointX = 0)
    this.pointX  < 0 && (this.pointX = this.w)
    this.pointY > this.h && (this.pointY = 0)
    this.pointY < 0 && (this.pointY = this.h)
    // return null
  }
}
