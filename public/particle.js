class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y, 0);
    this.veloZ = 0;
    this.homeZ = 0;
    this.energy = 0; // intensidad del color
  }

  tick(grid, x, y) {
    const a = createVector();
    if (x > 0) a.add(p5.Vector.sub(grid.p[x - 1][y].pos, this.pos));
    if (x < grid.p.length - 1) a.add(p5.Vector.sub(grid.p[x + 1][y].pos, this.pos));
    if (y > 0) a.add(p5.Vector.sub(grid.p[x][y - 1].pos, this.pos));
    if (y < grid.p[0].length - 1) a.add(p5.Vector.sub(grid.p[x][y + 1].pos, this.pos));

    this.veloZ += a.z * 0.01;
    this.veloZ -= (this.pos.z - this.homeZ) * 0.005;
    this.veloZ -= this.veloZ * 0.01;
    this.pos.z += this.veloZ;


    this.energy = max(0, this.energy - 2);

    mouseIsPressed && console.log(this.energy)
  }

  draw() {
    let base = color(100, 100, 255);
    let highlight = color(100, 100, 255);
    let c = lerpColor(base, highlight, this.energy / 100);
    fill(c);
    noStroke();

    const r = lerp(1, R * 2, this.pos.z + 1);
    ellipse(this.pos.x * vidScale, this.pos.y * vidScale, r, r);
  }
}

