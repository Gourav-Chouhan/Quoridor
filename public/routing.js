let socket = io();
let userProfile = {};
let match;
let turn = false;
let opponent;
let isWhite = false;
const rows = 7;
const pl = rows - 1;
const gridSize = rows * 2 - 1;
let allSet = false;

let yourLoc = {};
let opponentLoc = {};

document.getElementById("findRandom").addEventListener("click", (e) => {
  socket.emit("toSearchingMode", socketId);
  e.target.style.display = "none";
});

let socketId;
let you;

socket.on("welcome", (data) => {
  you = data;
  socketId = data.socketId;
  userProfile.socketId = data.socketId;
});

let arr = [];

socket.on("test", (data) => {
  console.log(data);
  arr = data;
});

socket.on("matched", (data) => {
  match = data;
  opponent = data.p2.name;
  let namediv1 = document.createElement("div");
  namediv1.innerText = data.p1.name;
  let imgdiv1 = document.createElement("img");
  imgdiv1.src = data.p1.imageUrl;
  imgdiv1.crossOrigin = "Anonymous";
  let namediv2 = document.createElement("div");
  namediv2.innerText = data.p2.name;
  let imgdiv2 = document.createElement("img");
  imgdiv2.src = data.p2.imageUrl;
  imgdiv2.crossOrigin = "Anonymous";

  document.getElementById("forOpponent").appendChild(namediv2);
  document.getElementById("forOpponent").appendChild(imgdiv2);
  document.getElementById("forYou").appendChild(imgdiv1);
  document.getElementById("forYou").appendChild(namediv1);

  if (socketId == data.p1.socketId && data.p1.turn) {
    turn = true;
    isWhite = true;
    allSet = true;
    alert(`you have been matched to ${data.p2.email} and its your turn`);
  } else {
    document.getElementById("canvas-container").style.transform =
      "rotate(180deg)";
    isWhite = false;
    turn = false;
    allSet = true;

    alert(`You have been matched to ${data.p2.email} and its opponent turn`);
  }

  setTimeout(() => {
    fireThatFunc();
  }, 1000);

  if (isWhite) {
    opponentLoc = {
      x: pl,
      y: 0,
      color: "black",
    };
    yourLoc = {
      x: pl,
      y: gridSize - 1,
      color: "white",
    };
  } else {
    yourLoc = {
      x: pl,
      y: 0,
      color: "black",
    };
    opponentLoc = {
      x: pl,
      y: gridSize - 1,
      color: "white",
    };
  }
});

socket.on("takeUsrInfo", (data) => {
  document.getElementById("usrName").textContent = userProfile.name;
});
