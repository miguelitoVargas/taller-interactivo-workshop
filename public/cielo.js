class Cielo {
  constructor () {
    this.w = 640
    this.h = 360
    this.zoff = 0
    this.yoff = 0
    this.xoff = 0
    // this.buffer = createFramebuffer({
    //   width: this.w,
    //   height: this.h
    // })
    this.buffer = createImage(this.w, this.h)
  }

  generate () {
    let inc = 0.03

    // this.buffer.reset()
    // clear()
    this.buffer.loadPixels()
    this.yoff = 0
    for (let y = 0; y < this.h; y++) {
      this.xoff = 0
      for (let x = 0; x < this.w; x++) {
        // indice del pixel basado en la posicion
        let index = (x + y * this.w) * 4
        // octaves, falloff in percent
        noiseDetail(8, 0.7)

        // valor de ruido de perlin en 3 dimensiones
        let r = noise(this.xoff, this.yoff, this.zoff) * 255

        this.buffer.pixels[index] = r //135
        this.buffer.pixels[index + 1] = r //206
        this.buffer.pixels[index + 2] = r //250
        this.buffer.pixels[index + 3] = r
        this.xoff += inc

      }
      this.yoff += inc
      this.zoff += 0.00006

    }


    this.buffer.updatePixels()
  }

  cieloImg () {
    const cImage = createImage(this.w, this.h)
    return cImage.copy(this.buffer)
  }
}


