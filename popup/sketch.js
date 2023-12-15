// new Q5();
/*
Completed features added since update:
-Saving and loading!!!!
  -May be buggy, despite heavy testing
-Cross computer syncing! For all the people on a chromebook.
  -Your highscore, saved games, and other secret stats are now saved across devices!

In progress features added since update:
-Points appearing floating from fruits when combining

Bugs squashed:
-Fruits no longer have different hitboxes depending on the state that they were created

Tweaks:
-Made the grape hitbox slightly smaller
-Changed the background colors, as well as font.
*/

let balls,
  ground,
  wall1,
  wall2,
  tempBall,
  canDrop,
  nextBall,
  cloudBall,
  cloud,
  bounds,
  lossLine,
  lossArea,
  isGameOver;

const weightedArrays = {
  initGame: [0, 1, 2, 3, 4],
  midGame: [0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4],
  endGame: [0, 1, 2, 2, 2, 3, 3, 3, 4, 4],
};

const domScore = document.getElementById("score");
const domNextBall = document.getElementById("nextball");
const domHighScore = document.getElementById("highscore");
const domFastDrop = document.getElementById("fastDrop");
const domNoGameOver = document.getElementById("noGameOver");
const domShakeBtn = document.getElementById("shake");
domShakeBtn.addEventListener("click", shakeClicked);
const domShakeCount = document.getElementById("shakeCount");
const domShakeCountdown = document.getElementById("shakeCountdown");
const domPowerSaver = document.getElementById("powerSaver");
document.getElementById("resetHighScore").addEventListener("click", resetHighScore);
document.getElementById("newGame").addEventListener("click", newGame);

let enabledCheats = false;

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
let diameters = [30, 46, 70, 80, 100, 125, 150, 177, 200, 230, 290];
// let scales = [0.1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,]

let score = 0;
let highScore;
let ballsDropped = 0;

let ballTimeout = 1000;
let shakeStrength = 50;

let numOfShakes = 0;
let canShake = true;

let loading = true;

async function setup() {
  new Canvas(448, 599);
  world.gravity.y = 20;

  bounds = new Group();
  loss = new Group();

  wall1 = new bounds.Sprite(0, canvas.h / 2, 1, canvas.h, "s");
  wall1.color = "gray";
  wall2 = new bounds.Sprite(canvas.w, canvas.h / 2, 1, canvas.h, "s");
  wall2.color = "gray";

  ground = new bounds.Sprite(canvas.w / 2, canvas.h, canvas.w * 2, 1, "s");
  ground.color = "gray";
  ground.bounciness = 0;

  lossLine = new loss.Sprite(canvas.w / 2, 115, canvas.w, 1, "s");
  lossLine.visible = false;
  lossLine.stroke = "red";
  lossLine.strokeWeight = 6;
  lossArea = new loss.Sprite(canvas.w / 2, 175, canvas.w, 100, "s");
  lossArea.visible = false;

  nextBall = new Sprite(canvas.w - 100, 100);
  nextBall.tier = round(random(0, 4));
  nextBall.collider = "n";
  nextBall.diameter = diameters[nextBall.tier];
  nextBall.img = images[nextBall.tier];
  nextBall.visible = false;
  renderDomBall();

  cloud = new Sprite(mouseX, 50, 75, 50, "n");
  cloud.img = "assets/cloud.png";
  cloud.scale = 0.8;

  balls = new Group();
  balls.tier;
  balls.isCombining = false;
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

  highScore = await getHighScore();

  renderDomScore();
  chrome.storage.sync.get(["savedGame"]).then((result) => {
    if (result.savedGame) loadCurrentState();
    else loading = false;
  });
}

let lossAreaTimer = 0;
let tempBallShakeTimer = 0;

function draw() {
  background("#FDFBEC");

  // renderStats();
  if (enabledCheats) background("black");

  mouseX > 0 && mouseX < canvas.w
    ? cloud.moveTowards(mouseX, cloud.y, 0.2)
    : cloud.moveTowards(mouseX > canvas.w / 2 ? wall2.x - 5 : wall1.x + 5, cloud.y, 0.2);
  if (cloudBall) {
    cloudBall.x = cloud.x;
    cloudBall.y = cloud.y + 50;
  }

  if (kb.pressed("e")) {
    shakeClicked();
  }
  doEarthquake();

  for (let x of balls) {
    if (x.isCloud) continue;
    if (x.overlapping(lossArea) > 60) {
      lossAreaTimer = 0;
      lossLine.visible = true;
    } else if (lossAreaTimer < 70) {
      lossAreaTimer++;
    } else lossLine.visible = false;
    if (x.overlapping(lossLine) > 60) gameOver();
  }

  if (kb.presses("p")) allSprites.debug = !allSprites.debug;

  stroke("gray");
  strokeWeight(6);
  line(cloud.x, cloud.y, cloud.x, canvas.h);
  stroke("black");
  strokeWeight(1);
}

