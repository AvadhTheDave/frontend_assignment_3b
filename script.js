const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const startDialog = document.querySelector("#start-dialog");
const startButton = document.querySelector("#start-button");
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
}

function gameLoop(timestamp) {
    const elapsedTime = Math.min((timestamp - lastActiveFrame) / 1000, 0.05);
    lastActiveFrame = timestamp;

    updateGame(elapsedTime);
    drawScene();
    requestAnimationFrame(gameLoop);
}

drawScene();
startDialog.showModal();

startButton.addEventListener("click", () => {
    startDialog.close();
    gameStarted = true;
    requestAnimationFrame(gameLoop);
});

document.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || !gameStarted) {
        return;
    }

    event.preventDefault();

    if (!event.repeat && player.y === groundY) {
        player.velocityY = jumpVelocity;
    }
});
