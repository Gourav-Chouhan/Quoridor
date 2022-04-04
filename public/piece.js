let boxColor = "#769656";
let groveColor = "#eeeed2";
let barrierColor = "#173f00";

const rows = 7;
const pl = rows - 1;
const gridSize = rows * 2 - 1;
let bw; //bar width
let shift;
let p1, p2;
let currentPlayer;
let mode = "move";

document.getElementById("canvas-container").style.backgroundColor = groveColor;

if (isWhite) {
  yourLoc = {
    x: pl,
    y: 0,
  };
  opponentLoc = {
    x: pl,
    y: gridSize - 1,
  };
} else {
  opponentLoc = {
    x: pl,
    y: 0,
  };
  yourLoc = {
    x: pl,
    y: gridSize - 1,
  };
}

class Piece {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  show() {
    fill(this.color);
    // ellipseMode(CENTER);
    this.px = this.x * 4 * bw + 1.5 * bw;
    this.py = this.y * 4 * bw + 1.5 * bw;
    ellipse(this.px, this.py, 2.5 * bw, 2.5 * bw);
  }

  drawCircle(x, y) {
    fill("#fffafa60");
    noStroke();
    // ellipseMode(CENTER);
    ellipse(x * 4 * bw + 1.5 * bw, y * 4 * bw + 1.5 * bw, 1.5 * bw, 1.5 * bw);
  }
  showLegalMoves() {
    this.drawCircle(this.x + 1, this.y);
    this.drawCircle(this.x, this.y + 1);
    this.drawCircle(this.x - 1, this.y);
    this.drawCircle(this.x, this.y - 1);
  }
}

class Place {
  constructor(x, y) {
    this.type = whoami(x, y);
    this.x = y;
    this.y = x;
    this.w;
    this.h;
    if (this.type == "box") {
      this.player = null;
      this.w = 3 * bw;
      this.h = 3 * bw;
      this.hasPiece = false;
    } else if (this.type == "dot") {
      this.vBlock = false;
      this.hBlock = false;
      this.w = bw;
      this.h = bw;
    } else {
      this.blocked = false;
      if (this.type == "vbar") {
        this.w = bw;
        this.h = 3 * bw;
      } else {
        this.w = 3 * bw;
        this.h = bw;
      }
    }
    this.px;
    this.py;
    if (this.type == "box") {
      this.color = boxColor;
      let fwdx = parseInt(this.x / 2);
      let fwdy = parseInt(this.y / 2);
      fwdx *= 4 * bw;
      fwdy *= 4 * bw;
      this.px = fwdx;
      this.py = fwdy;
      if (this.y == 0 && this.x == pl) {
        this.hasPiece = true;
        if (isWhite) {
          this.pcolor = "white";
        } else {
          this.pcolor = "black";
        }
      } else if (this.y == gridSize - 1 && this.x == pl) {
        this.hasPiece = true;
        if (isWhite) {
          this.pcolor = "black";
        } else {
          this.pcolor = "white";
        }
      }
    } else if (this.type == "vbar") {
      this.color = groveColor;
      let fwdx = 3 * bw;
      fwdx += parseInt(this.x / 2) * 4 * bw;
      let fwdy = 0;
      fwdy += parseInt(this.y / 2) * 4 * bw;
      this.px = fwdx;
      this.py = fwdy;
    } else if (this.type == "hbar") {
      this.color = groveColor;
      let fwdx = 0;
      fwdx += parseInt(this.x / 2) * 4 * bw;
      let fwdy = 3 * bw;
      fwdy += parseInt(this.y / 2) * 4 * bw;
      this.px = fwdx;
      this.py = fwdy;
    } else if (this.type == "dot") {
      this.color = groveColor;
      let fwdx = 3 * bw;
      fwdx += parseInt(this.x / 2) * 4 * bw;
      let fwdy = 3 * bw;
      fwdy += parseInt(this.y / 2) * 4 * bw;
      this.px = fwdx;
      this.py = fwdy;
    }
  }
  show() {
    fill(this.color);
    rect(this.px, this.py, this.w, this.h, 7);
    if (this.hasPiece) {
      fill(this.pcolor);
      ellipse(
        this.px + 1.5 * bw,
        this.py + 1.5 * bw,
        this.w * 0.8,
        this.w * 0.8
      );
    }
  }

  drawLegalPlace() {
    fill("red");
    ellipse(this.px + 1.5 * bw, this.py + 1.5 * bw, this.w * 0.3, this.w * 0.3);
  }
}

class Grid {
  constructor(size) {
    this.size = size;
    this.dots = [];
    this.grid = [];
    this.blockedDots = [];
    this.legalPlaces = [];
    for (let i = 0; i < size; i++) {
      this.grid[i] = [];
      for (let j = 0; j < size; j++) {
        this.grid[i][j] = new Place(i, j);
        if (this.grid[i][j].type == "dot") {
          this.dots.push(this.grid[i][j]);
        }
      }
    }
    this.getLegalPlaces();
  }

  show() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.grid[i][j].show();
      }
    }
    for (let bd of this.blockedDots) {
      // blocked dots
      strokeWeight(4);
      if (bd.filled == "hbar") {
        fill(barrierColor);
        stroke(groveColor);
        rect(bd.px - 3 * bw, bd.py, 7 * bw, bd.h, 7);
      } else {
        fill(barrierColor);
        stroke(groveColor);

        rect(bd.px, bd.py - 3 * bw, bd.w, 7 * bw, 7);
      }
      strokeWeight(0);
    }
  }

  getIndex(x, y) {
    let minPlace;
    let minDist = Infinity;
    for (let i = 0; i < this.dots.length; i++) {
      let distt = dist(x, y, this.dots[i].px, this.dots[i].py);
      if (distt < minDist) {
        minDist = distt;
        minPlace = this.dots[i];
      }
    }
    return minPlace;
  }

  getLegalPlaces() {
    this.legalPlaces = [];
    let { x, y } = yourLoc;
    if (x - 1 > 0 && !this.grid[y][x - 1].blocked) {
      if (!this.grid[y][x - 2].hasPiece) {
        this.legalPlaces.push(this.grid[y][x - 2]);
      }
    }
  }
}
