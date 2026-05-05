const W = 640, H = 480, SPD = 4, R = 18;
const C1 = [29, 158, 117];
const C2 = [216, 90, 48];

let pg, b1, b2, over = false;


const DOWNSAMPLE = 4; // analizar 1 de cada N píxeles (performance)

let capture;
let usingCamera = false;

// Colores objetivo (RGB) y si están activos
const targets = [
  // { r: 230, g: 57,  b: 70,  name: 'Rojo',     active: true },
  { r: 219, g: 30,  b: 62,  name: 'Rojo',     active: true },
  { r: 84,  g: 153, b: 83,  name: 'Verde',     active: true },
  // { r: 45,  g: 198, b: 83,  name: 'Verde',     active: true },
  // { r: 67,  g: 97,  b: 238, name: 'Azul',      active: true },
  { r: 25,  g: 72,  b: 128, name: 'Azul',      active: true },
  { r: 200, g: 200, b: 73,  name: 'Amarillo',  active: true },
  // { r: 244, g: 208, b: 63,  name: 'Amarillo',  active: true },
];

let tolerance = 60;
let minBlobArea = 50;

// Blobs detectados en el frame actual
let blobs = [];

// Botones UI BLOBS
let camBtn, tolSlider, sizeSlider;
let colorPickers = [];
let colorToggles = [];

// estados de la aplicacion
// blobs, jugandoci: 0
let estado = 'blobs'

function makeBall(x, y, col) {
  return { x, y, col };
}

function reset() {
  pg = createGraphics(W, H);
  pg.background(240, 238, 232);
  b1 = makeBall(W * 0.25, H / 2, C1);
  b2 = makeBall(W * 0.75, H / 2, C2);
  over = false;
}

async function setup() {
  createCanvas(W, H + 160);
  pixelDensity(1)
  colorMode(RGB)
  // capture
  await navigator.mediaDevices.getUserMedia({ video: true })
  const devices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(d => d.kind === 'videoinput')
  const psCamara = videoDevices.find(d => !!d.label.match('USB Camera-B4.09.24.1'))

  const device = !!psCamara ? psCamara : videoDevices[0]
  console.log(device)

  console.log(device)

  capture = createCapture({
    video: {
      deviceId: { exact: device.deviceId }
    },
    audio: false
  },
  {
    flipped: false
  }, () => {

    capture.size(W, H);
    capture.hide();
    usingCamera = true;
    console.log('camera ready!')
  })
  // capture = createCapture(VIDEO, () => {
  //   capture.size(W, H);
  //   capture.hide();
  //   usingCamera = true;
  //   // camBtn.html('■ Detener cámara');
  //   // camBtn.style('background', '#ff6b6b');
  // });

  buildUI()
  reset();
}

function paintUnder(b) {
  pg.noStroke();
  pg.fill(...b.col, 200);
  pg.ellipse(b.x, b.y, R * 2.2);
}

function moveBall(b, upKey, downKey, leftKey, rightKey) {
  let moved = false;
  if (keyIsDown(upKey))    { b.y = max(R, b.y - SPD); moved = true; }
  if (keyIsDown(downKey))  { b.y = min(H - R, b.y + SPD); moved = true; }
  if (keyIsDown(leftKey))  { b.x = max(R, b.x - SPD); moved = true; }
  if (keyIsDown(rightKey)) { b.x = min(W - R, b.x + SPD); moved = true; }
  if (moved) paintUnder(b);
}

function moveBallXY (b, x, y) {
  b.x = x
  b.y = y

  paintUnder(b)

}

function countPixels() {
  pg.loadPixels();
  let c1 = 0, c2 = 0, total = 0;
  for (let i = 0; i < pg.pixels.length; i += 4) {
    let r = pg.pixels[i], g = pg.pixels[i + 1], a = pg.pixels[i + 3];
    if (a < 10) continue;
    total++;
    if (g > 120 && r < 100) c1++;
    else if (r > 150 && g < 100) c2++;
  }
  return { c1, c2, total };
}

