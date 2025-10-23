class Grid {
  constructor(w, h) {
    this.p = Array.from(Array(w), () => Array(h));
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        this.p[i][j] = new Particle(i * W, j * W);
      }
    }
  }

  tick(bodies) {

    // if (mouseIsPressed) {
    //   const x = int((mouseX + W / 2) / W / 3);
    //   const y = int((mouseY + W / 2) / W / 3);
    //   if (this.p[x] && this.p[x][y]) {
    //     this.p[x][y].pos.z -= 1;
    //   }
    // }


    if (bodies.length > 0) {
      let keypoints = bodies[0].keypoints;
      for (let i = 0; i < this.p.length; i++) {
        for (let j = 0; j < this.p[0].length; j++) {
          let particle = this.p[i][j];
          for (let kp of keypoints) {
            let d = dist(particle.pos.x, particle.pos.y, kp.x, kp.y);
            if (d < 40) {
              // si está cerca de una parte del cuerpo, genera "hundimiento"
              particle.pos.z -= (20 - d) * 0.01;
              particle.energy = 100;
            }
          }
          particle.tick(this, i, j);
        }
      }
    } else {
      for (let i = 0; i < this.p.length; i++) {
        for (let j = 0; j < this.p[0].length; j++) {
          this.p[i][j].tick(this, i, j);
        }
      }
    }
  }

  draw() {
    const dx = (scrWidth - (this.p.length - 1) * W) / 2;
    const dy = (scrHeight - (this.p[0].length - 1) * W) / 2;
    push();
    translate(dx, dy);
    ellipseMode(RADIUS);
    noStroke();
    for (let i = 0; i < this.p[0].length; i++) {
      for (let j = 0; j < this.p.length; j++) {
        this.p[j][i].draw();
      }
    }
    pop();
  }
}
