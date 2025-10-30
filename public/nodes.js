const gridCount = 40
const friction = 0.99
const forceMultiplier = 0.15
const mouseRadius = 50
let speedLimit

const node = function (x, y, pinned) {
  this.pos = createVector(x, y)
  this.vel = createVector(0, 0)
  this.force = createVector(0, 0)
  this.pinned = pinned

  this.update = () => {
    if (this.pinned) return
    const acc = p5.Vector.mult(this.force,forceMultiplier)
    this.vel.add(acc)
    this.vel.limit(speedLimit)
    this.pos.add(this.vel)

    this.force.mult(0)
    this.vel.mult(friction)
  }
}

const link = function (node1, node2) {
  this.node1 = node1
  this.node2 = node2

  this.show = () => {
    ellipseMode(CENTER)
    // fill(500, 0, 1000)
    noStroke()
    fill('white')
    circle(this.node1.pos.x, this.node1.pos.y, 15)
    circle(this.node2.pos.x, this.node2.pos.y, 15)
    // stroke('white')
    // beginShape()
    // // vertex(this.node1.pos.x, this.node1.pos.y)
    // // vertex(this.node2.pos.x, this.node2.pos.y)
    // curveVertex(this.node1.pos.x, this.node1.pos.y)
    // curveVertex(this.node1.pos.x, this.node1.pos.y)
    // curveVertex(this.node2.pos.x, this.node2.pos.y)
    // curveVertex(this.node2.pos.x, this.node2.pos.y)
    // endShape()
  }
  this.update = () => {
    const difference = node2.pos.copy().sub(node1.pos)
    this.node1.pinned || this.node1.force.add(difference)
    this.node2.pinned || this.node2.force.sub(difference)
  }
}

function createNodes() {
  const nodes = []
  for (let j = 0; j < gridCount; j++) {
    for (let i = 0; i < gridCount; i++) {
      const pinned =
        i == 0 || j == 0 || i == gridCount - 1 || j == gridCount - 1
          ? true
          : false
      const x = map(i, 0, gridCount - 1, 0, width - 1);
      const y = map(j, 0, gridCount - 1, 0, height - 1);
      nodes.push(new node(x, y, pinned))
    }
  }
  return nodes
}

function createLinks(nodes) {
  const links = []
  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i]
    const rest = nodes.slice(i + 1)
    const neighbors = rest.filter(
      (target) => current.pos.dist(target.pos) <= width / (gridCount - 1)
    )
    neighbors.forEach((target) => {
      if (current.pinned == false || target.pinned == false)
        links.push(new link(current, target))
    })
  }
  return links
}

