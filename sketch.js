let core, current, past, work;
let keys, doneCount, lastKind, finished, status;
let nextTime, autoTime;
let tgtX, tgtY;

const TOTAL = 9;

let col0, col1, col2, col3, col4;

function setup() {
  createCanvas(600, 600);

  col0 = color(244, 241, 222);
  col1 = color("#3D405B");
  col2 = color("#E07A5F");
  col3 = color("#81B29A");
  col4 = color("#F2CC8F");

  core = new Core();
  work = [];
  past = [];
  current = null;

  keys = 0;
  doneCount = 0;
  lastKind = -1;
  finished = false;

  status = "working on the assignment";
  nextTime = frameCount + 200;
  autoTime = frameCount + 30;
}

function typeKey() {
  keys++;
  core.glow = min(1, core.glow + 0.18);
}

function pickTarget() {
  let angle = (doneCount * TWO_PI) / TOTAL;
  tgtX = 300 + cos(angle) * 180;
  tgtY = 300 + sin(angle) * 180;
}

function spawnDistraction() {
  let kind = (lastKind + 1) % 5;
  lastKind = kind;

  pickTarget();

  if (kind === 0) current = new Phone(tgtX, tgtY);
  if (kind === 1) current = new Social(tgtX, tgtY);
  if (kind === 2) current = new Daydream(tgtX, tgtY);
  if (kind === 3) current = new Food(tgtX, tgtY);
  if (kind === 4) current = new Rabbit(tgtX, tgtY);

  status = current.status;
}

function draw() {
  noStroke();
  fill(col0);
  rect(0, 0, width, height);

  if (current === null && !finished && frameCount > nextTime) {
    spawnDistraction();
  }

  let blur = 0;

  if (current !== null) {
    current.step();
    blur = current.blur;
  }

  for (let i = 0; i < past.length; i++) {
    past[i].showThread();
    past[i].showResidue();
  }

  let dim = constrain(
    1 - dist(core.x, core.y, 300, 300) / 300,
    0.35,
    1
  );

  for (let i = 0; i < work.length; i++) {
    work[i].show(dim, blur);
  }

  if (current !== null) {
    current.show();
    core.moveToward(current.dx, current.dy);
    current.recordPeak(core.x, core.y);
  } else {
    core.moveToward(300, 300);
  }

  core.show();

  // Bottom status: shown during and between distractions.
  textAlign(LEFT, BASELINE);
  textSize(14);
  textStyle(NORMAL);
  noStroke();
  fill(col1);
  text(status, 20, height - 25);

  if (current !== null && current.isDone()) {
    past.push(current);
    current = null;
    doneCount++;

    status = "NO I NEED TO LOCK IN";
    nextTime = frameCount + 150;

    if (doneCount >= TOTAL) {
      finished = true;
    }
  }

  if (frameCount >= autoTime) {
    typeKey();
    autoTime = frameCount + (current !== null ? 60 : finished ? 5 : 10);
  }
}

class Core {
  constructor() {
    this.x = 300;
    this.y = 300;
    this.rad = 18;
    this.glow = 0;
  }

  moveToward(tx, ty) {
    this.x += (tx - this.x) * 0.07;
    this.y += (ty - this.y) * 0.07;
    this.glow *= 0.93;
  }

  show() {
    let r = this.rad * (1 + 0.04 * sin(frameCount * 0.05));

    noStroke();

    for (let i = 6; i >= 1; i--) {
      fill(61, 64, 91, 10 + 10 * this.glow);
      circle(this.x, this.y, r * 2 + i * (12 + 14 * this.glow));
    }

    fill(col1);
    circle(this.x, this.y, r * 2);

    fill("white");
    textAlign(CENTER, CENTER);
    textSize(r);
    textStyle(BOLD);
    text("me", this.x, this.y + 1);
    textStyle(NORMAL);
  }
}

class Distraction {
  constructor(tx, ty, dur, amt, r, g, b, label, status) {
    this.tx = tx;
    this.ty = ty;
    this.dur = dur;
    this.amt = amt;

    this.r = r;
    this.g = g;
    this.b = b;

    this.label = label;
    this.status = status;

    this.t = 0;
    this.env = 0;
    this.max = 0;

    this.dx = 300;
    this.dy = 300;

    this.ex = 300;
    this.ey = 300;

    this.blur = 0;
  }

  step() {
    this.t++;
    this.env = max(0, sin((PI * this.t) / this.dur));

    this.dx = 300 + (this.tx - 300) * this.env * this.amt;
    this.dy = 300 + (this.ty - 300) * this.env * this.amt;

    this.move();
  }

  move() {}
  show() {}
  showResidue() {}

  isDone() {
    return this.t >= this.dur;
  }

  recordPeak(cx, cy) {
    if (this.env > this.max) {
      this.max = this.env;
      this.ex = cx;
      this.ey = cy;
    }
  }

  showThread() {
    stroke(this.r, this.g, this.b, 75);
    strokeWeight(2.5);
    line(300, 300, this.ex, this.ey);

    noStroke();
    fill(this.r, this.g, this.b, 120);
    circle(this.ex, this.ey, 5);
  }

  showLabel(x, y) {
    noStroke();
    fill(this.r, this.g, this.b, 130);
    textSize(10);
    textAlign(CENTER, BASELINE);
    text(this.label, x, y);
  }
}

