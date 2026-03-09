// KEY QUEST PLATFORMER


// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');//the drawing board where everything appears
const c = canvas.getContext('2d'); // like pen to draw on the canvas

//canvas dimension
canvas.width = 1376
canvas.height = 768

// GAME CONSTANTS
const gravity = 0.5   // How fast player accelerates downward
const blockSize = 16  // Each block in the map is 16x16 pixels
const mapWidth = 86

//GAME STATE VARIABLES
let gameState = "playing"; //  "playing", "win", "gameover"
let hasKey = false
let gemsCollected = 0
let totalGems = 0;
let lives = 3
let timeLeft = 30
let gameWon = false


// COLLISIONMAP PROCESSING
// Convert 1D collision array to 2D 
const collisionsMap = []
for (let i = 0; i < collisions.length; i += mapWidth) {
    collisionsMap.push(collisions.slice(i, i + mapWidth))
}

const originalCollisionsMap = JSON.parse(JSON.stringify(collisionsMap))

// Find positions of special items
let gemPositions = []
let keyPosition = null
let doorPosition = null

for (let row = 0; row < collisionsMap.length; row++) {
    for (let col = 0; col < collisionsMap[0].length; col++) {

        const block = collisionsMap[row][col]

        if (block === 5) {

            gemPositions.push({ row, col })
            totalGems++;

        }
        if (block === 6 && !keyPosition) {
            keyPosition = { row, col }
        }
        if (block === 2 && !doorPosition) {
            doorPosition = { row, col }
        }
    }
}

class Sprite {
    constructor({ position, imageSrc, width, height }) {
        this.position = position
        this.width = width
        this.height = height
        this.image = new Image()
        this.image.src = imageSrc
    }

    draw() {
        if (!this.image) return
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height)
    }
}


class Player {
    constructor({ x, y }) {
        this.position = { x, y }
        this.velocity = { x: 0, y: 0 }
        this.width = 51
        this.height = 56

        this.onGround = false
        this.image = new Image()
        this.image.src = "./assets/images/player1.png"
    }

    draw() {
        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        } else {
            c.fillStyle = "red"
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
        }
    }

    update() {
        // Apply gravity
        this.velocity.y += gravity
        this.onGround = false

        // Move horizontally
        this.position.x += this.velocity.x
        this.checkCollisions('x')

        // Move vertically
        this.position.y += this.velocity.y
        this.checkCollisions('y')

        //Keep player in canvas bounds
        if (this.position.x < 0) this.position.x = 0
        if (this.position.x + this.width > collisionsMap[0].length * blockSize) {
            this.position.x = collisionsMap[0].length * blockSize - this.width
        }

        this.draw()
    }

    checkCollisions(axis) {
        for (let row = 0; row < collisionsMap.length; row++) {
            for (let col = 0; col < collisionsMap[0].length; col++) {
                const block = collisionsMap[row][col]
                if (block === 0) continue

                const blockX = col * blockSize;
                const blockY = row * blockSize;

                // Check collision with this block
                if (this.position.x < blockX + blockSize &&
                    this.position.x + this.width > blockX &&
                    this.position.y < blockY + blockSize &&
                    this.position.y + this.height > blockY) {

                    this.handleBlockCollision(block, blockX, blockY, axis, row, col)
                    if (block === 5 || block === 6) {
                        return;
                    }
                }
            }
        }
    }

    handleBlockCollision(block, blockX, blockY, axis, row, col) {
        switch (block) {
            case 1: // Floor
                if (axis === 'y') {
                    if (this.velocity.y > 0) { // Falling down
                        this.position.y = blockY - this.height
                        this.velocity.y = 0
                        this.onGround = true
                    } else if (this.velocity.y < 0) { // Jumping up (hitting ceiling)
                        this.position.y = blockY + blockSize
                        this.velocity.y = 0
                    }
                } else if (axis === 'x') {
                    if (this.velocity.x > 0) {
                        this.position.x = blockX - this.width;
                    } else if (this.velocity.x < 0) {
                        this.position.x = blockX + blockSize;
                    }
                }
                break;

            case 3: // Safe platform
                if (axis === 'y' && this.velocity.y > 0) {
                    // Only collide if falling onto platform from above AND feet are above the platform
                    this.position.y = blockY - this.height
                    this.velocity.y = 0
                    this.onGround = true
                }
                break;

            case 4: // holes
                if (axis === 'y' && this.velocity.y > 0)
                    this.die()
                break;



            case 5:
                console.log("Gem collected!");
                collisionsMap[row][col] = 0
                gemsCollected++
                updateUI()
                break

            case 6: // Key
                if (!hasKey) {
                    console.log("Key collected!")
                    hasKey = true

                    // Remove the key block
                    collisionsMap[row][col] = 0;
                    updateUI()
                }

                break
        }
    }

    die() {
        console.log("Player died!")
        lives--
        updateUI()

        if (lives <= 0) {
            // Game over - reset everything
            gameState = "gameover"
            // SHOW GAME OVER OVERLAY
            document.getElementById('gameOverOverlay').style.display = 'flex';
            document.getElementById('gameoverGems').textContent = gemsCollected;
        } else {
            resetLevel()
        }

    }
}




