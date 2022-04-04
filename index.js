const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.use(express.json());

// const User = require("./model/user");

// mongoose.connect("mongodb://localhost:27017/login-app-db", {
//   useNewUrlPasrer: true,
//   useUnifiedTopology: true,
// });

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
    this.match_id = this.p1.socketId + this.p2.socketId;
    if (Math.random() > 0.5) {
      this.p1.turn = true;
      this.p2.turn = false;
    } else {
      this.p1.turn = false;
      this.p2.turn = true;
    }
  }
}

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  //   res.send(path.join(__dirname, "public"));
});

io.on("connection", (socket) => {
  let person = new Person(socket.id);
  connected.push(person);

  socket.emit("welcome", person);
  socket.on("test", (data) => {});

  socket.on("toSearchingMode", (socketId) => {
    for (let i = 0; i < connected.length; i++) {
      if (connected[i].socketId == socketId) {
        connected[i].status = "searching";
        queue.push(connected[i]);
        findMatch();
      }
    }
  });

  socket.on("matchMoves", (data) => {
    io.to(data.to).emit("matchMoves", data);
  });

  socket.on("disconnect", () => {
    for (let i = 0; i < connected.length; i++) {
      if (connected[i].socketId == socket.id) {
        connected.splice(i, 1);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
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

// setInterval(() => {
//   for (let p of matches) {
//     console.log(p);
//   }
//   //   io.emit("test", connected);
//   console.log("_____________________________________________");
// }, 3000);

// google verification for web app

const { OAuth2Client } = require("google-auth-library");
const { default: mongoose } = require("mongoose");
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

app.post("/auth", (req, res) => {
  verify(req.body.id_token).catch(console.error);
  for (let i = 0; i < connected.length; i++) {
    if (connected[i].socketId == req.body.socketId) {
      connected[i].authinticated = true;
      connected[i].email = req.body.email;
      connected[i].name = req.body.name;
      connected[i].imageUrl = req.body.imageUrl;
    }
  }
  res.end();
});