class Phone extends Distraction {
  constructor(x, y) {
    super(
      x, y, 170, 0.6,
      255, 70, 80,
      "notificationn",
      "my twin texting me"
    );
  }

  show() {
    let on = floor(this.t / 9) % 2 === 0 && this.t < this.dur * 0.75;

    if (on) {
      for (let i = 3; i > 0; i--) {
        fill(red(col2), green(col2), blue(col2), 30);
        circle(this.tx, this.ty, 12 + i * 8);
      }

      fill(red(col2), green(col2), blue(col2), 255);
      circle(this.tx, this.ty, 12);
    } else {
      fill(red(col2), green(col2), blue(col2), 70);
      circle(this.tx, this.ty, 6);
    }
  }

  showResidue() {
    fill(red(col2), green(col2), blue(col2), 160);
    circle(this.tx, this.ty, 5);
    this.showLabel(this.tx, this.ty + 28);
  }
}

class Win {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 90;
    this.h = 60;
  }

  show() {
    fill(14, 18, 30, 220);
    stroke(col3);
    strokeWeight(3);
    rect(this.x, this.y, this.w, this.h);

    noStroke();
    fill(col3);
    rect(this.x, this.y, this.w, 8);
  }

  showSmall() {
    noFill();
    stroke(red(col3), green(col3), blue(col3), 140);
    strokeWeight(2.5);
    rect(this.x, this.y, this.w * 0.4, this.h * 0.4);
  }
}

class Social extends Distraction {
  constructor(x, y) {
    super(
      x, y, 270, 0.85,
      red(col3), green(col3), blue(col3),
      "scrolling",
      "'the new film of madoka magica...'"
    );

    this.wins = [
      new Win(x - 40, y - 30),
      new Win(x + 10, y + 10)
    ];
  }

  show() {
    for (let win of this.wins) {
      win.show();
    }
  }

  showResidue() {
    for (let win of this.wins) {
      win.showSmall();
    }

    this.showLabel(this.tx, this.ty + 46);
  }
}

class Daydream extends Distraction {
  constructor(x, y) {
    super(
      x, y, 330, 0.35,
      170, 150, 255,
      "zoned out",
      "what if i can go to one of the mahoshojo universe"
    );
  }

  move() {
    this.dx = lerp(
      300,
      this.tx + sin(frameCount * 0.05) * 40,
      this.env
    );

    this.dy = lerp(
      300,
      this.ty + cos(frameCount * 0.05) * 40,
      this.env
    );

    this.blur = 9 * this.env;
  }

  show() {
    noFill();
    stroke(170, 150, 255, 40 * this.env);
    strokeWeight(3);

    for (let i = 0; i < 3; i++) {
      circle(core.x, core.y, 40 + i * 24);
    }
  }

  showResidue() {
    noFill();
    stroke(170, 150, 255, 70);
    strokeWeight(2.5);
    circle(this.ex, this.ey, 40);
    this.showLabel(this.ex, this.ey + 46);
  }
}

class Food extends Distraction {
  constructor(x, y) {
    super(
      x, y, 290, 0.65,
      255, 170, 70,
      "snack",
      "nom nom nom nom nom"
    );
  }

  show() {
    noStroke();
    rectMode(CENTER);

    for (let i = 0; i < 2; i++) {
      let k = min(1, this.env * 0.55 + i * 0.05);

      fill(255, 150 + i * 30, 70, 200 * this.env);

      rect(
        lerp(this.tx, 300, k),
        lerp(this.ty, 300, k),
        180 * (1 - i * 0.15),
        130 * (1 - i * 0.15),
        20
      );
    }

    rectMode(CORNER);
  }

  showResidue() {
    fill(255, 170, 70, 28);

    rectMode(CENTER);
    rect(this.tx, this.ty, 90, 70, 15);
    rectMode(CORNER);

    this.showLabel(this.tx, this.ty + 46);
  }
}

class Branch {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }
}

class Rabbit extends Distraction {
  constructor(x, y) {
    super(
      x, y, 340, 1,
      red(col1), green(col1), blue(col1),
      "rabbithole",
      "i wanna search this but ouuuu that vid looks fire let me click"
    );

    this.branches = [];
    this.segs = [];

    for (let i = 0; i < 4; i++) {
      let a = (i * TWO_PI) / 4;

      this.branches.push(
        new Branch(300, 300, cos(a) * 2, sin(a) * 2)
      );
    }
  }

  move() {
    if (this.t < 80) {
      for (let b of this.branches) {
        let nx = b.x + b.vx;
        let ny = b.y + b.vy;

        this.segs.push(b.x, b.y, nx, ny);

        b.x = nx;
        b.y = ny;
      }
    }

    this.dx = lerp(300, this.tx, this.env);
    this.dy = lerp(300, this.ty, this.env);
  }

  drawSegs(alpha) {
    stroke(red(col1), green(col1), blue(col1), alpha);
    strokeWeight(3);

    for (let i = 0; i < this.segs.length; i += 4) {
      line(
        this.segs[i],
        this.segs[i + 1],
        this.segs[i + 2],
        this.segs[i + 3]
      );
    }
  }

  show() {
    this.drawSegs(190);
  }

  showResidue() {
    this.drawSegs(70);
    this.showLabel(this.tx, this.ty + 20);
  }
}