// Game objects
const player = new Player({ x: 50, y: 100 })
const player2 = new Player({ x: -50, y: 100 })

const background = new Sprite({
    position: { x: 0, y: 0 },
    imageSrc: "./assets/images/daytime_background.png",
    width: canvas.width,
    height: canvas.height
})

const openDoorImage = new Image();
openDoorImage.src = "./assets/images/daytime_open_door.png";

// Create sprites for items that need to be drawn (gems, key, open door)
const itemSprites = []

// Clear existing sprites
function updateItemSprites() {
    itemSprites.length = 0

    gemPositions.forEach(gem => {
        if (collisionsMap[gem.row] && collisionsMap[gem.row][gem.col] === 5) {
            itemSprites.push(new Sprite({
                position: {
                    x: gem.col * blockSize,
                    y: gem.row * blockSize
                },
                imageSrc: "./assets/images/gem.png",
                width: blockSize * 2,
                height: blockSize * 2
            }))
        }
    })


    if (keyPosition && !hasKey) {
        if (collisionsMap[keyPosition.row] && collisionsMap[keyPosition.row][keyPosition.col] === 6) {
            itemSprites.push(new Sprite({
                position: {
                    x: keyPosition.col * blockSize,
                    y: keyPosition.row * blockSize
                },
                imageSrc: "./assets/images/key.png",
                width: blockSize * 2,
                height: blockSize * 3
            }))
        }
    }

    if (hasKey) {
        itemSprites.push(new Sprite({
            position: {
                x: 1110,
                y: doorPosition.row * blockSize
            },
            imageSrc: "./assets/images/daytime_open_door.png",
            width: blockSize * 12,
            height: blockSize * 12
        }))
    }

}

updateItemSprites()

// ===== UI FUNCTIONS =====
function drawHearts() {
    c.font = "30px Arial"
    for (let i = 0; i < lives; i++) {
        c.fillText("❤️", 20 + (i * 35), 40)
    }
}

function drawGems() {
    c.font = "30px Arial"
    c.fillStyle = "gold"
    c.fillText(`💎 ${gemsCollected}`, canvas.width / 2 - 40, 40)
}

function drawKey() {
    c.fillStyle = "gold"
    c.font = "30px Arial"
    c.fillText(`🔑 ${hasKey ? "✓" : "✗"}`, canvas.width / 2 + 60, 40)
}

function drawTimer() {
    c.fillStyle = "gold"
    c.font = "30px Arial"

    let minutes = Math.floor(timeLeft / 60)
    let seconds = timeLeft % 60
    if (seconds < 10) seconds = "0" + seconds

    c.fillText(`⏱ ${minutes}:${seconds}`, canvas.width - 150, 40)
}

// ===== DOOR CHECK =====
function checkDoorOpen() {
    if (!doorPosition || !hasKey || gameWon) return;

    const doorX = doorPosition.col * blockSize
    const doorY = doorPosition.row * blockSize

    const touchingDoor =
        player.position.x + player.width > doorX &&
        player.position.x < doorX + blockSize * 12 &&
        player.position.y + player.height > doorY &&
        player.position.y < doorY + blockSize * 12

    if (hasKey && touchingDoor) {
        gameWon = true
        // gameState = "win"

        // SHOW WIN OVERLAY
        document.getElementById('winOverlay').style.display = 'flex';
        document.getElementById('winGems').textContent = `${gemsCollected}/${totalGems}`;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        if (seconds < 10) seconds = "0" + seconds;
        document.getElementById('winTime').textContent = `${minutes}:${seconds}`;

    }

}

const startButton = { x: canvas.width / 2 - 100, y: 200, width: 200, height: 50 };
const aboutButton = { x: canvas.width / 2 - 100, y: 270, width: 200, height: 50 };
const restartButton = { x: canvas.width / 2 - 100, y: 270, width: 200, height: 50 };
const nextButton = { x: canvas.width / 2 - 100, y: 340, width: 200, height: 50 };
const homeButton = { x: canvas.width / 2 - 100, y: 340, width: 200, height: 50 };

