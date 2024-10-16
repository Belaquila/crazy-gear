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
      this.updateStuckObstacles();
    }
  }

  moveUp() {
    const board = document.getElementById("board");
    if (this.positionY < board.clientHeight - this.height) {
      this.positionY += 10;
      this.domElement.style.bottom = this.positionY + "px";
      this.updateStuckObstacles();
    }
  }

  moveDown() {
    if (this.positionY > 0) {
      this.positionY -= 10;
      this.domElement.style.bottom = this.positionY + "px";
      this.updateStuckObstacles();
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

  removeObstacle() {
    this.domElement.remove();
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
      game.collisionCount++;
      document.querySelector("#integrity span").innerHTML = `${100 - 2 * game.collisionCount}`;
      let integrity = 100 - 2 * game.collisionCount;
      game.updateLifeBar(integrity); 
    }

    if (game.collisionCount === 50) {
      document.getElementById("player").classList.add("sparkle");

      this.domElement.classList.add("sparkle");
      sparksEffect(player.positionX, player.positionY, "orangeimpact", 25);

      setTimeout(() => {
        this.domElement.classList.remove("sparkle");

      }, 4000);

      setTimeout(() => {
        location.href = "./gameover.html";
      }, 3000);
    }
  }

  stickObstacleToPlayer(player) {
    // Calculate the offset between player and obstacle at collision
    this.collisionOffsetX = this.positionX - player.positionX;
    this.collisionOffsetY = this.positionY - player.positionY;

    player.addStuckObstacle(this);
    this.updatePositionBasedOnPlayer(player); // Align immediately

    // is it the right moment to call ?
    game.updateCount(player);
    game.updateScore();
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
    this.domElement.style.transition = "0.05s";
    this.domElement.style.left = this.positionX + "px";
    this.domElement.style.bottom = this.positionY + "px";
  }
}

function isArithmetic(arr) {
  if (arr.length < 2) return true;
  let diff = arr[1] - arr[0];

  for (let i = 2; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return true;
}

function isGeometric(arr) {
  if (arr.length < 2 || arr[0] === 0) return false;
  let ratio = arr[1] / arr[0];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] / arr[i - 1] !== ratio) {
      return false;
    }
  }
  return true;
}

class Game {
  constructor(player) {
    this.player = player;
    this.count = [0, 0, 0]; //"C", "S", "T"
    this.duration = 0; // in seconds
    this.difficulty = 1; // from 1 to 5 , it will make the obstacles fall faster.
    this.score = 0;
    this.collisionCount = 0;
  }

  updateCount(player) {
    //access the obstacles array where I put all sticking obstacles and make the count.
    const countObstaclesContainer = document.getElementById("count");

    this.count = [0, 0, 0];

    if (player.obstacles.length === 0) {
      document.querySelector("#count-circles span").innerHTML = `0`;
      document.querySelector("#count-squares span").innerHTML = `0`;
      document.querySelector("#count-triangles span").innerHTML = `0`;
    } else {
      player.obstacles.forEach((obstacle, index) => {
        if (obstacle.isSticking) {
          obstacle.shape === "C"
            ? this.count[0]++
            : obstacle.shape === "S"
            ? this.count[1]++
            : obstacle.shape === "T"
            ? this.count[2]++
            : true;
        }
      });


      document.querySelector("#count-circles span").innerHTML = `${this.count[0]}`;
      document.querySelector("#count-squares span").innerHTML = `${this.count[1]}`;
      document.querySelector("#count-triangles span").innerHTML = `${this.count[2]}`;
    }
  }

