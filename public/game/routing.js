let socket = io();
let userProfile = JSON.parse(localStorage.getItem("userProfile"));
document.getElementById("usrName").textContent = userProfile.name.split(" ")[0];
let match;
let turn = false;
let searching = false;
let opponent;
let isWhite = false;
const rows = 7;
const pl = rows - 1;
const gridSize = rows * 2 - 1;
let allSet = false;
let playing = false;
let dots = 0;
let dotString = "....";
let yourLoc = {};
let opponentLoc = {};
let searchingAnimation;

document.getElementById("findRandom").addEventListener("click", (e) => {
  socket.emit("toSearchingMode", socketId);
  e.target.textContent = "Seacrhing...";
  searching = true;
  searchingAnimation = setInterval(() => {
    let elm = document.getElementById("findRandom");
    elm.textContent = "Seacrhing" + dotString.substring(0, dots);
    dots++;
    if (dots > 4) {
      dots = 0;
    }
  }, 300);
});

let socketId;
let you;

socket.on("welcome", (data) => {
  you = data;
  socketId = data.socketId;
  userProfile.socketId = data.socketId;
  socket.emit("setInfo", userProfile);
});

let arr = [];

socket.on("test", (data) => {
  arr = data;
});

socket.on("matched", (data) => {
  searching = false;
  playing = true;
  clearInterval(searchingAnimation);
  document.getElementById("findRandom").textContent = "Match Found";
  setTimeout(() => {
    document.getElementById("menu").style.display = "none";
    document.getElementById("container").style.display = "flex";
  }, 300);
  match = data;

  let myNode = document.getElementById("forOpponent");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  let myNode2 = document.getElementById("forYou");
  while (myNode2.firstChild) {
    myNode2.removeChild(myNode2.lastChild);
  }

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
  let yourCircle = document.createElement("div");
  let opponentCircle = document.createElement("div");
  yourCircle.className = "circle";
  opponentCircle.className = "circle";

  if (socketId == data.p1.socketId && data.p1.turn) {
    turn = true;
    isWhite = true;
    allSet = true;
    yourCircle.style.backgroundColor = "white";
    opponentCircle.style.backgroundColor = "black";

    document.getElementById("forOpponent").appendChild(namediv2);
    document.getElementById("forOpponent").appendChild(opponentCircle);
    document.getElementById("forOpponent").appendChild(imgdiv2);
    document.getElementById("forYou").appendChild(imgdiv1);
    document.getElementById("forYou").appendChild(yourCircle);
    document.getElementById("forYou").appendChild(namediv1);
    alert(`you have been matched to ${data.p2.name} and its your turn`);
  } else {
    document.getElementById("canvas-container").style.transform =
      "rotate(180deg)";
    isWhite = false;
    turn = false;
    allSet = true;
    yourCircle.style.backgroundColor = "black";
    opponentCircle.style.backgroundColor = "white";

    document.getElementById("forOpponent").appendChild(namediv2);
    document.getElementById("forOpponent").appendChild(opponentCircle);
    document.getElementById("forOpponent").appendChild(imgdiv2);
    document.getElementById("forYou").appendChild(imgdiv1);
    document.getElementById("forYou").appendChild(yourCircle);
    document.getElementById("forYou").appendChild(namediv1);
    alert(`You have been matched to ${data.p2.name} and its opponent turn`);
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