function saveCurrentState() {
  let state = [];
  for (let a of balls) {
    if (a.isCloud) continue;
    let ball = {};
    ball.x = a.x;
    ball.y = a.y;
    ball.tier = a.tier;
    ball.diameter = a.diameter;
    ball.vel = a.velocity;
    state.push(ball);
  }
  state.push({ cloudTier: cloudBall.tier }, { nextTier: nextBall.tier });
  state.push(
    { currentScore: score },
    {
      cheats: {
        enabled: enabledCheats,
        fastDrop: domFastDrop.checked,
        noGameOver: domNoGameOver.checked,
      },
    },
    { balls: ballsDropped }
  );
  chrome.storage.sync.remove(["savedGame"]);
  chrome.storage.sync.set({ savedGame: state });
}

async function loadCurrentState() {
  let state = [];
  await chrome.storage.sync.get(["savedGame"]).then((result) => {
    state = result.savedGame;
  });
  for (let a of state) {
    if (typeof a.cloudTier == "number") {
      cloudBall.remove();
      createCloudBall(cloud.x, cloud.y, a.cloudTier);
      continue;
    }
    if (typeof a.nextTier == "number") {
      queueBall(a.nextTier);
      continue;
    }
    if (typeof a.currentScore == "number") {
      score = a.currentScore;
      renderDomScore();
      continue;
    }
    if (typeof a.cheats == "object") {
      enabledCheats = a.cheats.enabled;
      a.cheats.fastDrop ? domFastDrop.click() : 0;
      a.cheats.noGameOver ? domNoGameOver.click() : 0;
      console.log(a.cheats);
      continue;
    }
    if (typeof a.balls == "number") {
      ballsDropped = a.balls;
      continue;
    }
    createBall(a.x, a.y, a.tier, a.vel);
  }
  loading = false;
}

let doShake = false;
async function doEarthquake() {
  if (!doShake) return;
  for (let ball of balls) {
    if (ball.isCloud) continue;
    ball.moveTowards(
      ball.x + random(-shakeStrength, shakeStrength),
      ball.y + random(-shakeStrength, shakeStrength)
    );
  }
  await delay(2000);
  doShake = false;
}

function shakeClicked() {
  if (!canShake || numOfShakes < 1) return;
  let shakeCountdown = 15;
  numOfShakes--;
  domShakeCount.innerText = numOfShakes;
  doShake = true;
  canShake = false;
  domShakeBtn.disabled = true;
  domShakeCountdown.style.display = "";
  domShakeCountdown.innerText = 15;
  let countdown = setInterval(() => {
    if (!domShakeBtn.disabled) return;
    if (shakeCountdown < 0) clearInterval(countdown);
    domShakeCountdown.innerText = --shakeCountdown;
  }, 1000);
  setTimeout(() => {
    domShakeCountdown.style.display = "none";
    canShake = true;
    if (numOfShakes == 0) return;
    domShakeBtn.disabled = false;
  }, 15000);
}

function getWeightedBall(balls) {
  if (balls > 50)
    return weightedArrays.endGame[
      Math.floor(Math.random() * weightedArrays.endGame.length)
    ];
  else if (balls > 25)
    return weightedArrays.midGame[
      Math.floor(Math.random() * weightedArrays.midGame.length)
    ];
  else
    return weightedArrays.initGame[
      Math.floor(Math.random() * weightedArrays.initGame.length)
    ];
}

function renderDomScore() {
  domScore.innerText = score;
  if (enabledCheats) domHighScore.innerText = "###";
  else domHighScore.innerText = highScore;
}

function renderDomBall() {
  domNextBall.setAttribute("src", nextBall.img.url);
  domNextBall.setAttribute("alt", nextBall.img.url);
}

function gameOver() {
  if (isGameOver || doShake || loading) return;
  chrome.storage.sync.remove("savedGame");
  isGameOver = true;
  alert("You lost! (the game)");
  location.reload();
}

function newGame() {
  if (confirm("Are you sure you want to start a new game?")) {
    chrome.storage.sync.remove("savedGame");
    location.reload();
  }
}

function resetHighScore() {
  if (window.confirm("Are you super duper sure you want to reset your high score?")) {
    saveHighScore(0);
    highScore = 0;
    renderDomScore();
  } else return;
}

function saveHighScore(score) {
  if (enabledCheats) return;
  chrome.storage.sync.set({ highScore: score });
}

async function getHighScore() {
  let hs = await chrome.storage.sync.get(["highScore"]).then((result) => {
    return result.highScore;
    // console.log(typeof result.highScore);
  });
  return hs;
}

