const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const gameOverDisplay = document.getElementById('game-over');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let bird = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -10
};

let pipes = [];
let score = 0;
let gameRunning = true;
let pipeGap = 150;
let pipeFrequency = 3500; // milliseconds
let lastPipeTime = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameRunning) {
            bird.velocity = bird.jump;
        } else {
            resetGame();
        }
    }
});

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Draw bird
    ctx.fillStyle = '#ff0';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
    
    // Generate pipes
    if (timestamp - lastPipeTime > pipeFrequency) {
        createPipe();
        lastPipeTime = timestamp;
    }
    
    // Update and draw pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;
        
        // Draw pipes
        ctx.fillStyle = '#0a0';
        ctx.fillRect(pipes[i].x, 0, pipes[i].width, pipes[i].topHeight);
        ctx.fillRect(pipes[i].x, pipes[i].bottomY, pipes[i].width, canvas.height - pipes[i].bottomY);
        
        // Check for passing pipes
        if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].passed) {
            pipes[i].passed = true;
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
        
        // Remove off-screen pipes
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }
    
    // Check collisions
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

function createPipe() {
    const minTopHeight = 50;
    const maxTopHeight = canvas.height - pipeGap - minTopHeight;
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight + 1)) + minTopHeight;
    
    pipes.push({
        x: canvas.width,
        width: 60,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        passed: false
    });
}

function checkCollisions() {
    // Check if bird hits the ground or ceiling
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        return true;
    }
    
    // Check pipe collisions
    for (const pipe of pipes) {
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipe.width &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    gameRunning = false;
    gameOverDisplay.style.display = 'block';
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverDisplay.style.display = 'none';
    gameRunning = true;
    lastPipeTime = 0;
    requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
