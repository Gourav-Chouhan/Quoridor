let currentMode = document.getElementById("move");
currentMode.style.border = "#00ff00 4px solid";
function isBox(a, b) {
	return a % 2 == 0 && b % 2 == 0;
}
let cvs;
let g;
let moveSound;
let putBarSound;
let clickSound;
let matchFoundSound;
let popupSound;
let winSound;
let looseSound;
let errorSound;

function preload() {
	soundFormats("mp3", "ogg");
	moveSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/zapsplat_toy_board_game_token_plastic_move_on_board_x1.mp3?v=1649270788093"
	);
	putBarSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/household_audio_cassette_tape_case_put_down_on_table.mp3?v=1649273778126"
	);
	clickSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/zapsplat_technology_studio_speaker_active_power_switch_click_003_68875.mp3?v=1649271639458"
	);
	matchFoundSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/Match%20Found%20Valorant.mp3?v=1649271908325"
	);
	popupSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/zapsplat_cartoon_pop_bubble_etc_001_80358.mp3?v=1649272391138"
	);
	winSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/success-fanfare-trumpets-6185.mp3?v=1649274036645"
	);
	looseSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/negative_beeps-6008.mp3?v=1649274107486"
	);
	errorSound = loadSound(
		"https://cdn.glitch.global/6eea9dd5-f5d2-4281-b867-c7cdb44ad6af/zapsplat_multimedia_alert_error_003_26394.mp3?v=1649276860292"
	);
}

let yourTurnMessage = "Your Turn";

function setup() {
	let cvsWidth = min(window.innerWidth - 50, 500);
	cvs = createCanvas(cvsWidth, cvsWidth);
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
			document.getElementById("yourTurn").textContent = yourTurnMessage;
			document.getElementById("yourTurn").style.animation =
				"animateTurn 400ms ease-in";
		} else {
			document.getElementById("yourTurn").style.animation = "";

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
	clickSound.play();
	currentMode.style.border = "none";
	currentMode = document.getElementById("hbar");
	currentMode.style.border = "4px solid lightgreen";
	mode = "hbar";
}

function toVbarMode() {
	clickSound.play();
	currentMode.style.border = "none";
	currentMode = document.getElementById("vbar");
	currentMode.style.border = "4px solid lightgreen";

	mode = "vbar";
}

function toMoveMode() {
	clickSound.play();

	currentMode.style.border = "none";
	currentMode = document.getElementById("move");
	currentMode.style.border = "4px solid lightgreen";

	mode = "move";
}

function addBar(dx, dy, barMode, isVIP = false) {
	if (barMode == "hbar" && g.grid[dy][dx].hBlock == false) {
		g.grid[dy][dx - 1].blocked = true;
		g.grid[dy][dx + 1].blocked = true;
		if (isVIP) {
		} else if (true) {
			let whitePiece = yourLoc.color == "white" ? yourLoc : opponentLoc;
			let blackPiece = yourLoc.color == "black" ? yourLoc : opponentLoc;

			if (
				!isLegal({ x: whitePiece.x, y: whitePiece.y }, 0) ||
				!isLegal({ x: blackPiece.x, y: blackPiece.y }, gridSize - 1)
			) {
				// alert("illegal move");
				errorSound.play();
				yourTurnMessage = "Illegal Move!!!";
				document.getElementById("yourTurn").style.color = "red";
				setTimeout(() => {
					yourTurnMessage = "Your Turn";
					document.getElementById("yourTurn").style.color = "white";
				}, 600);
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
		} else if (true) {
			let whitePiece = yourLoc.color == "white" ? yourLoc : opponentLoc;
			let blackPiece = yourLoc.color == "black" ? yourLoc : opponentLoc;
			if (
				!isLegal({ x: whitePiece.x, y: whitePiece.y }, 0) ||
				!isLegal({ x: blackPiece.x, y: blackPiece.y }, gridSize - 1)
			) {
				// alert("illegal move");
				errorSound.play();
				yourTurnMessage = "Illegal Move!!!";
				document.getElementById("yourTurn").style.color = "red";
				setTimeout(() => {
					yourTurnMessage = "Your Turn";
					document.getElementById("yourTurn").style.color = "white";
				}, 600);
				g.grid[dy - 1][dx].blocked = false;
				g.grid[dy + 1][dx].blocked = false;
				return false;
			}
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
		putBarSound.play();
		addBar(data.dx, data.dy, data.mode, true);
	} else if (data.type == "move") {
		moveSound.play();
		opponentLoc = {
			x: data.newLocation.x,
			y: data.newLocation.y,
			color: opponentLoc.color,
		};
		g.grid[data.prevLocation.y][data.prevLocation.x].hasPiece = false;
		g.grid[data.newLocation.y][data.newLocation.x].hasPiece = true;
	} else if (data.type == "disconnect") {
		looseSound.play();
		showPopUp(data.msg);
	} else if (data.type == "chatMessage") {
		if (
			document
				.getElementById("optionsToggler")
				.parentElement.classList.contains("options-open") == false
		) {
			document.getElementById("optionsToggler").classList.add("notification");
		}
		document
			.getElementById("openMessagePannel")
			.classList.add("notification-msg");
		console.log(data);
		sendMessage(true, data.message);
		return;
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
				moveSound.play();
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
				putBarSound.play();
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
	popupSound.play();
	document.getElementById("pop-up").style.display = "flex";
	document.getElementById("pop-up-message").textContent = msg;
}

function backToHome() {
	//reload the page
	window.location.reload();
}
