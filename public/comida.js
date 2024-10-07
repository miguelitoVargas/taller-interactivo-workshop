class Comida{
  constructor(x,y){
    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })

    this.posX=x
    this.posY=y

    this.life = true
    this.cGraphics = createGraphics(width,height, P2D, gc)

  }
  display(){
    if (this.life) {
      this.cGraphics.noStroke()
      this.cGraphics.fill('red')
      this.cGraphics.circle(this.posX,this.posY, 100)
      this.cGraphics.stroke(0)
    }
  }

  setPos (x, y) {
    this.cGraphics.clear()
    this.posX = x
    this.posY = y
  }

  comido () {
    // this.cGraphics.clear()
    this.life = false
  }

  isAlive () {
    return this.life
  }
}
