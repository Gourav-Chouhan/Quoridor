let currentMode = document.getElementById("move");
currentMode.style.backgroundColor = "#00ff00";
function isBox(a, b) {
  return a % 2 == 0 && b % 2 == 0;
}
let cvs;
let g;

function setup() {
  cvs = createCanvas(500, 500);
  cvs.parent("canvas-container");
  noStroke();
  cvs.className = "cvs";
  background("#eeeed2");
  bw = width / (4 * rows - 1);
  // shift = bw * 0.1;
  g = new Grid(gridSize);
}

function drawPiece() {
  // fill("red");
  // console.log(yourLoc.color);
  fill(`${yourLoc.color}`);
  ellipse(
    g.grid[yourLoc.y][yourLoc.x].px + 1.5 * bw,
    g.grid[yourLoc.y][yourLoc.x].py + 1.5 * bw,
    3 * bw * 0.8,
    3 * bw * 0.8
  );

  fill(`${opponentLoc.color}`);

  // fill(opponentLoc.color);
  // console.log(yourLoc.color, opponentLoc.color);
  ellipse(
    g.grid[opponentLoc.y][opponentLoc.x].px + 1.5 * bw,
    g.grid[opponentLoc.y][opponentLoc.x].py + 1.5 * bw,
    3 * bw * 0.8,
    3 * bw * 0.8
  );
}

function draw() {
  g.show();
  // noLoop();
  if (turn) {
    for (let legalPlace of g.legalPlaces) {
      legalPlace.drawLegalPlace();
    }
  }
  if (turn) {
    document.getElementById("yourTurn").textContent = "Your Turn";
  } else {
    document.getElementById("yourTurn").textContent = "Opponent's Turn";
  }
  allSet ? drawPiece() : null;
  // Place.drawPiece();
}

function togglePlayer() {
  if (currentPlayer == p1) {
    currentPlayer = p2;
  } else {
    currentPlayer = p1;
  }
}

function whoami(i, j) {
  if (i % 2 == 0 && j % 2 == 0) return "box";
  if (i % 2 == 0 && j % 2 == 1) return "vbar";
  if (i % 2 == 1 && j % 2 == 0) return "hbar";
  if (i % 2 == 1 && j % 2 == 1) return "dot";
}

function toHbarMode() {
  currentMode.style.backgroundColor = "#ff8cb8";
  currentMode = document.getElementById("hbar");
  currentMode.style.backgroundColor = "#00ff00";
  mode = "hbar";
}

function toVbarMode() {
  currentMode.style.backgroundColor = "#ff8cb8";
  currentMode = document.getElementById("vbar");
  currentMode.style.backgroundColor = "#00ff00";

  mode = "vbar";
}

function toMoveMode() {
  currentMode.style.backgroundColor = "#ff8cb8";
  currentMode = document.getElementById("move");
  currentMode.style.backgroundColor = "#00ff00";

  mode = "move";
}

function addBar(dx, dy, barMode) {
  if (barMode == "hbar" && g.grid[dy][dx].hBlock == false) {
    dx + 2 < gridSize ? (g.grid[dy][dx + 2].hBlock = true) : null;
    dx - 2 > 0 ? (g.grid[dy][dx - 2].hBlock = true) : null;
    g.grid[dy][dx].vBlock = true;
    g.grid[dy][dx].hBlock = true;
    g.grid[dy][dx].filled = "hbar";
    g.grid[dy][dx - 1].blocked = true;
    g.grid[dy][dx + 1].blocked = true;
    g.blockedDots.push(g.grid[dy][dx]);
    return true;
  } else if (barMode == "vbar" && g.grid[dy][dx].vBlock == false) {
    dy + 2 < gridSize ? (g.grid[dy + 2][dx].vBlock = true) : null;
    dy - 2 > 0 ? (g.grid[dy - 2][dx].vBlock = true) : null;
    g.grid[dy][dx].vBlock = true;
    g.grid[dy][dx].hBlock = true;
    g.grid[dy - 1][dx].blocked = true;
    g.grid[dy + 1][dx].blocked = true;
    g.grid[dy][dx].filled = "vbar";
    g.blockedDots.push(g.grid[dy][dx]);
    return true;
  }
  return false;
}

socket.on("matchMoves", (data) => {
  // console.log(data);
  if (data.type == "bar") {
    addBar(data.dx, data.dy, data.mode);
  } else if (data.type == "move") {
    opponentLoc = {
      x: data.newLocation.x,
      y: data.newLocation.y,
      color: opponentLoc.color,
    };
    g.grid[data.prevLocation.y][data.prevLocation.x].hasPiece = false;
    g.grid[data.newLocation.y][data.newLocation.x].hasPiece = true;
  }
  g.getLegalPlaces();
  turn = true;
});

document.getElementById("canvas-container").addEventListener("click", (e) => {
  if (turn) {
    g.getIndex(e.offsetX, e.offsetY);
    if (mode == "move") {
      let minDist = Infinity;
      let minPlace = null;
      for (let i = 0; i < g.legalPlaces.length; i++) {
        let tempDist = dist(
          g.legalPlaces[i].px + 1.5 * bw,
          g.legalPlaces[i].py + 1.5 * bw,
          e.offsetX,
          e.offsetY
        );
        if (tempDist < minDist) {
          minDist = tempDist;
          minPlace = g.legalPlaces[i];
        }
      }
      console.log(minDist);
      if (minDist < 1.5 * bw) {
        let { x, y, color } = yourLoc;
        yourLoc = { x: minPlace.x, y: minPlace.y, color };
        g.grid[y][x].hasPiece = false;
        g.grid[minPlace.y][minPlace.x].hasPiece = true;
        socket.emit("matchMoves", {
          type: "move",
          prevLocation: { x, y },
          newLocation: { x: minPlace.x, y: minPlace.y },
          to: match.p2.socketId,
        });
        turn = false;
      }
    } else {
      let dotPlace = g.getIndex(e.offsetX, e.offsetY);
      let dx = dotPlace.x;
      let dy = dotPlace.y;
      console.log(dx, dy);
      if (addBar(dx, dy, mode)) {
        socket.emit("matchMoves", {
          type: "bar",
          mode: mode,
          dx: dx,
          dy: dy,
          to: match.p2.socketId,
        });
        turn = false;
      }
    }
  }
});
