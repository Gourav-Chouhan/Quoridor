const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(express.json());
const fs = require("fs");

let connected = [];
let queue = [];
let matches = [];

class Person {
	constructor(socketId) {
		this.socketId = socketId;
		this.authinticated = false;
		this.email = null;
		this.name = null;
		this.status = "idle";
	}
}

class Match {
	constructor(p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		// this.match_id = this.p1.socketId + this.p2.socketId;
		if (Math.random() > 0.5) {
			this.p1.turn = true;
			this.p2.turn = false;
		} else {
			this.p1.turn = false;
			this.p2.turn = true;
		}
	}
}

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/public/index.html");
});

app.get("/game", middleware, (req, res) => {
	verify(req.token)
		.then((data) => {
			app.use("/", express.static(path.join(__dirname, "public")));
			res.sendFile(__dirname + "/public/game/index.html");
		})
		.catch((err) => {
			if (err) {
				res.sendStatus(403);
			}
		});
});

function middleware(req, res, next) {
	const bearerHeader = req.headers["authorization"];
	if (typeof bearerHeader !== "undefined") {
		let token = bearerHeader.split(" ")[1];
		req.token = token;
		next();
	} else {
		res.sendStatus(403);
	}
}

io.on("connection", (socket) => {
	let person = new Person(socket.id);
	connected.push(person);
	socket.emit("welcome", person);

	socket.on("setInfo", (req) => {
		for (let i = 0; i < connected.length; i++) {
			if (connected[i].socketId == req.socketId) {
				connected[i].authinticated = true;
				connected[i].email = req.email;
				connected[i].name = req.name;
				connected[i].imageUrl = req.imageUrl;
				// console.log(typeof req);
				addPeople(req);
				return;
			}
		}
	});
	socket.on("test", (data) => {});

	function sendData() {
		for (let i = 0; i < connected.length; i++) {
			delete connected[i].matched;
		}
		socket.emit("takeOnlineInfo", connected);
		// for(let p of connected){
		//   console.log(p)
		//   console.log("_______________________________")
		// }
	}

	socket.on("getOnlineInfo", (data) => {
		sendData();
	});

	socket.on("sendMatchRequest", (data) => {
		const toSend = connected.find((elm) => elm.socketId == data.to);
		const yourInfo = connected.find((elm) => elm.socketId == socket.id);
		if (toSend && toSend.status == "idle") {
			io.to(data.to).emit("receiveMatchRequest", {
				from: socket.id,
				imageUrl: yourInfo.imageUrl,
				name: yourInfo.name,
			});
		}
	});

	socket.on("toSearchingMode", (socketId) => {
		for (let i = 0; i < connected.length; i++) {
			if (connected[i].socketId == socketId) {
				connected[i].status = "searching";
				queue.push(connected[i]);
				findMatch();
			}
		}
	});

	socket.on("toIdleMode", (socketId) => {
		for (let i = 0; i < connected.length; i++) {
			if (connected[i].socketId == socketId) {
				connected[i].status = "idle";
			}
		}
	});

	socket.on("makeMatch", (data) => {
		makeMatch(data.player1, data.player2);
	});

	socket.on("matchMoves", (data) => {
		io.to(data.to).emit("matchMoves", data);
		if (data.type == "disconnect") {
			for (let i = 0; i < matches.length; i++) {
				if (
					matches[i].p1.socketId == data.to ||
					matches[i].p2.socketId == data.to
				) {
					if (matches[i].p1.socketId == data.to) {
						addScore(matches[i].p1.email, false);
						addScore(matches[i].p2.email, true);
					} else {
						addScore(matches[i].p2.email, false);
						addScore(matches[i].p1.email, true);
					}
				}
				matches.splice(i, 1);
			}
		}
	});

	socket.on("disconnect", () => {
		for (let i = 0; i < connected.length; i++) {
			if (connected[i].socketId == socket.id) {
				connected.splice(i, 1);
			}
		}

		for (let i = 0; i < queue.length; i++) {
			if (queue[i].socketId == socket.id) {
				queue.splice(i, 1);
			}
		}

		for (let m of matches) {
			if (m.p1.socketId == socket.id) {
				matches.splice(matches.indexOf(m), 1);
				addScore(m.p2.email, true);
				addScore(m.p1.email, false);
				// console.log(m.p1);
				io.to(m.p2.socketId).emit("matchMoves", {
					type: "disconnect",
					name: m.p1.name,
					msg: "Your opponent has disconnected.",
				});
			}
			if (m.p2.socketId == socket.id) {
				matches.splice(matches.indexOf(m), 1);
				// console.log(m.p2);
				addScore(m.p2.email, false);
				addScore(m.p1.email, true);
				io.to(m.p1.socketId).emit("matchMoves", {
					type: "disconnect",
					name: m.p2.name,
					msg: "Your opponent has disconnected.",
				});
			}
		}
	});
});

