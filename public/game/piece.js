let boxColor = "#769656";
let groveColor = "#eeeed2";
let barrierColor = "#173f00";

let bw; //bar width
let shift;
let p1, p2;
let currentPlayer;
let mode = "move";

document.getElementById("canvas-container").style.backgroundColor = groveColor;

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
    if (minDist > 1.5 * bw) {
      return null;
    }
    return minPlace;
  }

  getLegalPlaces() {
    this.legalPlaces = [];
    let { x, y } = yourLoc;
    if (x - 1 > 0 && !this.grid[y][x - 1].blocked) {
      if (!this.grid[y][x - 2].hasPiece) {
        this.legalPlaces.push(this.grid[y][x - 2]);
      } else {
        if (x - 3 > 0) {
          if (!this.grid[y][x - 3].blocked) {
            this.legalPlaces.push(this.grid[y][x - 4]);
          } else {
            if (!this.grid[y - 1][x - 2].blocked) {
              this.legalPlaces.push(this.grid[y - 2][x - 2]);
            }
            if (!this.grid[y + 1][x - 2].blocked) {
              this.legalPlaces.push(this.grid[y + 2][x - 2]);
            }
          }
        } else {
          if (!this.grid[y - 1][x - 2].blocked) {
            this.legalPlaces.push(this.grid[y - 2][x - 2]);
          }
          if (!this.grid[y + 1][x - 2].blocked) {
            this.legalPlaces.push(this.grid[y + 2][x - 2]);
          }
        }
      }
    }

    if (y - 1 > 0 && !this.grid[y - 1][x].blocked) {
      if (!this.grid[y - 2][x].hasPiece) {
        this.legalPlaces.push(this.grid[y - 2][x]);
      } else {
        if (y - 3 > 0) {
          if (!this.grid[y - 3][x].blocked) {
            this.legalPlaces.push(this.grid[y - 4][x]);
          } else {
            if (!this.grid[y - 2][x - 1].blocked) {
              this.legalPlaces.push(this.grid[y - 2][x - 2]);
            }
            if (!this.grid[y - 2][x + 1].blocked) {
              this.legalPlaces.push(this.grid[y - 2][x + 2]);
            }
          }
        } else {
          if (!this.grid[y - 2][x - 1].blocked) {
            this.legalPlaces.push(this.grid[y - 2][x - 2]);
          }
          if (!this.grid[y - 2][x + 1].blocked) {
            this.legalPlaces.push(this.grid[y - 2][x + 2]);
          }
        }
      }
    }

    if (x + 1 < this.size && !this.grid[y][x + 1].blocked) {
      if (!this.grid[y][x + 2].hasPiece) {
        this.legalPlaces.push(this.grid[y][x + 2]);
      } else {
        if (x + 3 < this.size) {
          if (!this.grid[y][x + 3].blocked) {
            this.legalPlaces.push(this.grid[y][x + 4]);
          } else {
            if (!this.grid[y - 1][x + 2].blocked) {
              this.legalPlaces.push(this.grid[y - 2][x + 2]);
            }
            if (!this.grid[y + 1][x + 2].blocked) {
              this.legalPlaces.push(this.grid[y + 2][x + 2]);
            }
          }
        } else {
          if (!this.grid[y - 1][x + 2].blocked) {
            this.legalPlaces.push(this.grid[y - 2][x + 2]);
          }
          if (!this.grid[y + 1][x + 2].blocked) {
            this.legalPlaces.push(this.grid[y + 2][x + 2]);
          }
        }
      }
    }

    if (y + 1 < this.size && !this.grid[y + 1][x].blocked) {
      if (!this.grid[y + 2][x].hasPiece) {
        this.legalPlaces.push(this.grid[y + 2][x]);
      } else {
        if (y + 3 < this.size) {
          if (!this.grid[y + 3][x].blocked) {
            this.legalPlaces.push(this.grid[y + 4][x]);
          } else {
            if (!this.grid[y + 2][x - 1].blocked) {
              this.legalPlaces.push(this.grid[y + 2][x - 2]);
            }
            if (!this.grid[y + 2][x + 1].blocked) {
              this.legalPlaces.push(this.grid[y + 2][x + 2]);
            }
          }
        } else {
          if (!this.grid[y + 2][x - 1].blocked) {
            this.legalPlaces.push(this.grid[y + 2][x - 2]);
          }
          if (!this.grid[y + 2][x + 1].blocked) {
            this.legalPlaces.push(this.grid[y + 2][x + 2]);
          }
        }
        ("");
      }
    }
  }
}

function fireThatFunc() {
  g.getLegalPlaces();
}

function isLegalRec(tempGrid, cloc, destination) {
  let { x, y } = cloc;
  visited[y][x] = true;
  if (y == destination) {
    return true;
  }
  let a = false;
  let b = false;
  let c = false;
  let d = false;
  if (x - 1 > 0 && !tempGrid[y][x - 1].blocked && !visited[y][x - 2]) {
    a = isLegalRec(tempGrid, { x: x - 2, y }, destination);
  }
  if (y - 1 > 0 && !tempGrid[y - 1][x].blocked && !visited[y - 2][x]) {
    b = isLegalRec(tempGrid, { x, y: y - 2 }, destination);
  }
  if (x + 1 < g.size && !tempGrid[y][x + 1].blocked && !visited[y][x + 2]) {
    c = isLegalRec(tempGrid, { x: x + 2, y }, destination);
  }
  if (y + 1 < g.size && !tempGrid[y + 1][x].blocked && !visited[y + 2][x]) {
    d = isLegalRec(tempGrid, { x, y: y + 2 }, destination);
  }

  return a || b || c || d;
}

let visited = [];

function isLegal(cloc, destination) {
  visited = [];
  for (let i = 0; i < gridSize; i++) {
    visited[i] = new Array(gridSize).fill(false);
  }
  let tempGrid = JSON.parse(JSON.stringify(g.grid));

  return isLegalRec(tempGrid, cloc, destination);
}

function checkWinYou() {
  let res = false;
  if (isWhite) {
    if (yourLoc.y == 0) {
      console.log("You win");
      res = true;
    }
  } else {
    if (yourLoc.y == gridSize - 1) {
      showPopUp("You Won");
      res = true;
    }
  }
  if (res) {
    playing = false;
    socket.emit("matchMoves", {
      type: "disconnect",
      msg: "You Loose!",
      to: match.p2.socketId,
    });
  }

  return res;
}