async function destroyFruits(fruit1, fruit2) {
  if (fruit1.isCloud || fruit2.isCloud) return;
  if (fruit1.isCombining || fruit2.isCombining) return;
  if (fruit1.tier != fruit2.tier) return;
  fruit1.isCombining = true;
  fruit2.isCombining = true;
  let tier = fruit1.tier;
  let aX = fruit1.x;
  let aY = fruit1.y;
  let aIndex = balls.indexOf(fruit1);
  let bX = fruit2.x;
  let bY = fruit2.y;
  let bIndex = balls.indexOf(fruit2);
  score += points[tier];
  if (score > (await getHighScore())) {
    highScore = score;
    saveHighScore(highScore);
  }
  renderDomScore();

  fruit1.overlaps(fruit2);

  fruit1.direction = fruit1.angleTo(fruit2);
  fruit2.direction = fruit2.angleTo(fruit1);
  fruit1.speed = 5;
  fruit2.speed = 5;
  for (let x of balls) {
    if (x.isCombining) continue;
    if (dist(x.x, x.y, (aX + bX) / 2, (aY + bY) / 2) > canvas.w / 2.5) continue;
    x.moveAway((aX + bX) / 2, (aY + bY) / 2, 0.01);
  }
  await delay(100);

  fruit1.remove();
  fruit2.remove();

  // displayScoreText((aX + bX) / 2, (aY + bY) / 2, points[tier], diameters[tier + 1]);
  if (tier == 10) return;

  let ball = createBall((aX + bX) / 2, (aY + bY) / 2, tier + 1);
  // let ball = createBall(aX >= bX ? aX : bX, aY >= bY ? aY : bY, tier + 1);
  ball.moveTowards(aIndex >= bIndex ? aX : bX, aY >= bY ? bY : aY, 0.02);
}

function displayScoreText(x, y, points, di) {
  console.log("shwoop!");
  let distance = 0;
  let interval = setInterval(() => {
    // text("+" + points, x + di, y - distance);
    ellipse(200, 200, 200, 200);
    distance++;
    console.log(distance);
    if (distance >= 180) clearInterval(interval);
  }, deltaTime);
}

function mouseReleased() {
  if (mouseX <= -25 || mouseX >= canvas.w + 25) return;
  if (!canDrop) return;
  canDrop = false;
  ballsDropped++;
  chrome.storage.sync.get("ballsDropped").then((result) => {
    chrome.storage.sync.set({ ballsDropped: result.ballsDropped + 1 });
  });
  let ball = cloudBall;
  cloudBall = undefined;

  if (ballsDropped % 25 == 0) {
    numOfShakes++;
    domShakeCount.innerText = numOfShakes;
    domShakeBtn.disabled = false;
  }

  ball.collider = "d";
  ball.isCloud = false;
  ball.x = ball.x + random(-1, 1);
  ball.diameter = diameters[ball.tier];
  ball.bounciness = 0;
  // ball.text = ball.diameter;
  ball.resetMass();
  setTimeout(() => {
    createCloudBall(cloud.x, cloud.y, nextBall.tier);
    queueBall();
    saveCurrentState();
    canDrop = true;
  }, ballTimeout);
}

function queueBall(t = getWeightedBall(ballsDropped)) {
  nextBall.tier = t;
  nextBall.diameter = diameters[nextBall.tier];
  nextBall.img = images[nextBall.tier];
  // nextBall.text = nextBall.diameter;
  renderDomBall();
}

function createCloudBall(x, y, tier) {
  cloudBall = new balls.Sprite(x, y);
  cloudBall.tier = tier;
  cloudBall.img = images[tier];
  cloudBall.collider = "s";
  cloudBall.diameter = diameters[tier];
  // cloudBall.text = cloudBall.diameter;
  cloudBall.isCloud = true;
}

function createBall(x, y, tier, vel = undefined) {
  let ball = new balls.Sprite(x, y);
  ball.tier = tier;
  ball.img = images[tier];
  ball.collider = "d";
  ball.bounciness = 0;
  ball.diameter = diameters[ball.tier];
  ball.resetMass();
  if (vel) ball.velocity = vel;
  // ball.text = ball.diameter;
  return ball;
}

domPowerSaver.addEventListener("change", (e) => {
  if (domPowerSaver.checked) frameRate(30);
  else frameRate(60);
});

domFastDrop.addEventListener("change", (e) => {
  if (domFastDrop.checked) ballTimeout = 100;
  else ballTimeout = 1000;
  enabledCheats = true;
});

domNoGameOver.addEventListener("change", (e) => {
  if (domNoGameOver.checked) {
    gameOver = () => {
      console.log("You lost!");
    };
  } else {
    gameOver = () => {
      if (isGameOver) return;
      isGameOver = true;
      alert("You lost!");
      location.reload();
    };
  }
  enabledCheats = true;
});
