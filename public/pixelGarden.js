const CONFIG = {
  CANVAS: {
    WIDTH: 700,      
    HEIGHT: 500,     
    BACKGROUND: 220  
  },
  GRID: {
    SIZE: 4          
  },
  COLORS: {
    SHADOW: [40, 120, 40],
    STEM: [60, 160, 60],         
    BODY: [40, 40, 40],          
    FLOWER_CENTER: [255, 255, 0], 
    FLOWER_PALETTES: [
      [[255, 100, 100], [230, 150, 150], [200, 200, 150]], 
      [[180, 200, 255], [150, 180, 220], [130, 160, 200]], 
      [[255, 230, 100], [230, 200, 80], [200, 170, 60]]    
    ],
    BUTTERFLY_PALETTES: [
      [[255, 150, 150], [230, 130, 130]], 
      [[150, 150, 255], [130, 130, 230]], 
      [[255, 255, 150], [230, 230, 130]]  
    ]
  },
  LIMITS: {
    MAX_FLOWERS: 50,         
    MAX_BUTTERFLIES: 12,     
    INITIAL_FLOWERS: 20,     
    INITIAL_BUTTERFLIES: 5   
  },
  INTERVALS: {
    FLOWER: 1000,    
    BUTTERFLY: 2000  
  },
  ANIMATION: {
    BUTTERFLY_WING_SPEED: 0.15,
    BUTTERFLY_MOVE_SPEED: 0.02
  }
};


class PixelElement {
  constructor(x, y, size, color) {
    this.x = x;          
    this.y = y;          
    this.size = size;    
    this.color = color;  
  }

  drawPixel(x, y, color) {
    fill(color);  
    noStroke();   
    rect(x * CONFIG.GRID.SIZE, y * CONFIG.GRID.SIZE, 
         CONFIG.GRID.SIZE, CONFIG.GRID.SIZE);
  }
}

class Flower extends PixelElement {
  constructor() {
    const palette = random(CONFIG.COLORS.FLOWER_PALETTES);
    super(
      random(width),
      height - random(80),
      random(3, 4),
      color(random(palette))
    );
    this.type = floor(random(3));
    this.stemHeight = 5;
  }

  draw() {
    push();
    translate(this.x, this.y);
    scale(this.size);

    // Dibujar tallo
    for (let y = 0; y >= -this.stemHeight; y--) {
      this.drawPixel(0, y, color(...CONFIG.COLORS.STEM));
    }
    // sombra
    this.drawPixel(0, 1, CONFIG.COLORS.SHADOW)

    this.drawPetals();
    pop();
  }

  drawPetals() {
    switch(this.type) {
      case 0: // Flor redonda
        this.drawPixel(0, -this.stemHeight, color(...CONFIG.COLORS.STEM));
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (abs(x) + abs(y) <= 2) {
              this.drawPixel(x, y - this.stemHeight + 1, this.color);
            }
          }
        }
        break;
      
      case 1: // Flor estrella
        this.drawPixel(0, -this.stemHeight, color(...CONFIG.COLORS.STEM));
        [[0, 0], [-1, 1], [1, 1], [0, 2]].forEach(([x, y]) => {
          this.drawPixel(x, -y - this.stemHeight, this.color);
        });
        this.drawPixel(0, -this.stemHeight -1, color(...CONFIG.COLORS.FLOWER_CENTER));
        break;
      
      case 2: // Flor simple
        this.drawPixel(0, -this.stemHeight, color(...CONFIG.COLORS.STEM));
        [[0, 0], [-1, 0], [1, 0], [0, 1]].forEach(([x, y]) => {
          this.drawPixel(x, -y - this.stemHeight, this.color);
        });
        break;
    }
  }
}

class Butterfly extends PixelElement {
  constructor() {
    const palette = random(CONFIG.COLORS.BUTTERFLY_PALETTES);
    super(
      random(width),
      random(height / 2),
      random(2, 3),
      color(random(palette))
    );
    this.angle = random(TWO_PI);
    this.wingPhase = random(TWO_PI);
    this.centerX = random(width);
    this.centerY = random(height / 3);
    this.radius = random(30, 60);
    this.speed = random(0.8, 1.2);
  }

  update() {
    this.angle += CONFIG.ANIMATION.BUTTERFLY_MOVE_SPEED * this.speed;
    this.x = this.centerX + cos(this.angle) * this.radius;
    this.y = this.centerY + sin(this.angle) * this.radius * 0.5;
    this.wingPhase += CONFIG.ANIMATION.BUTTERFLY_WING_SPEED * this.speed;
    this.keepInBounds();
  }

  keepInBounds() {
    if (this.x < 0) this.centerX += width;
    if (this.x > width) this.centerX -= width;
    if (this.y < 0) this.centerY += height / 2;
    if (this.y > height) this.centerY -= height / 2;
  }

  draw() {
    push();
    translate(this.x, this.y);
    scale(this.size);

    const wingOffset = sin(this.wingPhase) * 1;
    
    [-1, 1].forEach(side => {
      const offset = side * wingOffset;
      this.drawPixel(side * (1 + offset), 0, this.color);
      this.drawPixel(side * (2 + offset), 0, this.color);
    });
    
    this.drawPixel(0, 0, color(...CONFIG.COLORS.BODY));
    pop();
  }
}

class PixelGarden {
  constructor() {
    this.flowers = [];
    this.butterflies = [];
    this.lastFlowerTime = 0;
    this.lastButterflyTime = 0;
  }

  initialize() {
    for (let i = 0; i < CONFIG.LIMITS.INITIAL_FLOWERS; i++) {
      this.createFlower();
    }
    for (let i = 0; i < CONFIG.LIMITS.INITIAL_BUTTERFLIES; i++) {
      this.createButterfly();
    }
  }

  update() {
    this.butterflies.forEach(butterfly => butterfly.update());
    this.checkNewElements();
  }

  draw() {
    // background(CONFIG.CANVAS.BACKGROUND);
    this.flowers.forEach(flower => flower.draw());
    this.butterflies.forEach(butterfly => butterfly.draw());
  }

  checkNewElements() {
    const currentTime = millis();
    if (currentTime - this.lastFlowerTime > CONFIG.INTERVALS.FLOWER) {
      this.createFlower(); this.lastFlowerTime = currentTime;
    }
    if (currentTime - this.lastButterflyTime > CONFIG.INTERVALS.BUTTERFLY) {
      this.createButterfly(); 
      this.lastButterflyTime = currentTime;
    }
  }

  createFlower() {
    if (this.flowers.length < CONFIG.LIMITS.MAX_FLOWERS) {
      this.flowers.push(new Flower());
    }
  }

  createButterfly() {
    if (this.butterflies.length < CONFIG.LIMITS.MAX_BUTTERFLIES) {
      this.butterflies.push(new Butterfly());
    }
  }
}
