const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const startDialog = document.querySelector("#start-dialog");
const startButton = document.querySelector("#start-button");

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
    context.fillRect(100, 242, 48, 50);

    context.fillStyle = "#000000";
    context.fillRect(110, 254, 7, 7);
    context.fillRect(132, 254, 7, 7);
}

drawScene();
startDialog.showModal();

startButton.addEventListener("click", () => {
    startDialog.close();
});

