class Cielo {
  constructor () {
    this.type = 'normal'
    this.normales = []
    this.pixelados = []
    this.ms = millis()

    //cargar cielos pixelados
    for (let i = 0; i < 20; i++) {
      const pixRuta = `assets/cielos/pixel/pixel${i}.png`
      this.pixelados.push(loadImage(pixRuta))

    }
    // cargar cielos normales
    for (let i = 0; i < 24; i++) {
      const r = `assets/cielos/normal/normal${i}.png`
      this.normales.push(loadImage(r))
    }

    this.currentCielo = random(this.normales)

  }

  changeCielo (type) {
    this.currentCielo = type === 'normal' ? random(this.normales) : random(this.pixelados)
  }

}