  updateScore() {
    //player should catch the same number of abstacles to score
    //get an arithmetic list of connt -> surprise
    //get a gometric list of count -> surprise

    let sum = this.count.reduce((acc, e) => (acc += e), 0);
    let scoreOccurence = 0;

    if (isArithmetic(this.count) && this.count[0] !== 0) {
      scoreOccurence++;
      
      this.score += sum * 2;
      this.count = [0, 0, 0]; // reinitialize count

      player.obstacles.forEach((obstacle) => {
        obstacle.removeObstacle();
      });
      player.obstacles = [];
      this.updateCount(player);
      document.querySelector("#score span").innerHTML = `${this.score}`; // should update immediatly the score but ot does not.

      sparksEffect(player.positionX, player.positionY, "yellowstar", this.score);
      sparksEffect(1000, 500, "yellowstar", this.score);

    } else if (isGeometric(this.count) && this.count[0] !== 1) {
      scoreOccurence++;
      
      this.score += sum * 3;
      this.count = [0, 0, 0]; // reinitialize count
      player.obstacles.forEach((obstacle) => {
        obstacle.removeObstacle();
      });
      player.obstacles = [];

      sparksEffect(player.positionX, player.positionY, "yellowstar", this.score);
      sparksEffect(1000, 600, "yellowstar", this.score);

      this.updateCount(player);
      document.querySelector("#score span").innerHTML = `${this.score}`;
    }
  }
  updateLifeBar(integrity) {
    const lifeBar = document.getElementById('life-bar');
    //const integrityValue = document.getElementById('integrity-value');
    
    // Update the integrity percentage text
    //integrityValue.innerText = integrity + '%';

    // Update the width of the life bar
    lifeBar.style.width = integrity + '%';

    // Change color based on integrity value
    if (integrity < 20) {
        lifeBar.style.backgroundColor = 'red';
        lifeBar.style.width = '100%'
    } else if (integrity < 35) {
        lifeBar.style.backgroundColor = 'orange';
    } else {
        lifeBar.style.backgroundColor = 'green';
    }
    }
}

class Spark {
  constructor(X, Y, format) {
    this.sizeRatio = Math.random();
    this.positionX = X + 100 * Math.random();
    this.positionY = Y + 100 * Math.random(); //player.positionY + (this.sizeRatio)*100
    this.width = 5;
    this.height = 10;
    this.domElement = null;
    this.format = format;

    this.createDomElement();
  }

  createDomElement() {
    this.domElement = document.createElement("img");
    this.domElement.src = `./images/${this.format}.svg`;
    this.domElement.className = "spark";
    this.domElement.style.width = this.width * (1 + this.sizeRatio) + "px";
    this.domElement.style.height = this.height * (1 + this.sizeRatio) + "px";
    this.domElement.style.left = this.positionX + "px";
    this.domElement.style.bottom = this.positionY + "px";

    const board = document.getElementById("board");
    board.appendChild(this.domElement);
  }

  move() {
    for (let i = 0; i < 10; i++) {
      this.positionX++;
      this.positionY--;
      this.domElement.style.bottom = this.positionY + "px";
    }
  }

  sparkDesappear() {
    this.domElement.remove();
  }

}


function sparksEffect(X, Y, format, nbSparks) {

  const sparksArr = [];

  for (let i = 0; i < nbSparks; i++) {
    //let X = player.positionX;
    //let Y = player.positionY;
    let newSpark = new Spark(X, Y, format);
    sparksArr.push(newSpark);
  }

  setInterval(() => {
    sparksArr.forEach((sparkInstance) => {
      sparkInstance.move();
    });
  }, 500);

  setTimeout(() => {
    setInterval(() => {
      sparksArr.forEach((sparkInstance) => {
        sparkInstance.sparkDesappear();
      });
    }, 500);
  }, 3000);
}

const player = new Player();
const game = new Game(player);

const obstacleArr = [];

// Create obstacles periodically
setInterval(() => {
  const newObstacle = new Obstacle();
  obstacleArr.push(newObstacle);
}, 3000);

// Update obstacles
setInterval(() => {
  obstacleArr.forEach((obstacleInstance) => {
    obstacleInstance.moveDown();
    obstacleInstance.checkCollisionWithPlayer(player);
  });
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

