// KEY QUEST PLATFORMER


// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // pen to draw on the canvas

// ===== IMAGES =====
let imagesLoaded = 0;
const TOTAL_IMAGES = 9;

const images = {};

function loadImage(name, src) {
    const img = new Image();

    img.onload = () => {
        imagesLoaded++;
        console.log(`✅ Loaded: ${src}`);
    };

    img.onerror = () => {
        console.error(`❌ FAILED TO LOAD: ${src}`);
    };

    img.src = src;
    images[name] = img;
}

// Load images
loadImage("daytime_background", "./assets/images/daytime_background.png");
loadImage("floor", "./assets/images/floor.png.png");
loadImage("roof", "./assets/images/roof_medium.png.png");
loadImage("player", "./assets/images/knight.png.png");
loadImage("key", "./assets/images/key.png.png");
loadImage("doorClosed", "./assets/images/door_closed.png.png");
loadImage("doorOpen", "./assets/images/door_open.png.png");
loadImage("roofSmall", "./assets/images/roof_small.png.png")
loadImage("spikes", "./assets/images/spikes.png.png"); // later

console.log(images.daytime_background.src);

function drawBackground() {
    const img = images.daytime_background;
    if (img && img.complete) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

// GAME STATE
let gameState = "menu"; // "menu", "playing", "win"


// ===== CURRENT LEVEL =====
let currentLevel = 1;


// BUTTONS
//MENU
const startButton = { x: 300, y: 200, width: 200, height: 50 };
const aboutButton = { x: 300, y: 270, width: 200, height: 50 };
//WINMENU
const restartButton = { x: 300, y: 270, width: 200, height: 50 };
const nextButton = { x: 300, y: 340, width: 200, height: 50 };



// ===== PLAYER =====

const player = {
    x: 50,           // Horizontal position
    y: 260,          // Vertical position
    width: 90,       // Width of player rectangle
    height: 90,      // Height of player rectangle
    speed: 5,        // Horizontal speed (pixels per frame)
    dy: 0,           // Vertical speed (delta y)
    gravity: 0.5,    // Gravity (pulls player down)
    jumpPower: -12,  // Jump strength (negative = upward)
    onGround: false  // Is the player touching the floor/platform
};



// ===== FLOOR =====
const floor = { x: 0, y: 350, width: 900, height: 50 };



// ===== KEY & DOOR =====
let hasKey = false; // Player does not have the key at start
const key = { x: 0, y: 0, width: 20, height: 30, collected: false };
const door = { x: 640, y: 200, width: 160, height: 170, open: false };



// ===== LIVES & TIMER =====
let lives = 3;
let timeLeft = 30;
let timerInterval = null;
let timeFailures = 0;




// ===== LEVEL DATA =====
// Each level changes ONLY data, not logic
const levels = {
    1: {
        time: 30,
        holes: [{ x: 200, width: 150 }],
        roofs: [{ x: 470, y: 220, width: 80, height: 20 }],
        spikes: [{ x: 470, width: 80 }],
        key: { x: 500, y: 90 }

    }
};


// These arrays change depending on level
let holes = [];
let roofs = [];
let spikes = [];




// ===== LOAD LEVEL =====
function loadLevel(levelNumber) {
    const level = levels[levelNumber];

    currentLevel = levelNumber;
    timeLeft = level.time;

    holes = level.holes;
    roofs = level.roofs;
    spikes = level.spikes;

    door.open = false;

    key.x = level.key.x;
    key.y = level.key.y;
    key.collected = false;
    hasKey = false;

    player.x = 50;
    player.y = 300;
    player.dy = 0;
}





// KEYBOARD INPUT
const keys = {}; //to track wich keys are pressed

document.addEventListener("keydown", function (e) {

    if (gameState === "playing") keys[e.code] = true;

    // Start when pressing "enter"
    if (gameState === "menu" && e.code === "Enter") startGame();

    if (gameState === "about" && e.code === "Escape") gameState = "menu";
});


// When a key is released, mark it false
document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});




// ===== PLAYER MOVEMENT =====
function movePlayer() {
    // Move left
    if (keys["ArrowLeft"] && player.x > 0) { //Prevents player from moving past the left edge
        player.x -= player.speed;
    }
    // Move right
    if (keys["ArrowRight"] && player.x + player.width < canvas.width) { //Prevents the right side of the player from leaving the screen
        player.x += player.speed;
    }
    // Jump: only if on the ground
    if (keys["ArrowUp"] && player.onGround) {
        player.dy = player.jumpPower; // Give upward speed
        player.onGround = false;      // No longer on ground while in air
    }
}