// function drawMenu() {
//     c.fillStyle = "rgba(0,0,0,0.6)";
//     c.fillRect(0, 0, canvas.width, canvas.height);

//     c.fillStyle = "white";
//     c.font = "36px Arial";
//     c.fillText("WELCOME TO KEY QUEST", canvas.width / 2 - 250, 120);

//     c.fillStyle = "#2ecc71";
//     c.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
//     c.fillStyle = "black";
//     c.font = "22px Arial";
//     c.fillText("START", startButton.x + 70, startButton.y + 35);

//     c.fillStyle = "#3498db";
//     c.fillRect(aboutButton.x, aboutButton.y, aboutButton.width, aboutButton.height);
//     c.fillStyle = "black";
//     c.fillText("ABOUT", aboutButton.x + 70, aboutButton.y + 35);
// }

// function drawAbout() {
//     c.fillStyle = "rgba(0,0,0,0.6)";
//     c.fillRect(0, 0, canvas.width, canvas.height);

//     c.fillStyle = "rgba(255,255,255,0.9)";
//     c.fillRect(150, 100, 500, 220);

//     c.fillStyle = "black";
//     c.font = "20px Arial";
//     c.fillText("HOW TO PLAY", 320, 140);

//     c.font = "16px Arial";
//     c.fillText("• Use Arrow keys to move and jump", 190, 180);
//     c.fillText("• Collect gems and the key", 190, 210);
//     c.fillText("• Avoid falling into holes", 190, 240);
//     c.fillText("• Reach the door with the key to win", 190, 270);
//     c.fillText("Press ESC to go back", 280, 310);
// }

// function drawWinMenu() {
//     c.fillStyle = "rgba(0,0,0,0.7)";
//     c.fillRect(0, 0, canvas.width, canvas.height);

//     c.fillStyle = "white";
//     c.font = "32px Arial";
//     c.fillText("YOU WIN!", canvas.width / 2 - 100, 120);

//     c.font = "20px Arial";
//     c.fillText(`Gems: ${gemsCollected}/${totalGems}`, canvas.width / 2 - 60, 180);
//     c.fillText(`Time left: ${timeLeft}`, canvas.width / 2 - 50, 210);

//     c.fillStyle = "#f12d0f";
//     c.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
//     c.fillStyle = "black";
//     c.fillText("RESTART", restartButton.x + 50, restartButton.y + 35);

//     c.fillStyle = "#2ecc71";
//     c.fillRect(nextButton.x, nextButton.y, nextButton.width, nextButton.height);
//     c.fillStyle = "black";
//     c.fillText("NEXT", nextButton.x + 70, nextButton.y + 35);
// }

function drawGameOver() {
    c.fillStyle = "rgba(0,0,0,0.7)";
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.fillStyle = "white";
    c.font = "60px Arial";
    c.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2 - 50);

    c.font = "30px Arial";
    c.fillText(`You collected ${gemsCollected} gems`, canvas.width / 2 - 130, canvas.height / 2 + 20);

    c.fillStyle = "#f12d0f";
    c.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    c.fillStyle = "black";
    c.fillText("RESTART", restartButton.x + 50, restartButton.y + 35);

    c.fillStyle = "#3498db";
    c.fillRect(homeButton.x, homeButton.y, homeButton.width, homeButton.height);
    c.fillStyle = "black";
    c.fillText("HOME", homeButton.x + 70, homeButton.y + 35);

}

function resetLevel() {
    // Reset player position
    player.position.x = 50;
    player.position.y = 100;
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Reset level state but keep lives
    hasKey = false;
    gemsCollected = 0;
    timeLeft = 30;

    // Reset collisions map
    for (let row = 0; row < collisionsMap.length; row++) {
        for (let col = 0; col < collisionsMap[0].length; col++) {
            collisionsMap[row][col] = originalCollisionsMap[row][col];
        }
    }

    // Rescan for item positions
    gemPositions = [];
    keyPosition = null;
    doorPosition = null;
    totalGems = 0;

    // Rescan for item positions
    for (let row = 0; row < collisionsMap.length; row++) {
        for (let col = 0; col < collisionsMap[0].length; col++) {
            const block = collisionsMap[row][col];
            if (block === 5) {
                gemPositions.push({ row, col });
                totalGems++;
            }
            if (block === 6 && !keyPosition) {
                keyPosition = { row, col };
            }
            if (block === 2 && !doorPosition) {
                doorPosition = { row, col };
            }
        }
    }


    updateUI()
}

