class Animacion {
  // prefijo de ruta, extension de foto, numero de fotos
  // tipo de animal, direccion de la animacion, escala de foto, frame rate de la animacion
  constructor (imgPrefix, ext, numFotos, type, direction = 'right', escala = null, rate = 10) {
    const w = window.screen.width
    const h = window.screen.height

    // setea la posicion dependiendo
    // del tipo de animal
    this.posX = random(w/2)
    this.posY = ({
      'aereo': random(h - 300),
      'terrestre': random(h - 500, h - 200)
    })[type]

    // estado visible de la animacion
    this.showAnimacion = false
    this.direction = direction === 'right' ? 1 : -1
    this.seqFotos = []
    this.numFotos = numFotos
    this.escala = escala

    for (let i= 1; i <= numFotos; i++) {
      // assets/seq/ga_6.png
      const ruta = `${imgPrefix}${i}.${ext}`
      const m = loadImage(ruta)

      // empujamos cada foto en la secuencia de fotoos
      this.seqFotos.push(m)
    }

    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })

    // setea el frame de la animacion y el intervalo
    // de paso
    this.currFrame = 0
    setInterval(() => {
      this.currFrame = (this.currFrame + 1)%this.numFotos

    }, 1000 / rate)


    // this.aGraphics = createGraphics(window.screen.width, window.screen.height, P2D, gc)
  }
  display () {
    // this.aGraphics.clear()
    // this.aGraphics.frameRate(10)
    // this.aGraphics.image(this.seqFotos[frameCount%this.numFotos], posX, posY)
    if (this.showAnimacion) {

      this.posX++
      // if (this.direction === 'right') {
      //   this.posX++
      // } else {
      //   this.posX--
      // }

      if (!this.escala) {
        if (this.direction === 1) {
          image(this.seqFotos[this.currFrame], this.posX, this.posY)

        } else {
          push()
          translate(width, 0)
          scale(-1, 1)
          image(this.seqFotos[this.currFrame], this.posX, this.posY)
          pop()

        }

      } else {
        if (this.direction === 1) {
          image(this.seqFotos[this.currFrame], this.posX, this.posY, this.escala.x, this.escala.y)

        } else {
          push()
          translate(width, 0)
          scale(-1, 1)
          image(this.seqFotos[this.currFrame], this.posX, this.posY, this.escala.x, this.escala.y)
          pop()

        }
      }

      // si la animacion se sale de la ventana
      // resetear la posicion y borrarla de la pantalla
      if (this.posX > width || this.posX < 0) {
        this.posX = random(width)
        this.direction = -this.direction
        this.showAnimacion = false
      }

    }
    // image(this.seqFotos[frameCount%this.numFotos], posX, posY)
    // image(this.aGraphics, 0, 0, width, height)
  }
}

