let fallingInHole = false;
// ===== GRAVITY & FLOOR =====
function applyGravity() {
    // Increase vertical speed by gravity
    player.dy += player.gravity;
    // Apply vertical speed
    player.y += player.dy;

    let standingOnFloor = false;
    fallingInHole = false;

    for (let hole of holes) {
        const fullyInsideHole =
            player.x >= hole.x &&
            player.x + player.width <= hole.x + hole.width;
        if (fullyInsideHole) {
            fallingInHole = true;
        }
    }

    if (!fallingInHole && player.y + player.height >= floor.y) {
        player.y = floor.y - player.height;
        player.dy = 0;
        player.onGround = true;
        standingOnFloor = true;
    }
    if (!standingOnFloor) {
        player.onGround = false;
    }
}



// ===== COLLISIONS =====
function checkRoofCollision() {
    for (let roof of roofs) {
        // ===== LANDING ON TOP =====
        if (
            player.dy > 0 &&
            player.x + player.width > roof.x &&
            player.x < roof.x + roof.width &&
            player.y + player.height >= roof.y &&
            player.y + player.height - player.dy <= roof.y
        ) {
            player.y = roof.y - player.height;
            player.dy = 0;
            player.onGround = true;
        }
        // ===== LANDING ON TOP =====
        if (
            player.dy < 0 &&
            player.x + player.width > roof.x &&
            player.x < roof.x + roof.width &&
            player.y <= roof.y + roof.height &&
            player.y - player.dy >= roof.y + roof.height
        ) {
            player.y = roof.y + roof.height;
            player.dy = 0;
        }
        // ===== HIT FROM LEFT SIDE =====
        if (
            player.x + player.width > roof.x &&
            player.x < roof.x &&
            player.y + player.height > roof.y &&
            player.y < roof.y + roof.height
        ) {
            player.x = roof.x - player.width;
        }
        if (
            player.x < roof.x + roof.width &&
            player.x + player.width > roof.x + roof.width &&
            player.y + player.height > roof.y &&
            player.y < roof.y + roof.height
        ) {
            player.x = roof.x + roof.width;
        }
    }
}

function checkKeyCollision() {
    if (!key.collected &&
        player.x < key.x + key.width &&
        player.x + player.width > key.x &&
        player.y < key.y + key.height &&
        player.y + player.height > key.y) {
        key.collected = true;
        hasKey = true;
        console.log("Key collected!");
    }
}

function checkSpikeCollision() {
    for (let spike of spikes) {
        if (
            player.x < spike.x + spike.width &&
            player.x + player.width > spike.x &&
            player.y < spike.y + spike.height &&
            player.y + player.height > spike.y
        ) {
            loseLife();
        }
    }
}

function checkHoleFall() {
    for (let hole of holes) {
        const fullyInsideHole =
            player.x >= hole.x &&
            player.x + player.width <= hole.x + hole.width;

        const fellBelowScreen =
            player.y > canvas.height;// Player dies ONLY when fully below the screen

        if (fullyInsideHole && fellBelowScreen) {
            loseLife();

        }
    }
}

function checkDoorCollision() {
    const touchingDoor =
        player.x < door.x + door.width &&
        player.x + player.width > door.x &&
        player.y < door.y + door.height &&
        player.y + player.height > door.y;
    const fullyInFrontOfDoor =
        player.x >= door.x &&
        player.x + player.width <= door.x + door.width &&
        player.y + player.height >= door.y &&
        player.y <= door.y + door.height

    //door opens when touched with a key
    if (touchingDoor && hasKey) {
        door.open = true;
    }

    // only wins if in front of the door and the dpoor is open
    if (door.open && fullyInFrontOfDoor) {
        finishLevel();
    }
}


// ===== TIMER =====
function startTimer() {
    // If a timer already exists, stop it
    if (timerInterval) {
        clearInterval(timerInterval);
    }// Create a new timer that runs every 1 second
    timerInterval = setInterval(() => { //arrow function
        timeLeft = timeLeft - 1;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeFailures++; //timeFailures = timeFailures + 1;
            resetLevel();
            startTimer();
        }
    }, 1000);
}

// ===== RESET & LIVES =====
function resetLevel() {
    loadLevel(currentLevel);
}

function loseLife() {
    lives--;
    console.log("Lives left:", lives);

    if (lives <= 0) {
        lives = 3;
        startGame();
    }
    else {
        resetLevel();
    }
}


// ===== FINISH LEVEL =====
function finishLevel() {
    clearInterval(timerInterval);
    gameState = "win";
}



// ===== DRAW FUNCTIONS =====
function drawFloor() {
    const tileWidth = 64;

    const hole = holes[0];

    // Left side of hole
    for (let x = 0; x < hole.x; x += tileWidth) {
        ctx.drawImage(images.floor, x, floor.y, tileWidth, floor.height);
    }

    // Right side of hole
    const rightStart = hole.x + hole.width;
    for (let x = rightStart; x < canvas.width; x += tileWidth) {
        ctx.drawImage(images.floor, x, floor.y, tileWidth, floor.height);
    }
}


function drawRoofs() {
    for (let roof of roofs) {
        ctx.drawImage(images.roof, roof.x, roof.y, roof.width, roof.height);
    };
}

