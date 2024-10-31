class Cielo {
  constructor (srcImg) {
    this.w = 480
    this.h = 270
    this.zoff = 0
    this.yoff = 0
    this.xoff = 0
    this.res = 2
    this.inc = 0.03
    this.zinc = 0.06

    const gc = document.createElement('canvas')
    gc.getContext('2d', {
      willReadFrequently: true
    })
    this.buffer = createGraphics(this.w, this.h, P2D, gc)
    this.blendSource = createImage(srcImg.width, srcImg.height)
  }

  changeCielo (type) {
    if (type === 'normal') {
      this.res = 2
      this.inc = 0.03
      this.zinc = 0.06
      this.generate()
    } else {
      this.res = 6
      this.inc = 0.3
      this.zinc = 0.0006
      this.generate()
    }
  }

  generate () {
    // let inc = 0.03

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

        this.xoff += this.inc

      }
      this.yoff += this.inc
      this.zoff += this.zinc

    }

  }

  blendCielo (src) {
    // this.blendSource.copy(src)
    this.blendSource.loadPixels()
    src.loadPixels()
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        let loc = (x + y * width)*4
        const r = src.pixels[loc]
        const g = src.pixels[loc + 1]
        const b = src.pixels[loc + 2]
        const a = src.pixels[loc + 3]
        this.blendSource.pixels[loc] = r
        this.blendSource.pixels[loc + 1] = g
        this.blendSource.pixels[loc + 2] = b
        this.blendSource.pixels[loc + 3] = a

      }
    }
    this.blendSource.updatePixels()

    this.buffer.blend(this.blendSource, 0, 0, this.blendSource.width, this.blendSource.height, 0, 0, this.buffer.width, this.buffer.height, DIFFERENCE)
  }
}