function drawBall(b) {
  noStroke();
  fill(...b.col, 60);
  ellipse(b.x, b.y, (R + 8) * 2);
  fill(...b.col);
  ellipse(b.x, b.y, R * 2);
  fill(255, 255, 255, 180);
  ellipse(b.x - R * 0.28, b.y - R * 0.28, R * 0.48);
}

function drawHUD(c1, c2, total) {
  let pct1 = total > 0 ? c1 / total : 0;
  let pct2 = total > 0 ? c2 / total : 0;
  let barW = 200, barH = 10;
  let bx = (W - barW) / 2, by = 10;

  noStroke();
  fill(240, 238, 232, 200);
  rect(bx - 4, by - 4, barW + 8, barH + 8, 6);

  fill(...C1);
  rect(bx, by, barW * pct1, barH, 4, 0, 0, 4);
  fill(...C2);
  rect(bx + barW - barW * pct2, by, barW * pct2, barH, 0, 4, 4, 0);

  fill(200, 198, 192);
  rect(bx + barW * pct1, by, barW * (1 - pct1 - pct2), barH);

  textSize(11);
  textAlign(LEFT);
  fill(...C1);
  text(Math.round(pct1 * 100) + '%', bx - 32, by + 9);
  textAlign(RIGHT);
  fill(...C2);
  text(Math.round(pct2 * 100) + '%', bx + barW + 32, by + 9);
}


// ─────────────────────────────────────────────────────────────────────────────
// DETECCIÓN REAL (cámara) — BFS flood fill por color
// ─────────────────────────────────────────────────────────────────────────────
function detectBlobsFromPixels(pixels, w, h) {
  // 1. Etiquetar píxeles por color
  const label = new Int8Array(w * h).fill(-1);

  for (let y = 0; y < h; y += DOWNSAMPLE) {
    for (let x = 0; x < w; x += DOWNSAMPLE) {
      const mx = w - 1 - x; // espejo
      const idx = (y * w + mx) * 4;
      const pr = pixels[idx], pg = pixels[idx + 1], pb = pixels[idx + 2];

      for (let ci = 0; ci < targets.length; ci++) {
        const t = targets[ci];
        if (!t.active) continue;
        const dist = sqrt((pr - t.r) ** 2 + (pg - t.g) ** 2 + (pb - t.b) ** 2);
        if (dist < tolerance) {
          label[y * w + x] = ci;
          break;
        }
      }
    }
  }

  // 2. BFS para agrupar regiones
  const visited = new Uint8Array(w * h);
  blobs = [];

  for (let y = 0; y < h; y += DOWNSAMPLE) {
    for (let x = 0; x < w; x += DOWNSAMPLE) {
      const pi = y * w + x;
      if (label[pi] < 0 || visited[pi]) continue;

      const ci = label[pi];
      const queue = [[x, y]];
      visited[pi] = 1;
      let sumX = 0, sumY = 0, count = 0;
      let minX = x, maxX = x, minY = y, maxY = y;

      while (queue.length) {
        const [cx, cy] = queue.pop();
        sumX += cx; sumY += cy; count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (const [dx, dy] of [
          [DOWNSAMPLE, 0], [-DOWNSAMPLE, 0],
          [0, DOWNSAMPLE], [0, -DOWNSAMPLE]
        ]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const ni = ny * w + nx;
          if (visited[ni] || label[ni] !== ci) continue;
          visited[ni] = 1;
          queue.push([nx, ny]);
        }
      }

      const area = (maxX - minX) * (maxY - minY);
      if (area >= minBlobArea) {
        blobs.push({
          cx: sumX / count,
          cy: sumY / count,
          minX, maxX, minY, maxY,
          area,
          ci,
        });
      }
    }
  }
}