function drawSpikes() {
    for (let spike of spikes) {
        ctx.drawImage(images.spikes, spike.x, spike.y, spike.width, spike.height);
    }
}

function drawPlayer() {
    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
}

function drawKey() {
    if (!key.collected) {
        ctx.drawImage(images.key, key.x, key.y, key.width, key.height);

    };
    ctx.fillStyle = "black"
    ctx.font = "30px Arial"
    ctx.fillText(`🔑 ${key.collected ? "✓" : "✗"}`, canvas.width / 2, 40)
}

function drawDoor() {
    const img = door.open ? images.doorOpen : images.doorClosed;
    ctx.drawImage(img, door.x, door.y, door.width, door.height);
}

function drawLives() {
    ctx.font = "24px Arial";

    for (let i = 0; i < lives; i++) {
        ctx.fillText("❤️", 15 + i * 30, 30);
    }
}

function drawTimer() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Time: " + timeLeft, 700, 30);
}




// ===== MAIN DRAW =====
function drawGame() {
    drawBackground();
    drawFloor();
    drawRoofs();
    drawSpikes();
    drawDoor();
    drawPlayer();
    drawKey();
    drawLives();
    drawTimer();
}


// ===== UPDATE LOOP =====
function updateGame() {
    movePlayer();
    applyGravity();
    checkRoofCollision();
    checkKeyCollision();
    checkSpikeCollision();
    checkHoleFall();
    checkDoorCollision();
}


// ===== START GAME =====
function startGame() {
    lives = 3;
    timeFailures = 0;
    loadLevel(currentLevel);
    startTimer();
    gameState = "playing";
}


// ===== GAME LOOP =====
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //until all images are loaded
    if (imagesLoaded < TOTAL_IMAGES) {
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.fillText("Loading...", 330, 200);
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState === "menu") {
        drawMenu();
    }

    else if (gameState === "about") {
        drawAbout();
    }

    else if (gameState === "playing") {
        updateGame();
        drawGame();
    }

    else if (gameState === "win")
        drawWinMenu();

    requestAnimationFrame(gameLoop);

}

gameLoop();
//draft
function drawMenu() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.fillText("WELCOME TO KEY QUEST", 180, 120);

    // Start button
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);
    ctx.fillStyle = "black";
    ctx.font = "22px Arial";
    ctx.fillText("START", 365, 232);

    // About button
    ctx.fillStyle = "#3498db";
    ctx.fillRect(aboutButton.x, aboutButton.y, aboutButton.width, aboutButton.height);
    ctx.fillStyle = "black";
    ctx.fillText("ABOUT", 365, 302);
}

function drawAbout() {
    // Dark background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Info box
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(150, 100, 500, 220);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("HOW TO PLAY", 320, 140);

    ctx.font = "16px Arial";
    ctx.fillText("• Use Arrow keys to move and jump", 190, 180);
    ctx.fillText("• Collect the key to open the door", 190, 210);
    ctx.fillText("• Avoid falling into the hole", 190, 240);
    ctx.fillText("• Finish before time runs out", 190, 270);
    ctx.fillText("Press ESC to go back", 280, 310);
}


function drawWinMenu() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText("LEVEL 1 COMPLETED!", 220, 120);

    ctx.font = "20px Arial";
    ctx.fillText("Lives remaining: " + lives, 300, 180);

    const displayedTime = timeFailures > 0 ? 0 : timeLeft;
    ctx.fillText("Time left: " + displayedTime, 300, 210);

    // Restart button
    ctx.fillStyle = "#f12d0f";
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
    ctx.fillStyle = "black";
    ctx.fillText("RESTART", 355, 300);

    // Next level button
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(nextButton.x, nextButton.y, nextButton.width, nextButton.height);
    ctx.fillStyle = "black";
    ctx.fillText("LEVEL 2", 365, 370);
}




// // MOUSE CLICK HANDLING
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (gameState === "menu") {
        // Start
        if (
            mouseX > startButton.x &&
            mouseX < startButton.x + startButton.width &&
            mouseY > startButton.y &&
            mouseY < startButton.y + startButton.height
        ) {
            startGame();
        }

        // About
        if (
            mouseX > aboutButton.x &&
            mouseX < aboutButton.x + aboutButton.width &&
            mouseY > aboutButton.y &&
            mouseY < aboutButton.y + aboutButton.height
        ) {
            gameState = "about";
        }
    }
});

canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (gameState === "win") {
        // Restart
        if (
            x > restartButton.x &&
            x < restartButton.x + restartButton.width &&
            y > restartButton.y &&
            y < restartButton.y + restartButton.height
        ) {
            startGame();
        }

        // Level 2
        if (
            x > nextButton.x &&
            x < nextButton.x + nextButton.width &&
            y > nextButton.y &&
            y < nextButton.y + nextButton.height
        ) {
            window.location.href = "../level2/index.html";
        }
    }
});


//ESC key to return
document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && gameState === "about") {
        gameState = "menu";
    }
});


