// new Q5();

let balls, ground, tempBall, canDrop, nextBall, cloudBall, cloud, bounds;

const domScore = document.getElementById("score");
const domNextBall = document.getElementById("nextball");
const domHighScore = document.getElementById("highscore");

let images = [
  "assets/cherry.png",
  "assets/strawberry.png",
  "assets/grape.png",
  "assets/lemon.png",
  "assets/orange.png",
  "assets/apple.png",
  "assets/whitefruit.png",
  "assets/peach.png",
  "assets/pineapple.png",
  "assets/honeydew.png",
  "assets/watermelon.png",
];

let points = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];
let diameters = [30, 46, 75, 80, 100, 125, 150, 177, 200, 230, 290];

let score = 0;
let highScore;
let ballsDropped = 0;
let ballTimeout = 1000;

let combining = false;

function setup() {
  new Canvas(448, 599);
  world.gravity.y = 20;

  bounds = new Group();

  wall1 = new bounds.Sprite(0, canvas.h / 2, 15, canvas.h, "s");
  wall1.color = "gray";
  wall2 = new bounds.Sprite(canvas.w, canvas.h / 2, 15, canvas.h, "s");
  wall2.color = "gray";

  ground = new bounds.Sprite(canvas.w / 2, canvas.h, canvas.w, 55, "s");
  ground.color = "gray";
  ground.bounciness = 0;

  nextBall = new Sprite(canvas.w - 100, 100);
  nextBall.tier = round(random(0, 4));
  nextBall.collider = "n";
  nextBall.diameter = diameters[nextBall.tier];
  nextBall.img = images[nextBall.tier];
  nextBall.visible = false;
  renderDomBall();

  cloud = new Sprite(mouseX, 75, 75, 50, "n");
  cloud.img = "assets/cloud.png";

  balls = new Group();
  balls.tier;
  balls.isCloud;
  balls.rotationDrag = 0.7;
  balls.textColor = "white";
  balls.textSize = 24;
  balls.bounciness = 0;

  cloudBall = new balls.Sprite(mouseX, 100);
  cloudBall.tier = round(random(0, 4));
  cloudBall.diameter = diameters[cloudBall.tier];
  cloudBall.img = images[cloudBall.tier];
  cloudBall.collider = "s";
  // cloudBall.text = cloudBall.diameter;
  cloudBall.isCloud = true;

  balls.collide(balls, destroyFruits);

  canDrop = true;

  highScore = getHighScore();
  ballsDropped = getItem("ballsDropped");

  renderDomScore();
}

function draw() {
  background("#edecc5");
  // renderStats();

  mouseX > 0 && mouseX < canvas.w
    ? cloud.moveTowards(mouseX, cloud.y, 0.2)
    : cloud.moveTowards(mouseX > canvas.w / 2 ? wall2.x - 5 : wall1.x + 5, cloud.y, 0.2);
  if (cloudBall) {
    cloudBall.x = cloud.x;
    cloudBall.y = cloud.y + 50;
  }

  if (kb.presses("p")) allSprites.debug = !allSprites.debug;

  stroke("gray");
  strokeWeight(6);
  line(cloud.x, cloud.y, cloud.x, canvas.h);
  stroke("black");
  strokeWeight(1);
}

function renderDomScore() {
  domScore.innerText = score;
  domHighScore.innerText = highScore;
}

function renderDomBall() {
  domNextBall.setAttribute("src", nextBall.img.url);
  domNextBall.setAttribute("alt", nextBall.img.url);
}

function gameOver() {
  alert("You lost!");
  window.location = window.location;
}

function saveHighScore(score) {
  storeItem("highscore", score);
}

function getHighScore() {
  return getItem("highscore");
}

async function destroyFruits(fruit1, fruit2) {
  if (fruit1.isCloud || fruit2.isCloud) gameOver();
  if (fruit1.tier != fruit2.tier) return;
  let tier = fruit1.tier;
  let aX = fruit1.x;
  let aY = fruit1.y;
  let bX = fruit2.x;
  let bY = fruit2.y;
  score += points[tier];
  if (score > getHighScore()) {
    highScore = score;
    saveHighScore(highScore);
  }
  renderDomScore();

  fruit1.overlaps(fruit2);

  fruit1.direction = fruit1.angleTo(fruit2);
  fruit2.direction = fruit2.angleTo(fruit1);
  fruit1.speed = 5;
  fruit2.speed = 5;
  await delay(100);

  fruit1.remove();
  fruit2.remove();
  if (tier == 10) return;

  let ball = createBall((aX + bX) / 2, (aY + bY) / 2, tier + 1);
  // let ball = createBall(aX >= bX ? aX : bX, aY >= bY ? aY : bY, tier + 1);
  ball.moveTowards(aX >= bY ? bX : aX, aY >= bY ? bY : aY, 0.02);
}

function mouseReleased() {
  if (!canDrop) return;
  canDrop = false;
  ballsDropped++;
  storeItem("ballsDropped", ballsDropped);
  let ball = cloudBall;
  cloudBall = undefined;

  ball.collider = "d";
  ball.isCloud = false;
  ball.x = ball.x + random(-1, 1);
  ball.diameter = diameters[ball.tier];
  ball.bounciness = 0;
  // ball.text = ball.diameter;
  ball.resetMass();
  setTimeout(() => {
    createCloudBall(cloud.x, cloud.y, nextBall);
    queueBall();
    canDrop = true;
  }, ballTimeout);
}

function queueBall() {
  nextBall.tier = round(random(0, 4));
  nextBall.diameter = diameters[nextBall.tier];
  nextBall.img = images[nextBall.tier];
  // nextBall.text = nextBall.diameter;
  renderDomBall();
}

function createCloudBall(x, y, nb) {
  cloudBall = new balls.Sprite(x, y);
  cloudBall.tier = nb.tier;
  cloudBall.img = images[cloudBall.tier];
  cloudBall.collider = "s";
  cloudBall.diameter = nb.diameter;
  // cloudBall.text = cloudBall.diameter;
  cloudBall.isCloud = true;
}

function createBall(x, y, tier) {
  let ball = new balls.Sprite(x, y);
  ball.tier = tier;
  ball.diameter = diameters[ball.tier];
  ball.img = images[tier];
  ball.collider = "d";
  ball.bounciness = 0;
  ball.resetMass();
  // ball.text = ball.diameter;
  return ball;
}
