class Cielo {
  constructor () {
    this.w = 960
    this.h = 540
    this.zoff = 0
    this.yoff = 0
    this.xoff = 0
    this.buffer = createFramebuffer({
      width: this.w,
      height: this.h
    })
  }

  generate () {
    let inc = 0.03

    clear()
    this.buffer.loadPixels()
    this.yoff = 0
    for (let y = 0; y < this.h; y++) {
      this.xoff = 0
      for (let x = 0; x < this.w; x++) {
        // indice del pixel basado en la posicion
        let index = (x + y * this.w) * 4
        // octaves, falloff in percent
        noiseDetail(12, 0.5)

        // valor de ruido de perlin en 3 dimensiones
        let r = noise(this.xoff, this.yoff, this.zoff) * 255

        this.buffer.pixels[index] = 135
        this.buffer.pixels[index + 1] = 206
        this.buffer.pixels[index + 2] = 250
        this.buffer.pixels[index + 3] = r
        this.xoff += inc

      }
      this.yoff += inc
      this.zoff += 0.00006

    }


    this.buffer.updatePixels()
  }

  cieloImg () {
    return this.buffer
  }
}


