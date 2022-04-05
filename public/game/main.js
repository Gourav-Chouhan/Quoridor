let currentMode = document.getElementById("move");
currentMode.style.backgroundColor = "#00ff00";
function isBox(a, b) {
  return a % 2 == 0 && b % 2 == 0;
}
let cvs;
let g;

function setup() {
  cvs = createCanvas(450, 450);
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
  fill(`${yourLoc.color}`);
  ellipse(
    g.grid[yourLoc.y][yourLoc.x].px + 1.5 * bw,
    g.grid[yourLoc.y][yourLoc.x].py + 1.5 * bw,
    3 * bw * 0.8,
    3 * bw * 0.8
  );

  fill(`${opponentLoc.color}`);

  // fill(opponentLoc.color);
  ellipse(
    g.grid[opponentLoc.y][opponentLoc.x].px + 1.5 * bw,
    g.grid[opponentLoc.y][opponentLoc.x].py + 1.5 * bw,
    3 * bw * 0.8,
    3 * bw * 0.8
  );
}

function draw() {
  if (playing) {
    g.show();
    // noLoop();
    if (turn && mode == "move") {
      for (let legalPlace of g.legalPlaces) {
        legalPlace.drawLegalPlace();
      }
    }
    if (turn) {
      document.getElementById("yourTurn").textContent = "Your Turn";
    } else {
      document.getElementById("yourTurn").textContent = "Opponent's Turn";
    }
    if (allSet && playing) {
      drawPiece();
      checkWinYou();
      // checkWinOpp();
    }
  }
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

function addBar(dx, dy, barMode, isVIP = false) {
  if (barMode == "hbar" && g.grid[dy][dx].hBlock == false) {
    g.grid[dy][dx - 1].blocked = true;
    g.grid[dy][dx + 1].blocked = true;
    if (isVIP) {
    } else if (isWhite) {
      if (
        !isLegal({ x: yourLoc.x, y: yourLoc.y }, 0) ||
        !isLegal({ x: opponentLoc.x, y: opponentLoc.y }, gridSize - 1)
      ) {
        // alert("illegal move");
        g.grid[dy][dx - 1].blocked = false;
        g.grid[dy][dx + 1].blocked = false;
        return false;
      }
    } else {
      if (
        !isLegal({ x: yourLoc.x, y: yourLoc.y }, gridSize - 1) ||
        !isLegal({ x: opponentLoc.x, y: opponentLoc.y }, 0)
      ) {
        // alert("illegal move");
        g.grid[dy][dx - 1].blocked = false;
        g.grid[dy][dx + 1].blocked = false;
        return false;
      }
    }
    dx + 2 < gridSize ? (g.grid[dy][dx + 2].hBlock = true) : null;
    dx - 2 > 0 ? (g.grid[dy][dx - 2].hBlock = true) : null;
    g.grid[dy][dx].vBlock = true;
    g.grid[dy][dx].hBlock = true;
    g.grid[dy][dx].filled = "hbar";
    g.blockedDots.push(g.grid[dy][dx]);

    return true;
  } else if (barMode == "vbar" && g.grid[dy][dx].vBlock == false) {
    g.grid[dy - 1][dx].blocked = true;
    g.grid[dy + 1][dx].blocked = true;
    if (isVIP) {
    } else if (!isLegal({ x: yourLoc.x, y: yourLoc.y }, 0)) {
      // alert("illegal move");
      g.grid[dy - 1][dx].blocked = false;
      g.grid[dy + 1][dx].blocked = false;
      return false;
    }
    dy + 2 < gridSize ? (g.grid[dy + 2][dx].vBlock = true) : null;
    dy - 2 > 0 ? (g.grid[dy - 2][dx].vBlock = true) : null;
    g.grid[dy][dx].vBlock = true;
    g.grid[dy][dx].hBlock = true;
    g.blockedDots.push(g.grid[dy][dx]);
    g.grid[dy][dx].filled = "vbar";
    return true;
  }
  return false;
}

socket.on("matchMoves", (data) => {
  if (data.type == "bar") {
    addBar(data.dx, data.dy, data.mode, true);
  } else if (data.type == "move") {
    opponentLoc = {
      x: data.newLocation.x,
      y: data.newLocation.y,
      color: opponentLoc.color,
    };
    g.grid[data.prevLocation.y][data.prevLocation.x].hasPiece = false;
    g.grid[data.newLocation.y][data.newLocation.x].hasPiece = true;
  } else if (data.type == "matchOver") {
    // alert("You Loose");
  } else if (data.type == "disconnect") {
    showPopUp(data.msg);
  }
  g.getLegalPlaces();
  turn = true;
});

document.getElementById("canvas-container").addEventListener("click", (e) => {
  if (turn) {
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
      if (!dotPlace) return;
      let dx = dotPlace.x;
      let dy = dotPlace.y;
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

function showPopUp(msg) {
  document.getElementById("pop-up").style.display = "flex";
  document.getElementById("pop-up-message").textContent = msg;
}

function backToHome() {
  //reload the page
  window.location.reload();
  // document.getElementById("container").style.display = "none";
  // document.getElementById("menu").style.display = "flex";
  // document.getElementById("pop-up").style.display = "none";
  // g = new Grid(gridSize);
  // mode = "move";
  // turn = false;
  // document.getElementById("findRandom").textContent = "Find Random";
  // playing = false;
  // document.getElementById("canvas-container").style.transform = "rotate(0deg)";
  // socket.emit("toIdleMode", socketId);
}