server.listen(3000, () => {
	console.log("listening on *: " + 3000);
});

function findMatch() {
	if (queue.length >= 2) {
		let person1 = queue.shift();
		let person2 = queue.shift();
		let match = new Match(person1, person2);
		let match2 = new Match(person2, person1);
		io.to(person1.socketId).emit("matched", match);
		io.to(person2.socketId).emit("matched", match2);
		for (let i = 0; i < connected.length; i++) {
			if (connected[i].socketId == person1.socketId) {
				connected[i].status = "playing";
				connected[i].matched = person2;
			}
			if (connected[i].socketId == person2.socketId) {
				connected[i].status = "playing";
				connected[i].matched = person1;
			}
		}
		matches.push(new Match(person1, person2));
	}
}

function makeMatch(id1, id2) {
	let person1 = connected.find((elm) => elm.socketId == id1);
	let person2 = connected.find((elm) => elm.socketId == id2);
	let match = new Match(person1, person2);
	let match2 = new Match(person2, person1);
	io.to(person1.socketId).emit("matched", match);
	io.to(person2.socketId).emit("matched", match2);
	for (let i = 0; i < connected.length; i++) {
		if (connected[i].socketId == person1.socketId) {
			connected[i].status = "playing";
			connected[i].matched = person2;
		}
		if (connected[i].socketId == person2.socketId) {
			connected[i].status = "playing";
			connected[i].matched = person1;
		}
	}
	for (let i = queue.length - 1; i >= 0; i--) {
		if (queue[i].socketId == id1 || queue[i].socketId == id2) {
			queue.splice(i, 1);
		}
	}
	matches.push(new Match(person1, person2));
}

// google verification for web app

const { OAuth2Client } = require("google-auth-library");
// const { default: mongoose } = require("mongoose");
const client = new OAuth2Client(
	"1023157306896-gf853hu70rsca3vktm2hdpjldcfucoep.apps.googleusercontent.com"
);
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience:
			"1023157306896-gf853hu70rsca3vktm2hdpjldcfucoep.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
	});
	const payload = ticket.getPayload();
	const userid = payload["sub"];
}

// setInterval(() => {
//   console.log(queue);
//   console.log("________________________________");
// }, 1000);

// second update

// app.get("/getOnlineInfo", (req, res) => {

//   let temp = [];

//   for(let i=0;i<connected.length;i++){
//     temp[i] = JSON.parse(JSON.stringify(connected[i]));
//     temp[i].email = null;
//   }
//   console.log('got a req')
//   // let temp = CircularJSON.stringify(connected);
//   res.send(temp);
// });

function addPeople(person) {
	let res = fs.readFileSync("./database.db", { encoding: "utf8", flag: "r" });
	res = JSON.parse(res);

	if (
		res.peoples.find((elm) => {
			if (elm.email == person.email) {
				return true;
			}
		}) == undefined
	) {
		res.peoples.push({
			email: person.email,
			name: person.name,
			imageUrl: person.imageUrl,
			wins: 0,
			loose: 0,
		});
	}
	fs.writeFileSync("./database.db", JSON.stringify(res));
}

function addScore(email, inc) {
	let res = fs.readFileSync("./database.db", { encoding: "utf8", flag: "r" });
	res = JSON.parse(res);

	res.peoples.find((elm) => {
		if (elm.email == email) {
			if (inc) {
				elm.wins++;
			} else {
				elm.loose++;
			}
			return true;
		}
	});

	fs.writeFileSync("./database.db", JSON.stringify(res));
}

app.get("/getLeaderboard", (req, res) => {
	let toSend = fs.readFileSync("./database.db", {
		encoding: "utf8",
		flag: "r",
	});
	toSend = JSON.parse(toSend);
	res.send(toSend);
});
