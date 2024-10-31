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
    this.follaje = null

  }
  cargar () {
    for (let i = 1; i <=3; i++) {
      // c1.png, c2.png
      this.alimento.push(loadImage(`assets/Alimento/c${i}.png`))
    }
    this.currentAlimento = random(this.alimento)
    this.follaje = loadImage('assets/Alimento/follaje.png')

  }
  display(){
    if (this.life) {
      image(this.follaje, this.posX - 25, this.posY - 25, 150, 150)

      image(this.currentAlimento, this.posX, this.posY, 100, 100)
      // fill('red')
      // circle(this.posX + 50, this.posY + 50, 20, 20)
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