function drawAnnotations() {
  for (const b of blobs) {
    const t = targets[b.ci];
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;

    // Bounding box
    noFill();
    stroke(t.r, t.g, t.b);
    strokeWeight(1.5);
    rect(b.minX, b.minY, bw, bh, 3);

    // Esquinas decorativas
    strokeWeight(3);
    const cs = 12;
    // top-left
    line(b.minX, b.minY + cs, b.minX, b.minY); line(b.minX, b.minY, b.minX + cs, b.minY);
    // top-right
    line(b.maxX - cs, b.minY, b.maxX, b.minY); line(b.maxX, b.minY, b.maxX, b.minY + cs);
    // bottom-left
    line(b.minX, b.maxY - cs, b.minX, b.maxY); line(b.minX, b.maxY, b.minX + cs, b.maxY);
    // bottom-right
    line(b.maxX - cs, b.maxY, b.maxX, b.maxY); line(b.maxX, b.maxY, b.maxX, b.maxY - cs);

    // Crosshair centroide
    stroke(t.r, t.g, t.b, 200);
    strokeWeight(1);
    line(b.cx - 10, b.cy, b.cx + 10, b.cy);
    line(b.cx, b.cy - 10, b.cx, b.cy + 10);
    noFill(); stroke(t.r, t.g, t.b, 120);
    ellipse(b.cx, b.cy, 14);

    // Etiqueta
    const label = `${t.name} · ${(b.area / 1000).toFixed(1)}k px²`;
    const lw = textWidth(label) + 8;
    noStroke();
    fill(t.r, t.g, t.b, 200);
    rect(b.minX, b.minY - 18, lw, 15, 2);
    fill(10, 10, 20);
    textSize(10);
    textAlign(LEFT, TOP);
    text(label, b.minX + 4, b.minY - 16);
  }
}

function drawPanel() {
  // Fondo panel
  noStroke();
  fill(17, 17, 24);
  rect(0, H, W, 160);
  stroke(40, 40, 60);
  strokeWeight(1);
  line(0, H, W, H);

  // Título y sliders info
  noStroke();
  fill(80);
  textSize(9);
  textAlign(LEFT, TOP);
  text(`TOL ${tolerance}`, 240, H + 52);
  text(`MIN ${minBlobArea}px²`, 240, H + 82);

  // Lista de blobs detectados
  fill(60);
  textSize(10);
  text('BLOBS DETECTADOS:', 10, H + 110);

  if (blobs.length === 0) {
    fill(50);
    text('ninguno', 10, H + 125);
    return;
  }

  blobs.forEach((b, i) => {
    const t = targets[b.ci];
    fill(t.r, t.g, t.b);
    noStroke();
    ellipse(18, H + 128 + i * 16, 8, 8);

    fill(180);
    textSize(10);
    textAlign(LEFT, TOP);
    text(
      `#${i + 1}  ${t.name}  ·  centro (${b.cx | 0}, ${b.cy | 0})  ·  ${(b.area / 1000).toFixed(1)}k px²`,
      28, H + 122 + i * 16
    );
  });
}

