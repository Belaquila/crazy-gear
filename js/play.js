class Player {
  constructor() {
    this.width = 100;
    this.height = 100;
    const board = document.getElementById("board");
    this.positionX = board.clientWidth / 2 - this.width / 2;
    this.positionY = board.clientHeight / 2 - this.height / 2;
    this.domElement = null;
    this.currentRotation = 0;
    this.cavities = ["C", "S", "T", "C", "S", "T"]; // Circle, Square, Triangle
    this.position = [0, 1, 2, 3, 4, 5]; // Initial positions for cavities

    this.obstacles = []; // List of stuck obstacles to count.

    this.createDomElement();
  }

  createDomElement() {
    this.domElement = document.createElement("img");
    this.domElement.src = "./images/gear.svg";
    this.domElement.id = "player";
    this.domElement.style.left = this.positionX + "px";
    this.domElement.style.bottom = this.positionY + "px";
    const board = document.getElementById("board");
    board.appendChild(this.domElement);
  }

  moveRight() {
    const board = document.getElementById("board");
    if (this.positionX < board.clientWidth - this.width) {
      this.positionX += 10;
      this.domElement.style.left = this.positionX + "px";
      this.updateStuckObstacles(); // Update the position of stuck obstacles
    }
  }

  moveLeft() {
    if (this.positionX > 0) {
      this.positionX -= 10;
      this.domElement.style.left = this.positionX + "px";
      this.updateStuckObstacles(); // Update the position of stuck obstacles
    }
  }

  moveUp() {
    const board = document.getElementById("board");
    if (this.positionY < board.clientHeight - this.height) {
      this.positionY += 10;
      this.domElement.style.bottom = this.positionY + "px";
      this.updateStuckObstacles(); // Update the position of stuck obstacles
    }
  }

  moveDown() {
    if (this.positionY > 0) {
      this.positionY -= 10;
      this.domElement.style.bottom = this.positionY + "px";
      this.updateStuckObstacles(); // Update the position of stuck obstacles
    }
  }

  rotateRight() {
    this.currentRotation += 60;
    this.domElement.style.transform = `rotate(${this.currentRotation}deg)`;
    const lastElement = this.cavities.pop();
    this.cavities.unshift(lastElement);
    this.updateStuckObstacles(); // Update the rotation of stuck obstacles
  }

  rotateLeft() {
    this.currentRotation -= 60;
    this.domElement.style.transform = `rotate(${this.currentRotation}deg)`;
    const firstElement = this.cavities.shift();
    this.cavities.push(firstElement);
    this.updateStuckObstacles(); // Update the rotation of stuck obstacles
  }

  // Update positions of stuck obstacles when the player moves or rotates
  updateStuckObstacles() {
    this.obstacles.forEach((obstacle) => {
      obstacle.updatePositionBasedOnPlayer();
    });
  }

  // Add obstacle to list of stuck obstacles
  addStuckObstacle(obstacle) {
    this.obstacles.push(obstacle);
  }
}

class Obstacle {
  constructor() {
    const shapes = ["C", "S", "T"];
    this.shape = shapes[Math.floor(Math.random() * 3)];
    this.width = this.shape === "S" ? 26.6 : 33;
    this.height = this.width;
    this.currentRotation = 0;
    const board = document.getElementById("board");
    this.positionX = Math.random() * (board.clientWidth - this.width);
    this.positionY = board.clientHeight;
    this.domElement = null;
    this.isSticking = false;
    this.isMoving = true;

    this.collisionOffsetX = null;
    this.collisionOffsetY = null;

    this.createDomElement();
  }

  createDomElement() {
    this.domElement = document.createElement("img");
    this.domElement.src = `./images/${this.shape.toLowerCase()}.svg`;
    this.domElement.className = "obstacle";
    this.domElement.style.width = this.width + "px";
    this.domElement.style.height = this.height + "px";
    this.domElement.style.left = this.positionX + "px";
    this.domElement.style.bottom = this.positionY + "px";

    const board = document.getElementById("board");
    board.appendChild(this.domElement);
  }

  moveDown() {
    if (this.isMoving) {
      this.positionY--;
      this.domElement.style.bottom = this.positionY + "px";
    }
  }

  checkCollisionWithPlayer(player) {
    const isColliding =
      player.positionX < this.positionX + this.width &&
      player.positionX + player.width > this.positionX &&
      player.positionY < this.positionY + this.height &&
      player.positionY + player.height > this.positionY;

    if (isColliding && player.cavities[4] === this.shape && !this.isSticking) {
      this.isMoving = false;
      this.isSticking = true;
      this.stickObstacleToPlayer(player);
    } else if (
      isColliding &&
      player.cavities[4] !== this.shape &&
      !this.isSticking
    ) {
      
    const message = `game over: ${this.shape} does not match ${player.cavities[4]}`
    location.href ="./gameover.html"

    }
  }

  stickObstacleToPlayer(player) {
    // Calculate the offset between player and obstacle at collision
    this.collisionOffsetX = this.positionX - player.positionX;
    this.collisionOffsetY = this.positionY - player.positionY;

    player.addStuckObstacle(this);
    this.updatePositionBasedOnPlayer(player); // Align immediately
  }

  // Update the position of the obstacle based on player's position and rotation
  updatePositionBasedOnPlayer() {
    const angleInRadians = player.currentRotation * (Math.PI / 180);

    // Calculate the center position of the player
    const playerCenterX = player.positionX + 50; // Center X based on given coordinates
    const playerCenterY = player.positionY + 50; // Center Y based on given coordinates

    // Update the position of the obstacle based on the player's center position
    this.positionX = playerCenterX - this.width / 2; // Center the obstacle
    this.positionY = playerCenterY - this.height / 2; // Center the obstacle

    // idea const angleInRadians2 = ((player.currentRotation +90)*-1) * (Math.PI / 180); but didn't work ... so the update is manual.

    switch (this.shape) {
      case "S":
        this.positionX += Math.sin(angleInRadians) * (150 / 3);
        this.positionY += Math.cos(angleInRadians) * (150 / 3);
        break;
      case "C":
        const angleInRadiansC = (player.currentRotation - 60) * (Math.PI / 180);
        this.positionX += Math.sin(angleInRadiansC) * (150 / 3);
        this.positionY += Math.cos(angleInRadiansC) * (150 / 3);
        break;
      case "T":
        const angleInRadiansT = (player.currentRotation + 60) * (Math.PI / 180);
        this.positionX += Math.sin(angleInRadiansT) * (150 / 3);
        this.positionY += Math.cos(angleInRadiansT) * (150 / 3);
        break;
    }

    this.domElement.style.transform = `rotate(${
      180 + player.currentRotation
    }deg)`;

    // Apply the new positions
    this.domElement.style.left = this.positionX + "px";
    this.domElement.style.bottom = this.positionY + "px";
  }
}

const player = new Player();
const obstacleArr = [];

// Create obstacles periodically
setInterval(() => {
  const newObstacle = new Obstacle();
  obstacleArr.push(newObstacle);
}, 7000);

// Update obstacles
setInterval(() => {
  obstacleArr.forEach((obstacleInstance) => {
    obstacleInstance.moveDown();
    obstacleInstance.checkCollisionWithPlayer(player);
  });
  updatePositions();
}, 50);

document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") player.moveLeft();
  else if (e.code === "ArrowRight") player.moveRight();
  else if (e.code === "ArrowUp") player.moveUp();
  else if (e.code === "ArrowDown") player.moveDown();
});

document.addEventListener("click", (e) => {
  e.preventDefault();
  player.rotateLeft();
});

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  player.rotateRight();
});
