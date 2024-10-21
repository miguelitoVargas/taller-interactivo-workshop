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
    this.alimento = []
    this.currentAlimento = null

  }
  cargar () {
    for (let i = 1; i <=3; i++) {
      // c1.png, c2.png
      this.alimento.push(loadImage(`assets/Alimento/c${i}.png`))
    }
    this.currentAlimento = random(this.alimento)

  }
  display(){
    if (this.life) {
      image(this.currentAlimento, this.posX, this.posY, 100, 100)
      // this.cGraphics.noStroke()
      // this.cGraphics.fill('red')
      // this.cGraphics.circle(this.posX,this.posY, 100)
      // this.cGraphics.stroke(0)
    }
  }

  setPos (x, y) {
    this.cGraphics.clear()
    this.currentAlimento = random(this.alimento)
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
