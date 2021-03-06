let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let lastkeypressed = 'right';

const jim = new Image();
jim.src = "assets/hero.png";
const mij = new Image();
mij.src = "assets/heroback.png";
const bounce = document.getElementById('bounce');
bounce.volume= 0.2;
const coral = document.getElementById('coral');
const lose = document.getElementById('lose');
lose.volume= 0.2;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("keypress", keyPressHandler, false);
function keyDownHandler(e) {
  if(e.keyCode == 39 || e.keyCode === 68) {
    rightPressed = true;
    lastkeypressed = 'right';
  }
  else if(e.keyCode == 37 || e.keyCode === 65) {
    leftPressed = true;
    lastkeypressed = 'left';
  } else if (e.keyCode == 38) {
    e.preventDefault();
    upPressed = true;
  }
}
function keyUpHandler(e) {
  if(e.keyCode === 39 || e.keyCode === 68) {
    rightPressed = false;
  }
  else if(e.keyCode === 37 || e.keyCode === 65) {
    leftPressed = false;
  }
}
function keyPressHandler(e) {
  if(e.keyCode === 119 || e.keyCode === 32 || e.keyCode === 38) {
    e.preventDefault();
    upPressed = true;
  }
}
class Hero {
  constructor(options) {
    this.pos = options.pos;
    this.vel = options.vel;
    this.acc = [0,0.2];
    this.height = options.height;
    this.width = options.width;
    this.game = options.game;
    this.isDead = false;
    this.midjump = false;
    this.onPlatform = false;
    this.won = false;
    this.starting = true;
    this.lands = 0;
    this.lastJumpPos = 0;
    this.playbounce = true;
  }


  draw(ctx) {
    ctx.beginPath();
    if(this.won) {
      ctx.drawImage(jim, 193, 260, 95, 110, this.pos[0], this.pos[1], this.width, this.height);
    } else if (this.midjump && lastkeypressed === 'right') {
      ctx.drawImage(jim, 193, 260, 115, 130, this.pos[0], this.pos[1], this.width, this.height);
    } else if (lastkeypressed === 'left' && this.midjump) {
      ctx.drawImage(mij, 0, 260, 95, 120, this.pos[0], this.pos[1], this.width, this.height);
    }

    else if (lastkeypressed === 'left') {
      if (this.pos[0] % 78 < 13) {
        ctx.drawImage(mij, 193, 2, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
      } else if (this.pos[0] % 78 < 26) {
        ctx.drawImage(mij, 97, 2, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
      } else if (this.pos[0] % 78 < 39) {
        ctx.drawImage(mij, 10, 12, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
      } else if (this.pos[0] % 78 < 52) {
        ctx.drawImage(mij, 193, 122, 95, 130, this.pos[0], this.pos[1], this.width, this.height);
      } else if (this.pos[0] % 78 < 65) {
        ctx.drawImage(mij, 97, 126, 92, 125, this.pos[0], this.pos[1], this.width, this.height);
      } else {
        ctx.drawImage(mij, 15, 126, 92, 130, this.pos[0], this.pos[1], this.width, this.height);
      }
    }

    else if (this.pos[0] % 78 < 13) {
      ctx.drawImage(jim, 0, 2, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
    } else if (this.pos[0] % 78 < 26) {
      ctx.drawImage(jim, 100, 2, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
    } else if (this.pos[0] % 78 < 39) {
      ctx.drawImage(jim, 190, 12, 92, 116, this.pos[0], this.pos[1], this.width, this.height);
    } else if (this.pos[0] % 78 < 52) {
      ctx.drawImage(jim, 0, 122, 95, 130, this.pos[0], this.pos[1], this.width, this.height);
    } else if (this.pos[0] % 78 < 65) {
      ctx.drawImage(jim, 100, 126, 92, 125, this.pos[0], this.pos[1], this.width, this.height);
    } else {
      ctx.drawImage(jim, 190, 126, 92, 130, this.pos[0], this.pos[1], this.width, this.height);
    }
    ctx.closePath();
  }


  bounceOffJellyfish(jellyfish) {
    if (!this.isDead && jellyfish.isBouncable &&
      this.pos[1] + this.height > jellyfish.pos[1] + 5 &&
      this.pos[1] + this.height < jellyfish.pos[1] + jellyfish.width*2 &&
      this.pos[0] > jellyfish.pos[0] - 15 &&
      this.pos[0] < jellyfish.pos[0] + jellyfish.width*1.5
    ) {
      if (this.playbounce) {
        bounce.play();
      }
      this.vel = [0,-5];
      this.acc = [0,0.1];
      this.onPlatform = false;
      if (jellyfish.type === 'boss') {
        jellyfish.justhit = true;
      } else  {
        jellyfish.isDead = true;
      }
    }
  }
  killedByJellyfish(jellyfish) {
    if (this.pos[0] > jellyfish.pos[0] - jellyfish.width*27/40 &&
        this.pos[0] < jellyfish.pos[0] + jellyfish.width*65/40 &&
        this.pos[1] + this.height > jellyfish.pos[1] + jellyfish.height*2 &&
        this.pos[1] < jellyfish.pos[1] + jellyfish.height*2
    ) {
      if (!this.isDead && !this.won) {
      coral.pause();
      lose.play();
      this.isDead = true;
      this.lands = 0;
      }
    }
  }

  moveOnPlatform(platform) {
    if (this.pos[1] + this.height >= platform.pos[1] + platform.padding -5 &&
      this.pos[1] + this.height <= platform.pos[1] + platform.padding + 10 &&
      this.pos[0] < platform.pos[0] + platform.width &&
      this.pos[0] + this.width > platform.pos[0] && this.vel[1] > 0) {
        if (platform.type === 'finish') {
          this.won = true;
        } else {
          this.lastJumpPos = this.pos[0];
        }
        this.starting = false;
        this.onPlatform = true;
        this.lands++;
        this.midjump = false;
        this.pos[1] = platform.pos[1] - this.height;
        this.vel = [0,0];
        this.acc = [0,0.1];
        document.addEventListener("keypress", keyPressHandler, false);
    }
  }

  move(canvas) {
    if (this.pos[1] > canvas.height && !this.isDead && !this.won) {
      coral.pause();
      lose.play();
      this.isDead = true;
      this.lands = 0;
    }
    if (this.isDead) {
      this.color = 'green';

    } else {
      if (this.pos[0] < 3 && this.pos[0] > 0) {
        this.pos[0] = 3;
      }
      if (this.pos[0] + this.width > canvas.width - 3 && this.pos[0] + this.width < canvas.width) {
        this.pos[0] = canvas.width - this.width - 3;
      }
        this.pos[1] += this.vel[1];
        this.vel[1] += this.acc[1];

      if(rightPressed) {
        this.pos[0] += 2;
      }
      else if(leftPressed) {
        this.pos[0] -= 2;
      }
      if(upPressed && !this.midjump && this.vel[1] < 0.3) {
        this.onPlatform = false;
        this.vel = [0,-5];
        this.acc = [0,0.1];
        upPressed = false;
        this.midjump = true;
        document.removeEventListener("keypress", keyPressHandler, false);
      }
    }
  }
}

module.exports = Hero;
