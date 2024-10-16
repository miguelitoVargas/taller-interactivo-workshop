class Animacion {
  constructor (imgPrefix, ext, numFotos) {

    this.seqFotos = []
    this.numFotos = numFotos

    for (let i= 1; i <= numFotos; i++) {
      // assets/seq/ga_6.png
      const ruta = `${imgPrefix}${i}.${ext}`
      // empujamos cada foto en la secuencia de fotoos
      this.seqFotos.push(loadImage(ruta))
    }
  }
  display (posX, posY) {
    image(this.seqFotos[frameCount%this.numFotos], posX, posY)
  }
}

















