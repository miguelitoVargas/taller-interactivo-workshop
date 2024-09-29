class Cielo {
  constructor () {
    this.w = 480
    this.h = 270
    this.zoff = 0
    this.yoff = 0
    this.xoff = 0
    this.res = 2

    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })
    this.buffer = createGraphics(this.w, this.h, P2D, gc)
  }

  generate () {
    let inc = 0.03

    // this.buffer.reset()
    // clear()
    // this.buffer.loadPixels()
    this.yoff = 0
    for (let y = 0; y < this.h/this.res; y++) {
      this.xoff = 0
      for (let x = 0; x < this.w/this.res; x++) {
        // octaves, falloff in percent
        noiseDetail(8, 0.8)

        // valor de ruido de perlin en 3 dimensiones
        let sat = noise(this.xoff, this.yoff, this.zoff) * 100

        this.buffer.colorMode(HSB)
        this.buffer.noStroke()
        this.buffer.fill(203, sat, 100)
        // this.buffer.fill(220, sat, 100)
        this.buffer.square(x*this.res-this.res/2, y*this.res-this.res/2, this.res)

        this.xoff += inc

      }
      this.yoff += inc
      this.zoff += 0.0006

    }

  }
}


