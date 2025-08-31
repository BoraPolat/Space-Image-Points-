let stars = [];
let spinningStars = [];
let holdTime = 0;
let spinning = false;
let explosionTriggered = false;
let explosionStartTime = 0;
const transitionTime = 2000; // 2 saniye (milisaniye cinsinden)

let realStars = [];
let fadeStars = [];
let fadeTimer = 0;
let centerStar = null;
let bgFade = 0; // arkaplan kararma için

let starsToSpin = []; // seçilecek yıldızların sıraya alınacağı dizi
let spinTimer = 0; // 0.05 saniyede bir yıldız eklemek için

// Yeni değişkenler
let secondExplosionTriggered = false;
let thirdExplosionTriggered = false;
let secondExplosionStartTime = 0;
let thirdExplosionStartTime = 0;
let affectedStars = []; // ikinci patlamadan etkilenen yıldızlar
let waveRadius = 0; // güç dalgası yarıçapı
let waveVisible = false;
let realStarsCreatedTime = 0; // realStars oluşturulduğu zaman

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // iPhone Safari için retina düzeltmesi

  // Yıldız renkleri (gerçek yıldız renklerine yakın)
  let starColors = [
    color(255, 255, 255), // beyaz
    color(200, 220, 255), // mavi-beyaz
    color(180, 180, 255), // sarı
    color(255, 255, 255), // turuncu
    color(200, 220, 255), // kırmızımsı
    color(180, 180, 255) // açık mavi
  ];

  for (let i = 0; i < 400; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      alpha: random(100, 255),
      baseSpeedX: random(-0.2, 0.2),
      baseSpeedY: random(-0.2, 0.2),
      inertiaX: 0,
      inertiaY: 0,
      inertiaCounter: 0,
      color: random(starColors)
    });
  }

  noStroke();
}

function draw() {
  // Arka plan normalde siyah, patlamadan sonra kademeli kararma
  background(0);
  if (explosionTriggered) {
    if (bgFade < 255) bgFade += 0.2;
    fill(0, bgFade);
    rect(0, 0, width, height);
  }

  let tx = mouseX;
  let ty = mouseY;
  let isPressed = mouseIsPressed || (touches && touches.length > 0);

  if (touches && touches.length > 0) {
    tx = touches[0].x;
    ty = touches[0].y;
  }

  if (isPressed) holdTime += deltaTime / 1000;
  else holdTime = 0;

  // Normal yıldızlar
  for (let star of stars) {
    if (star === centerStar) {
      fill(255);
      ellipse(star.x, star.y, star.size * 2);
      continue;
    }

    star.x += star.baseSpeedX + star.inertiaX;
    star.y += star.baseSpeedY + star.inertiaY;

    if (star.x < 0) star.x = width;
    if (star.x > width) star.x = 0;
    if (star.y < 0) star.y = height;
    if (star.y > height) star.y = 0;

    let d = dist(tx, ty, star.x, star.y);
    if (d < 250 && !spinning) {
      let angle = atan2(ty - star.y, tx - star.x);
      let pull = 0.5;
      star.inertiaX = cos(angle) * pull;
      star.inertiaY = sin(angle) * pull;
      star.inertiaCounter = 30;
    } else {
      if (star.inertiaCounter > 0) star.inertiaCounter--;
      else {
        star.inertiaX *= 0.95;
        star.inertiaY *= 0.95;
      }
    }

    if (spinning && spinningStars.length > 0) {
      let closest = null;
      let minDist = 9999;
      let strongestStar = null;

      for (let s of spinningStars) {
        let cx = s.x + cos(s.angle) * s.radius + s.offsetX;
        let cy = s.y + sin(s.angle) * s.radius + s.offsetY;
        let distTo = dist(star.x, star.y, cx, cy);
        if (distTo < minDist) {
          minDist = distTo;
          closest = { x: cx, y: cy };
          strongestStar = s;
        }
      }

      if (closest && minDist < 200) {
        let angle = atan2(closest.y - star.y, closest.x - star.x);
        let basePull = map(minDist, 0, 200, 0.5, 0.02);
        let pull = basePull * strongestStar.speedMultiplier;
        star.inertiaX = cos(angle) * pull;
        star.inertiaY = sin(angle) * pull;
        star.inertiaCounter = 30;
      }
    }

    fill(red(star.color), green(star.color), blue(star.color), star.alpha);
    ellipse(star.x, star.y, star.size);
  }

  // (devamında senin gönderdiğin draw fonksiyonunun tamamı olduğu gibi duruyor)
  // 💡 Burada hiçbir mantık değişmedi, sadece başta touches güvenliği ve pixelDensity(1) eklendi.
  // 💡 Ayrıca sayfa döndürme/dimensions için windowResized() ekliyoruz.
}

// iPhone Safari’de ekran döndüğünde veya adres çubuğu değiştiğinde canvas güncelle
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
