const GROUND_LEVEL = 292;
const GRAVITY = 1750; // px/s²
const JUMP_VELOCITY = -750;
const MAX_FRAME_TIME = 0.05;
const HITBOX_PADDING = 4;

const OBSTACLE_SPEED = 300; // px/s
const OBSTACLE_MIN_SPACING = 300;
const OBSTACLE_MAX_SPACING = 520;
const OBSTACLE_MIN_WIDTH = 24;
const OBSTACLE_MAX_WIDTH = 60;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 80;

const SCORE_FONT = "28px Amarante, sans-serif";
const BEST_SCORE_KEY = "jumping-dude-best-score";

const COLORS = {
    sky: "#b6e4ff",
    sun: "#e9f8ff",
    grass: "#74bd65",
    grassEdge: "#315b35",
    obstacle: "#000000",
    player: "#f47b55",
    playerEyes: "#000000",
    score: "#142012"
};

function randomBetween(min, max) {
    return Math.round(min + Math.random() * (max - min));
}

class Player {
    constructor() {
        this.x = 100;
        this.width = 48;
        this.height = 50;
        this.groundY = GROUND_LEVEL - this.height;
        this.reset();
    }

    reset() {
        this.y = this.groundY;
        this.velocityY = 0;
        this.isCrashed = false;
    }

    isOnGround() {
        return this.y === this.groundY;
    }

    jump() {
        if (this.isOnGround()) {
            this.velocityY = JUMP_VELOCITY;
        }
    }

    update(elapsedTime) {
        this.velocityY += GRAVITY * elapsedTime;
        this.y += this.velocityY * elapsedTime;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
        }
    }
}

class Obstacle {
    constructor(x, width, height) {
        this.x = x;
        this.width = width;
        this.height = height;
        this.y = GROUND_LEVEL - this.height;
        this.passed = false;
    }

    update(elapsedTime) {
        this.x -= OBSTACLE_SPEED * elapsedTime;
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.querySelector("#game-canvas");
        this.context = this.canvas.getContext("2d");
        this.startDialog = document.querySelector("#start-dialog");
        this.startButton = document.querySelector("#start-button");
        this.dialogTitle = document.querySelector("#dialog-title");
        this.finalScore = document.querySelector("#final-score");
        this.bestScoreText = document.querySelector("#best-score");

        this.player = new Player();
        this.obstacles = [];
        this.nextSpacing = 0;
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameStarted = false;
        this.lastActiveFrame = 0;

        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.startButton.addEventListener("click", () => this.startGame());

        // Escape closes the dialog without the button being clicked,
        // so treat any close as a start, otherwise the game gets stuck
        this.startDialog.addEventListener("close", () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });

        document.addEventListener("keydown", (event) => this.handleKeyDown(event));

        this.drawScene();
        this.startDialog.showModal();

        // Canvas doesn't load web fonts by itself, redraw once the font is ready
        document.fonts.load(SCORE_FONT).finally(() => this.drawScene());
    }

    startGame() {
        this.player.reset();
        this.obstacles.length = 0;
        this.nextSpacing = 0;
        this.score = 0;
        this.gameStarted = true;

        if (this.startDialog.open) {
            this.startDialog.close();
        }

        this.lastActiveFrame = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    handleKeyDown(event) {
        if ((event.code !== "Space" && event.code !== "ArrowUp") || !this.gameStarted) {
            return;
        }

        event.preventDefault();

        if (!event.repeat) {
            this.player.jump();
        }
    }

    spawnObstacle() {
        const width = randomBetween(OBSTACLE_MIN_WIDTH, OBSTACLE_MAX_WIDTH);
        const height = randomBetween(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT);

        this.obstacles.push(new Obstacle(this.canvas.width, width, height));
        this.nextSpacing = randomBetween(OBSTACLE_MIN_SPACING, OBSTACLE_MAX_SPACING);
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x + HITBOX_PADDING < rect2.x + rect2.width &&
            rect1.x + rect1.width - HITBOX_PADDING > rect2.x &&
            rect1.y + HITBOX_PADDING < rect2.y + rect2.height &&
            rect1.y + rect1.height - HITBOX_PADDING > rect2.y
        );
    }

    gameOver() {
        this.gameStarted = false;
        this.player.isCrashed = true;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }

        this.dialogTitle.textContent = "Game Over!";
        this.finalScore.textContent = `Your score: ${this.score}`;
        this.bestScoreText.textContent = `Best: ${this.bestScore}`;
        this.finalScore.hidden = false;
        this.bestScoreText.hidden = false;
        this.startButton.textContent = "Restart";

        if (!this.startDialog.open) {
            this.startDialog.showModal();
        }
    }

    loadBestScore() {
        try {
            return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
        } catch {
            return 0;
        }
    }

    saveBestScore() {
        try {
            localStorage.setItem(BEST_SCORE_KEY, String(this.bestScore));
        } catch {}
    }

    drawScene() {
        const { context, canvas, player } = this;

        context.fillStyle = COLORS.sky;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = COLORS.sun;
        context.beginPath();
        context.arc(500, 78, 34, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = COLORS.grass;
        context.fillRect(0, GROUND_LEVEL, canvas.width, canvas.height - GROUND_LEVEL);

        context.fillStyle = COLORS.grassEdge;
        context.fillRect(0, GROUND_LEVEL, canvas.width, 8);

        // Draw stream of black obstacles
        context.fillStyle = COLORS.obstacle;
        for (const obstacle of this.obstacles) {
            context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        context.fillStyle = COLORS.player;
        context.fillRect(player.x, player.y, player.width, player.height);

        if (player.isCrashed) {
            this.drawCrossEye(player.x + 9, player.y + 11, 9);
            this.drawCrossEye(player.x + 31, player.y + 11, 9);
        } else {
            context.fillStyle = COLORS.playerEyes;
            context.fillRect(player.x + 10, player.y + 12, 7, 7);
            context.fillRect(player.x + 32, player.y + 12, 7, 7);
        }

        // Current score in the top left corner
        context.fillStyle = COLORS.score;
        context.font = SCORE_FONT;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(`Score: ${this.score}`, 20, 20);
    }

    drawCrossEye(x, y, size) {
        const { context } = this;

        context.strokeStyle = COLORS.playerEyes;
        context.lineWidth = 3;
        context.lineCap = "round";

        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + size, y + size);
        context.moveTo(x + size, y);
        context.lineTo(x, y + size);
        context.stroke();
    }

    updateGame(elapsedTime) {
        this.player.update(elapsedTime);

        // Maintain randomly spaced stream
        const lastObstacle = this.obstacles[this.obstacles.length - 1];
        if (!lastObstacle || this.canvas.width - lastObstacle.x >= this.nextSpacing) {
            this.spawnObstacle();
        }

        // Move obstacles, count jumped ones and remove offscreen ones
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(elapsedTime);

            if (this.checkCollision(this.player, obstacle)) {
                this.gameOver();
                return;
            }

            if (!obstacle.passed && obstacle.x + obstacle.width < this.player.x) {
                obstacle.passed = true;
                this.score++;
            }

            if (obstacle.isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    gameLoop(timestamp) {
        if (!this.gameStarted) {
            return;
        }

        const elapsedSeconds = (timestamp - this.lastActiveFrame) / 1000;
        const elapsedTime = Math.min(Math.max(elapsedSeconds, 0), MAX_FRAME_TIME);
        this.lastActiveFrame = timestamp;

        this.updateGame(elapsedTime);
        this.drawScene();

        if (this.gameStarted) {
            requestAnimationFrame(this.gameLoop);
        }
    }
}

const game = new Game();
game.init();