function draw() {
  if (!capture) return

  capture.loadPixels();
  detectBlobsFromPixels(capture.pixels, W, H);

  if (!over && estado === 'jugando') {
    // moveBall(b1, 87, 83, 65, 68);           // W A S D
    // moveBall(b2, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW);
    if (blobs.length) {
      const blob1 = blobs.find(b => b.ci === 1)
      const blob2 = blobs.find(b => b.ci === 0)

      blob1 && moveBallXY(b1, blob1.cx, blob1.cy)

      blob2 && moveBallXY(b2, blob2.cx, blob2.cy)
    }
  }

  image(pg, 0, 0);

  if (!over && estado === 'jugando') {
    drawBall(b1);
    drawBall(b2);
  }

  let { c1, c2, total } = countPixels();
  let painted = (c1 + c2) / (W * H);
  if (estado === 'jugando') {
    drawHUD(c1, c2, total);
  }

  if (!over && painted > 0.88 && estado == 'jugando') {
    over = true;
    let winner = c1 > c2 ? 1 : 2;
    let wcol = winner === 1 ? C1 : C2;

    noStroke();
    fill(0, 0, 0, 120);
    rect(0, 0, W, H);

    fill(...wcol);
    textAlign(CENTER, CENTER);
    textSize(28);
    text('Jugador ' + winner + ' gana!', W / 2, H / 2 - 16);
    textSize(13);
    fill(220, 218, 212);
    text('Presiona R para jugar de nuevo', W / 2, H / 2 + 20);
  }

  if (estado === 'blobs') {
    background('black')
    // Espejear
    push();
    translate(W, 0);
    scale(-1, 1);
    image(capture, 0, 0, W, H);
    pop();

    drawAnnotations()
    drawPanel()

    tolerance = tolSlider.value();
    minBlobArea = sizeSlider.value();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') reset();

  key === 'b' && (print(blobs, estado))

  key === 'j' && (estado = 'jugando')

}

function buildUI() {
  // Botón cámara
  // camBtn = createButton('▶ Activar cámara');
  // camBtn.position(10, H + 10);
  // camBtn.style('font-family', 'monospace');
  // camBtn.style('font-size', '13px');
  // camBtn.style('padding', '6px 14px');
  // camBtn.style('cursor', 'pointer');
  // camBtn.style('background', '#7fffb3');
  // camBtn.style('color', '#000');
  // camBtn.style('border', 'none');
  // camBtn.style('border-radius', '3px');
  // camBtn.mousePressed(toggleCamera);

  // Slider tolerancia
  createElement('span', 'Tolerancia:').position(10, H + 50).style('font-family','monospace').style('font-size','12px').style('color','#ccc');
  tolSlider = createSlider(10, 130, tolerance, 1);
  tolSlider.position(110, H + 50);
  tolSlider.style('width', '120px');

  // Slider tamaño mínimo
  createElement('span', 'Tamaño mín:').position(10, H + 80).style('font-family','monospace').style('font-size','12px').style('color','#ccc');
  sizeSlider = createSlider(100, 5000, minBlobArea, 50);
  sizeSlider.position(110, H + 80);
  sizeSlider.style('width', '120px');

  // Color pickers + toggles por cada target
  targets.forEach((t, i) => {
    const xBase = 260 + i * 140;

    createElement('span', t.name).position(xBase, H + 12)
      .style('font-family', 'monospace')
      .style('font-size', '11px')
      .style('color', `rgb(${t.r},${t.g},${t.b})`);

    const picker = createColorPicker(color(t.r, t.g, t.b));
    picker.position(xBase, H + 30);
    picker.style('width', '50px');
    picker.style('height', '28px');
    picker.input(() => {
      const c = picker.color();
      targets[i].r = red(c);
      targets[i].g = green(c);
      targets[i].b = blue(c);
    });
    colorPickers.push(picker);

    const btn = createButton(t.active ? 'ON' : 'OFF');
    btn.position(xBase + 56, H + 30);
    btn.style('font-family', 'monospace');
    btn.style('font-size', '11px');
    btn.style('padding', '4px 8px');
    btn.style('cursor', 'pointer');
    btn.style('border', 'none');
    btn.style('border-radius', '3px');
    styleToggleBtn(btn, t.active);
    btn.mousePressed(() => {
      targets[i].active = !targets[i].active;
      styleToggleBtn(btn, targets[i].active);
      btn.html(targets[i].active ? 'ON' : 'OFF');
    });
    colorToggles.push(btn);
  });
}

function styleToggleBtn(btn, on) {
  btn.style('background', on ? '#7fffb3' : '#333');
  btn.style('color', on ? '#000' : '#888');
}

function mousePressed () {
  const c = capture.get(mouseX, mouseY)
  console.log(red(c), green(c), blue(c))
}




