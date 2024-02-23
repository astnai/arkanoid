// Get the canvas element and its 2d context
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Get the image element containing the bricks
const $bricks = document.querySelector('#bricks');

// Set canvas dimensions
canvas.width = 300;
canvas.height = 400;

// Game variables
let counter = 0; // Counter for game-related operations
let gameOver = false; // Flag to track game over
let score = 0; // Variable to store the score

// Ball variables
const ballRadius = 4; // Radius of the ball
let x = canvas.width / 2; // Initial x-coordinate of the ball
let y = canvas.height - 22; // Initial y-coordinate of the ball
let dx = 2; // Horizontal velocity of the ball
let dy = -2; // Vertical velocity of the ball

// Paddle variables
const paddleHeight = 10; // Height of the paddle
const paddleWidth = 60; // Width of the paddle
let paddleX = (canvas.width - paddleWidth) / 2; // Initial x-coordinate of the paddle
let paddleY = canvas.height - paddleHeight - 10; // Initial y-coordinate of the paddle
let rightPressed = false; // Flag to track right arrow key press
let leftPressed = false; // Flag to track left arrow key press
const paddleSensibility = 5; // Sensitivity of paddle movement

// Brick variables
const brickRowCount = 6; // Number of rows of bricks
const brickColumnCount = 8; // Number of columns of bricks
const brickWidth = 30; // Width of each brick
const brickHeight = 15; // Height of each brick
const brickPadding = 4; // Padding between bricks
const brickOffsetTop = 40; // Offset from the top of the canvas
const brickOffsetLeft = 15; // Offset from the left of the canvas
const bricks = []; // Array to hold brick data

// Enum for brick status
const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROY: 0
};

// Initialize bricks
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        const bricksX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const bricksY = r * (brickHeight + brickPadding) + brickOffsetTop;
        const random = Math.floor(Math.random() * 4);
        bricks[c][r] = { 
            x: bricksX, 
            y: bricksY, 
            status: BRICK_STATUS.ACTIVE, 
            color: random 
        };
    }
}

// Function to draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1c1c';
    ctx.fill();
    ctx.closePath();
}

// Function to draw the paddle
function drawPaddle() {
    ctx.fillStyle = '#1c1c1c';
    var cornerRadius = 5; // Radius of the paddle corners
    ctx.beginPath();
    // Drawing rounded rectangle for the paddle
    ctx.moveTo(paddleX + cornerRadius, paddleY);
    ctx.lineTo(paddleX + paddleWidth - cornerRadius, paddleY);
    ctx.arcTo(paddleX + paddleWidth, paddleY, paddleX + paddleWidth, paddleY + cornerRadius, cornerRadius);
    ctx.lineTo(paddleX + paddleWidth, paddleY + paddleHeight - cornerRadius);
    ctx.arcTo(paddleX + paddleWidth, paddleY + paddleHeight, paddleX + paddleWidth - cornerRadius, paddleY + paddleHeight, cornerRadius);
    ctx.lineTo(paddleX + cornerRadius, paddleY + paddleHeight);
    ctx.arcTo(paddleX, paddleY + paddleHeight, paddleX, paddleY + paddleHeight - cornerRadius, cornerRadius);
    ctx.lineTo(paddleX, paddleY + cornerRadius);
    ctx.arcTo(paddleX, paddleY, paddleX + cornerRadius, paddleY, cornerRadius);
    ctx.closePath();
    ctx.fill();
}

// Function to draw the bricks
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROY) continue;
            const clipX = currentBrick.color * 32;
            ctx.drawImage(
                $bricks,
                clipX,
                0,
                32,
                14,
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            );
        }
    }
}

// Function to detect collisions between the ball and bricks
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROY) continue;
            const isBallSameXAsBrick = x > currentBrick.x && x < currentBrick.x + brickWidth;
            const isBallSameYAsBrick = y > currentBrick.y && y < currentBrick.y + brickHeight;
            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy;
                currentBrick.status = BRICK_STATUS.DESTROY;
                score++; // Increase score when a brick is destroyed
            }
        }
    }
}

// Function to handle paddle movement
function paddleMovement() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSensibility;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleSensibility;  
    }
}

// Function to handle ball movement
function ballMovement() {
    // Ball bouncing off the sides
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Ball bouncing off the top
    if (y + dy < ballRadius) {
        dy = -dy;
    }

    // Ball hitting the paddle
    const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
    const isBallTouchingPaddle = y + dy > paddleY;
    if (isBallSameXAsPaddle && isBallTouchingPaddle) {
        dy = -dy;
    }
    
    // Ball hitting the bottom (Game Over)
    else if (y + dy > canvas.height - ballRadius) {
        gameOver = true; // Set game over flag
    }

    x += dx;
    y += dy;
}

// Function to clear the canvas
function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to draw the game over text
function drawGameOver() {
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// Function to update and draw the score
function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#1c1c1c';
    ctx.fillText('Score: ' + score, 8, 20);
}

// Initialize keyboard event listeners
function initEvents() {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
        const { key } = event;
        if (key === "Right" || key === 'ArrowRight') {
            rightPressed = true;
        } else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = true;
        }
    }

    function keyUpHandler(event) {
        const { key } = event;
        if (key === "Right" || key === 'ArrowRight') {
            rightPressed = false;
        } else if (key === 'Left' || key === 'ArrowLeft') {
            leftPressed = false;
        }
    }
}

// Main draw function
function draw() {
    cleanCanvas();
    // Draw elements
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore(); // Draw the score

    // Handle collisions and movements
    collisionDetection();
    paddleMovement();
    ballMovement();

    if (gameOver) {
        drawGameOver();
        return; // Stop the game loop
    }

    window.requestAnimationFrame(draw);
}

// Function to draw the "Win" message
function drawWinMessage() {
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Win', canvas.width / 2, canvas.height / 2);
}

// Main draw function
function draw() {
    cleanCanvas();
    // Draw elements
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore(); // Draw the score

    // Handle collisions and movements
    collisionDetection();
    paddleMovement();
    ballMovement();

    if (score >= 48) {
        drawWinMessage();
        return; // Stop the game loop
    }

    if (gameOver) {
        drawGameOver();
        return; // Stop the game loop
    }

    window.requestAnimationFrame(draw);
}

// Start the game!
draw();
initEvents();