function resetGame() {
    lives = 3;
    resetLevel();
    timeLeft = 30;
    updateUI()
}

// Update HTML UI elements
function updateUI() {
    document.getElementById('lives-display').textContent = lives;
    document.getElementById('gems-display').textContent = `${gemsCollected}/${totalGems}`;
    document.getElementById('key-display').textContent = hasKey ? "✓" : "✗";

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    if (seconds < 10) seconds = "0" + seconds;
    document.getElementById('timer-display').textContent = `${minutes}:${seconds}`;
}

setInterval(() => {
    if (gameState === "playing" && !gameWon) {
        timeLeft--;
        console.log("Timer:", timeLeft);
        if (timeLeft <= 0) {
            player.die()

        }
    }
}, 1000);




function animate() {
    requestAnimationFrame(animate);


    // if (gameState === "menu") {
    //     drawMenu();
    // } else 
    // if (gameState === "about") {
    //     drawAbout();
    // } else
    if (gameState === "playing") {
        // Clear canvas
        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);

        background.draw();

        // // Draw open door if player has key
        // if (hasKey && doorPosition && !gameWon) {
        //     const doorX = doorPosition.col * blockSize;
        //     const doorY = doorPosition.row * blockSize;
        //     c.drawImage(openDoorImage, doorX, doorY, blockSize * 12, blockSize * 8);
        // }

        updateItemSprites();
        itemSprites.forEach(sprite => sprite.draw());
        player.update();

        drawHearts();
        drawGems();
        drawKey();
        drawTimer();

        checkDoorOpen();
    } else if (gameState === "win") {
        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);
        background.draw();
        drawWinMenu();
    } else if (gameState === "gameover") {
        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);
        drawGameOver();
    }
}

animate();


// ===== KEYBOARD CONTROLS =====
const keys = { right: false, left: false };

window.addEventListener("keydown", (event) => {
    if (gameState === "playing") {
        switch (event.key) {
            case "ArrowRight":
                player.velocity.x = 3;
                keys.right = true;
                break;
            case "ArrowLeft":
                player.velocity.x = -3;
                keys.left = true;
                break;
            case "ArrowUp":
                if (player.onGround) {
                    player.velocity.y = -14;
                }
                break;
        }
    }

    if (event.key === "Escape" && gameState === "about") {
        gameState = "menu";
    }

    if (event.key === "r" || event.key === "R") {
        if (gameState === "win" || gameState === "gameover") {
            gameState = "playing";
            resetGame();
        }
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowRight":
            if (!keys.left) player.velocity.x = 0;
            keys.right = false;
            break;
        case "ArrowLeft":
            if (!keys.right) player.velocity.x = 0;
            keys.left = false;
            break;
    }
});

// ===== MOUSE CONTROLS =====
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === "menu") {
        if (mouseX > startButton.x && mouseX < startButton.x + startButton.width &&
            mouseY > startButton.y && mouseY < startButton.y + startButton.height) {
            gameState = "playing";
            resetGame();
        }
        if (mouseX > aboutButton.x && mouseX < aboutButton.x + aboutButton.width &&
            mouseY > aboutButton.y && mouseY < aboutButton.y + aboutButton.height) {
            gameState = "about";
        }
    }

    if (gameState === "win") {
        if (mouseX > restartButton.x && mouseX < restartButton.x + restartButton.width &&
            mouseY > restartButton.y && mouseY < restartButton.y + restartButton.height) {
            gameState = "playing";
            resetGame();
        }

        if (mouseX > nextButton.x && mouseX < nextButton.x + nextButton.width &&
            mouseY > nextButton.y && mouseY < nextButton.y + nextButton.height) {
            // Go to next level
            window.location.href = "../level2/index.html";
        }
    }

    if (gameState === "gameover") {
        if (mouseX > restartButton.x && mouseX < restartButton.x + restartButton.width &&
            mouseY > restartButton.y && mouseY < restartButton.y + restartButton.height) {
            gameState = "playing";
            resetGame();
        }
        if (mouseX > homeButton.x && mouseX < homeButton.x + homeButton.width &&
            mouseY > homeButton.y && mouseY < homeButton.y + homeButton.height) {
            gameState = "menu";
        }

    };
})
//make the reset game available globally
window.resetGame = resetGame;
window.gameState = gameState;