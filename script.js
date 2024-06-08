const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let hasStarted = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let startTime = Date.now();

const rabbitImg = document.getElementById("rabbitImg");
const carrotImg = document.getElementById("carrotImg");
const backgroundMusic = document.getElementById("backgroundMusic");
const jumpSound = document.getElementById("jumpSound");
const gameOverSound = document.getElementById("gameOverSound");

const rabbit = {
  x: 50,
  y: canvas.height - 50,
  width: 75,
  height: 75,
  dy: 0,
  gravity: 0.55,
  jumpStrength: -15,
  maxJumpHeight: canvas.height * 0.2,
  jumps: 0,
  maxJumps: 2,
  speed: 3,
  draw() {
    ctx.drawImage(rabbitImg, this.x, this.y, this.width, this.height);
  },
  jump() {
    if (this.jumps < this.maxJumps) {
      this.dy = this.jumpStrength;
      this.jumps++;
      jumpSound.play();
    }
  },
  update() {
    this.dy += this.gravity;
    this.y += this.dy;

    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.dy = 0;
      this.jumps = 0;
    }

    if (this.y < this.maxJumpHeight) {
      this.y = this.maxJumpHeight;
      this.dy = 0;
    }

    const distanceTraveled = this.speed / 90;
    score += distanceTraveled;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }
  },
};

function getRandomCarrotPosition(minY, maxY) {
  return Math.random() * (maxY - minY) + minY;
}
let nextCarrotX = canvas.width;
const carrot = {
  x: nextCarrotX,
  y: getRandomCarrotPosition((canvas.height * 2) / 5, canvas.height - 100),
  width: 100,
  height: 100,
  speed: 5,
  draw() {
    ctx.drawImage(carrotImg, this.x, this.y, this.width, this.height);
  },
  update() {
    if (!gameOver) {
      this.x -= this.speed;
      if (this.x + this.width < 0) {
        this.x = canvas.width;
        this.y = getRandomCarrotPosition(
          (canvas.height * 2) / 5,
          canvas.height - 100
        );
      }
    }
  },
  updatePosition(newX, newY) {
    this.x = newX;
    this.y = newY;
  },
};

function increaseSpeed() {
  const currentTime = Date.now();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  carrot.speed = 5 + 0.25 * elapsedSeconds;
}

function drawBackground() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${Math.round(score)}m`, 20, 40);
  ctx.fillText(`Highscore: ${Math.round(highScore)}m`, canvas.width - 175, 40);
}

function detectCollision() {
  const collisionBoxWidth = carrot.width / 10;
  const collisionBoxHeight = carrot.height / 2;
  const collisionBoxX = carrot.x + (carrot.width - collisionBoxWidth) / 2;
  const collisionBoxY = carrot.y + (carrot.height - collisionBoxHeight) / 2;
  if (
    rabbit.x < collisionBoxX + collisionBoxWidth &&
    rabbit.x + rabbit.width > collisionBoxX &&
    rabbit.y < collisionBoxY + collisionBoxHeight &&
    rabbit.y + rabbit.height > collisionBoxY
  ) {
    gameOver = true;
    showRestartButton();
    showFeedbackLink();
    backgroundMusic.pause();
    gameOverSound.play();
  }
}

function showRestartButton() {
  const restartButton = document.getElementById("restartButton");
  restartButton.style.display = "block";
  restartButton.onclick = () => location.reload();
}

function hideRestartButton() {
  const restartButton = document.getElementById("restartButton");
  restartButton.style.display = "none";
}

function showFeedbackLink() {
  feedbackLink.style.display = "block";
  feedbackLink.style.left = `${canvas.width / 2 + 600}px`;
  feedbackLink.style.top = `${canvas.height / 2 + 350}px`;
  feedbackLink.style.fontSize = "35px";
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 50);
    ctx.fillText(
      `Score: ${Math.round(score)}m`,
      canvas.width / 2 - 100,
      canvas.height / 2
    );
    if (score > highScore) {
      ctx.fillText(
        "New Record!",
        canvas.width / 2 - 100,
        canvas.height / 2 + 50
      );
    }
    showFeedbackLink(); // Display feedback link
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  rabbit.draw();
  carrot.draw();
  drawScore();
  rabbit.update();
  carrot.update();
  detectCollision();
  increaseSpeed();
  requestAnimationFrame(gameLoop);
}

if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  canvas.addEventListener("touchstart", () => {
    if (!hasStarted) {
      hasStarted = true;
      backgroundMusic.play();
      gameLoop();
    }
    rabbit.jump();
  });
} else {
  window.addEventListener("keydown", (event) => {
    if (!hasStarted && (event.code === "Space" || event.code === "Spacebar")) {
      hasStarted = true;
      backgroundMusic.play();
      gameLoop();
    }
    if (event.code === "Space" || event.code === "Spacebar") {
      rabbit.jump();
    }
  });
}

const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", () => {
  if (gameOver) {
    restartGame();
  }
});

function restartGame() {
  score = 0;
  gameOver = false;
  hasStarted = false;

  rabbit.x = 50;
  rabbit.y = canvas.height - 50;
  rabbit.dy = 0;
  rabbit.jumps = 0;
  rabbit.speed = 3;

  carrot.x = canvas.width;
  carrot.y = getRandomCarrotPosition(50, canvas.height - 150);

  startTime = Date.now();

  hideRestartButton();
  const feedbackLink = document.getElementById("feedbackLink");
  feedbackLink.style.display = "none"; // Hide feedback link
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  requestAnimationFrame(gameLoop);
}
