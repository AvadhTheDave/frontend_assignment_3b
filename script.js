const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const startDialog = document.querySelector("#start-dialog");
const startButton = document.querySelector("#start-button");
const dialogTitle = document.querySelector("#dialog-title");
const groundY = 242;
const player = {
    x: 100,
    y: groundY,
    width: 48,
    height: 50,
    velocityY: 0
};
const gravity = 1750;
const jumpVelocity = -750;
let gameStarted = false;
let lastActiveFrame = 0;

// Obstacle stream initial settings
const obstacleSpeed = 300;
const obstacleSpacing = 320; // Fixed distance between each obstacle for now
const obstacles = [];

function spawnObstacle() {
    obstacles.push({
        x: canvas.width,
        y: groundY,
        width: player.width,
        height: player.height
    });
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function gameOver() {
    gameStarted = false;
    dialogTitle.textContent = "Game Over!";
    startButton.textContent = "Restart"; // Or "Game over - Play again"
    if (!startDialog.open) {
        startDialog.showModal();
    }
}

function drawScene() {
    context.fillStyle = "#b6e4ff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#e9f8ff";
    context.beginPath();
    context.arc(500, 78, 34, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#74bd65";
    context.fillRect(0, 292, canvas.width, 68);

    context.fillStyle = "#315b35";
    context.fillRect(0, 292, canvas.width, 8);

    // Draw stream of black obstacles
    context.fillStyle = "#000000";
    for (const obstacle of obstacles) {
        context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    context.fillStyle = "#f47b55";
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = "#000000";
    context.fillRect(player.x + 10, player.y + 12, 7, 7);
    context.fillRect(player.x + 32, player.y + 12, 7, 7);
}

function updateGame(elapsedTime) {
    player.velocityY += gravity * elapsedTime;
    player.y += player.velocityY * elapsedTime;

    if (player.y >= groundY) {
        player.y = groundY;
        player.velocityY = 0;
    }

    // Maintain evenly spaced stream
    const lastObstacle = obstacles[obstacles.length - 1];
    if (!lastObstacle || canvas.width - lastObstacle.x >= obstacleSpacing) {
        spawnObstacle();
    }

    // Move obstacles and remove offscreen ones
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed * elapsedTime;

        if (checkCollision(player, obstacles[i])) {
            gameOver();
            return;
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function gameLoop(timestamp) {
    if (!gameStarted) {
        return;
    }

    const elapsedTime = Math.min((timestamp - lastActiveFrame) / 1000, 0.05);
    lastActiveFrame = timestamp;

    updateGame(elapsedTime);
    drawScene();

    if (gameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

drawScene();
startDialog.showModal();

startButton.addEventListener("click", () => {
    event.preventDefault();

    if (startDialog.open) {
        startDialog.close();
    }

    player.y = groundY;
    player.velocityY = 0;
    obstacles.length = 0;

    gameStarted = true;
    lastActiveFrame = performance.now();
    requestAnimationFrame(gameLoop);
});

document.addEventListener("keydown", (event) => {
    if ((event.code !== "Space" && event.code !== "ArrowUp") || !gameStarted) {
        return;
    }

    event.preventDefault();

    if (!event.repeat && player.y === groundY) {
        player.velocityY = jumpVelocity;
    }
});
