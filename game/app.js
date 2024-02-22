const canvas =document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    const $bricks = document.querySelector('#bricks')

    canvas.width= 300
    canvas.height = 400

    
    //variables del juego
    let counter = 0

    // variables de la pelota
    const ballRadius = 4;

    // posicion de la pelota
    let x = canvas.width / 2;
    let y = canvas.height - 22;

    // velocidad de la pelota
    let dx = 2
    let dy = -2 

    // variables paleta
    const paddleHeight = 10;
    const paddleWidth = 60;
    
    // variables ladrillos
    const brickRowCount = 6;
    const brickColumnCount = 8;
    const brickWidth = 30;
    const brickHight = 15;
    const brickPadding = 4;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 15;
    const bricks = [];

    const BRICK_STATUS = {
        ACTIVE: 1,
        DESTROY: 0
    }
    
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = []
        for (let r = 0; r < brickRowCount; r++) {
            const bricksX = c * (brickWidth + brickPadding) + brickOffsetLeft
            const bricksY = r * (brickHight + brickPadding) + brickOffsetTop

            const random = Math.floor(Math.random() * 4)

            bricks[c][r] = { 
                x: bricksX, 
                y: bricksY, 
                status: BRICK_STATUS.ACTIVE , 
                color: random }
        }
    }

    let paddleX = (canvas.width - paddleWidth) / 2
    let paddleY = canvas.height - paddleHeight -10

    let rightPressed = false
    let leftPressed = false

    const paddleSensibility = 5

    function drawBall() {

        ctx.beginPath()
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#1c1c1c'
        ctx.fill() 
        ctx.closePath()
    }
    
    function drawPaddle() {
    ctx.fillStyle = '#1c1c1c';
    var cornerRadius = 5; // radio de las esquinas redondeadas
    ctx.beginPath();
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

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const currentBrick = bricks[c][r]
                if (currentBrick.status === BRICK_STATUS.DESTROY)
                continue;

                const clipX = currentBrick.color * 32

                ctx.drawImage(
                    $bricks,
                    clipX,
                    0,
                    32,
                    14,
                    currentBrick.x,
                    currentBrick.y,
                    brickWidth,
                    brickHight
                )
            }
        }
    }

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const currentBrick = bricks[c][r]
                if (currentBrick.status === BRICK_STATUS.DESTROY) continue;

                const isBallSameXAsBrick =
                    x > currentBrick.x &&
                    x < currentBrick.x + brickWidth

                    const isBallSameYAsBrick =
                    y > currentBrick.y &&
                    y < currentBrick.y + brickHight

                if (isBallSameXAsBrick && isBallSameYAsBrick) {
                    dy = -dy
                    currentBrick.status = BRICK_STATUS.DESTROY
                }
            }
        }
    }

    function paddleMovent() {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += paddleSensibility
        } else if (leftPressed && paddleX > 0) {
            paddleX -= paddleSensibility  
        }
    }
    function ballMovent() {
        // rebote en los laterales
        if (
            x + dx > canvas.width - ballRadius || // pared derecha
            x + dx < ballRadius // pared izquierda
        )  {
            dx = -dx
        }

        // rebote arriba
        if (y + dy < ballRadius) {
            dy = -dy
        }

        // pelota toca paddle
        const isBallSameXAsPaddle =
            x > paddleX &&
            x < paddleX + paddleWidth
            
        const isBallTouchingPaddle = 
            y + dy > paddleY

        if (isBallSameXAsPaddle && isBallTouchingPaddle) {
            dy = -dy
        }
        
        // pelota toca el suelo
        else if (
            y + dy > canvas.height - ballRadius
            ) {
            console.log('Game Over')
            document.location.reload()
        }

        x += dx
        y += dy
    }

    // Funciones
    function cleanCanvas(){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    function initEvents () {
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)

        function keyDownHandler (event) {
            const { key } = event
            if (key === "Right" || key === 'ArrowRight') {
                rightPressed = true
            } else if (key === 'Left' || key === 'ArrowLeft') {
                leftPressed = true
            }
        }

        function keyUpHandler (event) {
            const { key } = event
            if (key === "Right" || key === 'ArrowRight') {
                rightPressed = false
            } else if (key === 'Left' || key === 'ArrowLeft') {
                leftPressed = false
            }
        }
    }

    function draw (){
        cleanCanvas()
        /*elementos*/
        drawBall()
        drawPaddle()
        drawBricks()

        /*colisiones y movimientos*/
        collisionDetection()
        paddleMovent()
        ballMovent()

        window.requestAnimationFrame(draw)
    }

    draw()
    initEvents()